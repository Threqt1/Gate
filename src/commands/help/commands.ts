import { SlashCommandBuilder } from "discord.js";
import { CommandInfo } from "../../defs/CommandInfo";

const configuration: CommandInfo = {
  callback: (client) => {},
  info: new SlashCommandBuilder()
    .setName("commands")
    .setDescription("Returns all the commands for the bot"),
};

export { configuration };
