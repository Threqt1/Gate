import {
  EmbedBuilder,
  Guild,
  GuildMember,
  Message,
  TextChannel,
} from "discord.js";
import { DBGuildInfo } from "../defs/DBInfo";
import { EventInfo } from "../defs/EventInfo";
import { generateId } from "../util/generate_id";

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
            prevMessage = await prevChannel.messages.fetch(
              previousEntry.message_id
            );
          } catch (e) {}
          if (prevMessage) {
            await prevMessage.delete();
          }
        }
        await client.db.pull(`db.used_ids`, previousEntry.id);
      }
      let channel: TextChannel | null = null;
      if (guildData.entry_channel) {
        try {
          channel = (await guild.channels.fetch(
            guildData.entry_channel
          )) as TextChannel;
        } catch (e) {}
      }
      if (!channel) {
        if (!guild.systemChannelId) return;
        try {
          channel = (await guild.channels.fetch(
            guild.systemChannelId
          )) as TextChannel;
        } catch (e) {}
        if (!channel) {
          return;
        }
        const updatedInfo = Object.assign(guildData, {
          entry_channel: guild.systemChannelId,
        });
        guildData = updatedInfo;
      }
      let currentIds: string[] | null = await client.db.get("db.used_ids");
      if (!currentIds) currentIds = [];
      let joinId = generateId();
      while (currentIds.includes(joinId)) joinId = generateId();
      const Embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle(`Join Request #${joinId}`)
        .setAuthor({
          name: member.user.username,
          iconURL: member.displayAvatarURL(),
        })
        .setDescription(member.toString())
        .setFooter({
          text: `/joins accept ${joinId}`,
        })
        .setTimestamp();
      const message = await channel.send({
        embeds: [Embed],
      });
      guildData.entries[member.id] = {
        id: joinId,
        channel_id: channel.id,
        message_id: message.id,
      };
      await client.db.push(`db.used_ids`, joinId);
      return client.db.set(`db.guilds.${guild.id}`, guildData);
    }
  },
} as EventInfo;