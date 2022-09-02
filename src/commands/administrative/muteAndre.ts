import { SlashCommandBuilder } from "discord.js";
import { CommandInfo } from "../../defs/CommandInfo";

const configuration: CommandInfo = {
  callback: (client) => {},
  info: new SlashCommandBuilder()
    .setName("muteandre")
    .setDescription("Mutes andre"),
};

export { configuration };
