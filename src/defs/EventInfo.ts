import { Client } from "discord.js";

export interface EventInfo {
  event: string;
  once: boolean;
  callback: (client: Client, ...args: any) => void;
}
