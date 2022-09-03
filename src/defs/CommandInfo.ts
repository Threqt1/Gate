import {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
} from "discord.js";

export interface CommandInfo {
  callback: (client: Client, interaction: ChatInputCommandInteraction) => void;
  info: SlashCommandBuilder;
}
