import { DBInfo } from "../defs/DBInfo";
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
        used_ids: [],
        guilds: {},
      };
      await client.db.set("db", freshDb);
      registeredGuilds = freshDb;
    }
    for (let [guildId, info] of Object.entries(registeredGuilds)) {
      let guild = null;
      try {
        guild = await client.guilds.fetch(guildId);
      } catch (e) {}
      if (!guild) {
        await client.db.delete(`db.guilds.${guildId}`);
        continue;
      }
    }
  },
} as EventInfo;
