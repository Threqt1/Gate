import { Guild, GuildMember, Message, TextChannel } from "discord.js";
import { DBGuildEntryInfo, DBGuildInfo } from "../defs/DBInfo";
import { EventInfo } from "../defs/EventInfo";

export = {
  event: "guildMemberRemove",
  once: false,
  callback: async (client, member: GuildMember) => {
    let guild: Guild | null = null;
    try {
      guild = await client.guilds.fetch(member);
    } catch (e) {}
    if (guild && guild.available) {
      const possibleEntry: DBGuildEntryInfo | null = await client.db.get(
        `db.guilds.${guild.id}.entries.${member.id}`
      );
      if (possibleEntry) {
        let channel: TextChannel | null = null;
        try {
          channel = (await guild.channels.fetch(
            possibleEntry.channel_id
          )) as TextChannel;
        } catch (e) {}
        if (channel) {
          let message: Message | null = null;
          try {
            message = await channel.messages.fetch({
              message: possibleEntry.message_id,
            });
          } catch (e) {}
          if (message) {
            try {
              await message.delete();
            } catch (e) {}
          }
        }
        return client.db.delete(`db.guilds.${guild.id}.entries.${member.id}`);
      }
    }
  },
} as EventInfo;
