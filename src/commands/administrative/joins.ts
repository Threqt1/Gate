import {
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  GuildMember,
  Message,
  Role,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { CommandInfo } from "../../defs/CommandInfo";
import { DBGuildEntryInfo, DBGuildInfo } from "../../defs/DBInfo";

async function acceptUser(
  client: Client,
  interaction: ChatInputCommandInteraction
) {
  let member = interaction.options.getMember("user") as GuildMember | null;
  if (!interaction.guild || !member)
    return interaction.editReply("Command not executed in a guild!");
  let guildData: DBGuildInfo | null = await client.db.get(
    `db.guilds.${interaction.guild.id}`
  );
  if (!guildData) {
    const updatedInfo: DBGuildInfo = {
      entry_channel: null,
      entries: {},
    };
    await client.db.set(`db.guilds.${interaction.guild.id}`, updatedInfo);
    guildData = updatedInfo;
  }
  let entry: DBGuildEntryInfo | null = guildData.entries[member.user.id];
  if (!entry) return interaction.editReply("User has no join request active!");
  let channel: TextChannel | null = null;
  try {
    channel = (await interaction.guild.channels.fetch(entry.channel_id, {
      force: true,
      cache: false,
    })) as TextChannel;
  } catch (e) {}
  if (channel) {
    let message: Message | null = null;
    try {
      message = await channel.messages.fetch({
        message: entry.message_id,
        force: true,
        cache: false,
      });
    } catch (e) {}
    if (message) {
      try {
        await message.delete();
      } catch (e) {}
    }
  }
  await client.db.delete(
    `db.guilds.${interaction.guild.id}.entries.${member.user.id}`
  );
  let role: Role | null = null;
  try {
    role = await interaction.guild.roles.fetch(process.env.acceptedRole!);
  } catch (e) {}
  if (role) {
    try {
      member.roles.add(role);
    } catch (e) {}
  }
  return interaction.editReply("Successfully accepted user!");
}

async function rejectUser(
  client: Client,
  interaction: ChatInputCommandInteraction
) {
  let member = interaction.options.getMember("user") as GuildMember | null;
  if (!interaction.guild || !member)
    return interaction.editReply("Command not executed in a guild!");
  let guildData: DBGuildInfo | null = await client.db.get(
    `db.guilds.${interaction.guild.id}`
  );
  if (!guildData) {
    const updatedInfo: DBGuildInfo = {
      entry_channel: null,
      entries: {},
    };
    await client.db.set(`db.guilds.${interaction.guild.id}`, updatedInfo);
    guildData = updatedInfo;
  }
  let entry: DBGuildEntryInfo | null = guildData.entries[member.user.id];
  if (!entry) return interaction.editReply("User has no join request active!");
  let channel: TextChannel | null = null;
  try {
    channel = (await interaction.guild.channels.fetch(entry.channel_id, {
      force: true,
      cache: false,
    })) as TextChannel;
  } catch (e) {}
  if (channel) {
    let message: Message | null = null;
    try {
      message = await channel.messages.fetch({
        message: entry.message_id,
        force: true,
        cache: false,
      });
    } catch (e) {}
    if (message) {
      try {
        await message.delete();
      } catch (e) {}
    }
  }
  await client.db.delete(
    `db.guilds.${interaction.guild.id}.entries.${member.user.id}`
  );
  try {
    await member.kick();
  } catch (e) {}
  return interaction.editReply("Successfully rejected user!");
}

async function setChannel(
  client: Client,
  interaction: ChatInputCommandInteraction
) {
  if (!interaction.guild)
    return interaction.editReply("Command not executed in a guild!");
  let guildData: DBGuildInfo | null = await client.db.get(
    `db.guilds.${interaction.guild.id}`
  );
  if (!guildData) {
    const updatedInfo: DBGuildInfo = {
      entry_channel: null,
      entries: {},
    };
    await client.db.set(`db.guilds.${interaction.guild.id}`, updatedInfo);
    guildData = updatedInfo;
  }
  let channel: TextChannel = interaction.options.getChannel(
    "channel"
  ) as TextChannel;
  guildData.entry_channel = channel.id;
  await client.db.set(`db.guilds.${interaction.guild.id}`, guildData);
  return interaction.editReply(
    `Channel successfully set to ${channel.toString()}`
  );
}

async function listRequests(
  client: Client,
  interaction: ChatInputCommandInteraction
) {
  if (!interaction.guild)
    return interaction.editReply("Command not executed in a guild!");
  let guildData: DBGuildInfo | null = await client.db.get(
    `db.guilds.${interaction.guild.id}`
  );
  if (!guildData) {
    const updatedInfo: DBGuildInfo = {
      entry_channel: null,
      entries: {},
    };
    await client.db.set(`db.guilds.${interaction.guild.id}`, updatedInfo);
    guildData = updatedInfo;
  }
  let description = "__**Currently Active Requests:**__\n";
  let entries: [string, DBGuildEntryInfo][] = Object.entries(guildData.entries);
  for (let [userId, info] of entries) {
    description += `**•** Request by <@${userId}>\n`;
  }
  let Embed = new EmbedBuilder()
    .setColor("Orange")
    .setTitle("Currently Active Join Requests")
    .setDescription(description.trim())
    .setTimestamp();
  return interaction.editReply({ embeds: [Embed] });
}

export = {
  callback: async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: true,
    });
    switch (interaction.options.getSubcommand()) {
      case "accept":
        return acceptUser(client, interaction);
      case "reject":
        return rejectUser(client, interaction);
      case "channel":
        return setChannel(client, interaction);
      case "list":
        return listRequests(client, interaction);
      default:
        return interaction.editReply("Failed due to invalid syntax");
    }
  },
  info: new SlashCommandBuilder()
    .setName("joins")
    .setDescription("Accept or reject a join")
    .addSubcommand((subCommand) =>
      subCommand
        .setName("accept")
        .setDescription("Accept a user's join request")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to accept")
            .setRequired(true)
        )
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("reject")
        .setDescription("Reject a user's join request")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to reject")
            .setRequired(true)
        )
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("channel")
        .setDescription("Set the channel for join requests")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel to set as the join request channel")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("list")
        .setDescription("List all current join requests")
    ),
} as CommandInfo;
