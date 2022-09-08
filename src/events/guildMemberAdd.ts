import {
  EmbedBuilder,
  Guild,
  GuildMember,
  Message,
  TextChannel,
} from "discord.js";
import { DBGuildInfo } from "../defs/DBInfo";
import { EventInfo } from "../defs/EventInfo";

export = {
  event: "guildMemberAdd",
  once: false,
  callback: async (client, member: GuildMember) => {
    let guild: Guild | null = null;
    try {
      guild = await member.guild.fetch();
    } catch (e) {}
    if (guild && guild.available) {
      let guildData: DBGuildInfo | null = await client.db.get(
        `db.guilds.${guild.id}`
      );
      if (!guildData) {
        const updatedInfo: DBGuildInfo = {
          entry_channel: null,
          entries: {},
        };
        await client.db.set(`db.guilds.${guild.id}`, updatedInfo);
        guildData = updatedInfo;
      }
      const previousEntry = guildData.entries[member.id];
      if (previousEntry) {
        let prevChannel: TextChannel | null = null;
        try {
          prevChannel = (await guild.channels.fetch(
            previousEntry.channel_id
          )) as TextChannel;
        } catch (e) {}
        if (prevChannel) {
          let prevMessage: Message | null = null;
          try {
            prevMessage = await prevChannel.messages.fetch({
              message: previousEntry.message_id,
            });
          } catch (e) {}
          if (prevMessage) {
            try {
              await prevMessage.delete();
            } catch (e) {}
          }
        }
      }
      let channel: TextChannel | null = null;
      if (guildData.entry_channel) {
        try {
          channel = (await guild.channels.fetch(guildData.entry_channel, {
            force: true,
          })) as TextChannel;
        } catch (e) {}
      }
      if (!channel) {
        if (!guild.systemChannelId) return;
        try {
          channel = (await guild.channels.fetch(guild.systemChannelId, {
            force: true,
          })) as TextChannel;
        } catch (e) {}
        if (!channel) {
          return;
        }
        guildData.entry_channel = guild.systemChannelId;
      }
      const Embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle(`Join Request`)
        .setAuthor({
          name: member.user.username,
          iconURL: member.displayAvatarURL(),
        })
        .setDescription(
          `Type \`/joins accept \`${member.toString()} to accept this user\nType \`/joins reject \`${member.toString()} to reject this user`
        )
        .setTimestamp();
      const message = await channel.send({
        embeds: [Embed],
      });
      guildData.entries[member.id] = {
        channel_id: channel.id,
        message_id: message.id,
      };
      return client.db.set(`db.guilds.${guild.id}`, guildData);
    }
  },
} as EventInfo;
