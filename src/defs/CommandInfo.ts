import { Client, SlashCommandBuilder } from "discord.js";

export interface CommandInfo {
  callback: (client: Client, ...args: any) => void;
  info: SlashCommandBuilder;
}
