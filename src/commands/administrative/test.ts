import { SlashCommandBuilder } from "discord.js";
import { CommandInfo } from "../../defs/CommandInfo";

const configuration: CommandInfo = {
  callback: (client) => {},
  info: new SlashCommandBuilder().setName("test").setDescription("For testing"),
};

export { configuration };
