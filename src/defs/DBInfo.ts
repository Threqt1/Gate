export interface DBGuildEntryInfo {
  channel_id: string;
  message_id: string;
}

export interface DBGuildInfo {
  entry_channel: string | null;
  entries: {
    [user_id: string]: DBGuildEntryInfo;
  };
}

export interface DBInfo {
  guilds: {
    [guild_id: string]: DBGuildInfo;
  };
}
