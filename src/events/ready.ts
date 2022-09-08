import { Guild, GuildMember, Message, TextChannel } from "discord.js";
import { DBInfo, DBGuildInfo, DBGuildEntryInfo } from "../defs/DBInfo";
import { EventInfo } from "../defs/EventInfo";

export = {
  event: "ready",
  once: false,
  callback: async (client) => {
    console.log("Gates Awake");
    /* Confirm all existing guilds/channels */
    let registeredGuilds: DBInfo | null = await client.db.get("db");
    if (!registeredGuilds) {
      const freshDb: DBInfo = {
        guilds: {},
      };
      await client.db.set("db", freshDb);
      registeredGuilds = freshDb;
    }
    const guildEntries: [string, DBGuildInfo][] =
      Object.entries(registeredGuilds);
    for (let [guildId, info] of guildEntries) {
      let guild: Guild | null = null;
      try {
        guild = await client.guilds.fetch(guildId);
      } catch (e) {}
      if (!guild) {
        await client.db.delete(`db.guilds.${guildId}`);
        continue;
      }
      const ticketEntries: [string, DBGuildEntryInfo][] = Object.entries(
        info.entries
      );
      for (let [userId, ticketInfo] of ticketEntries) {
        let member: GuildMember | null = null;
        try {
          member = await guild.members.fetch(userId);
        } catch (e) {}
        if (!member) {
          let channel: TextChannel | null = null;
          try {
            channel = (await guild.channels.fetch(
              ticketInfo.channel_id
            )) as TextChannel;
          } catch (e) {}
          if (channel) {
            let message: Message | null = null;
            try {
              message = await channel.messages.fetch({
                message: ticketInfo.message_id,
              });
            } catch (e) {}
            if (message) {
              try {
                await message.delete();
              } catch (e) {}
            }
          }
          await client.db.delete(`db.guilds.${guildId}.entries.${userId}`);
        }
      }
    }
  },
} as EventInfo;
