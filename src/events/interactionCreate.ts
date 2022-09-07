import { BaseInteraction } from "discord.js";
import { EventInfo } from "../defs/EventInfo";

export = {
  event: "interactionCreate",
  once: false,
  callback: async (client, interaction: BaseInteraction) => {
    if (!interaction.isChatInputCommand()) return;

    let command = client.commands.get(interaction.commandName.toLowerCase());
    if (command) command.callback(client, interaction);
  },
} as EventInfo;
