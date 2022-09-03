import { SlashCommandBuilder } from "discord.js";
import { CommandInfo } from "../../defs/CommandInfo";

export = {
  callback: async (client, interaction) => {},
  info: new SlashCommandBuilder().setName("test").setDescription("For testing"),
} as CommandInfo;
