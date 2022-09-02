import { CommandInfo } from "../defs/CommandInfo";
import { REST } from "@discordjs/rest";
import { RESTPatchAPIApplicationCommandJSONBody, Routes } from "discord.js";

interface ApplicationCommandJSON {
  name: string;
  id: string;
}

export async function registerCommands(
  commands: CommandInfo[],
  locally: boolean = true
) {
  const rest = new REST({ version: "10" }).setToken(process.env.token!);
  if (locally) {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.clientId!,
        process.env.devGuildId!
      ),
      {
        body: commands.map((r) => r.info.toJSON()),
      }
    );
  }
}
