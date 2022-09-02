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
    let existingCommands: ApplicationCommandJSON[] = (await rest.get(
      Routes.applicationGuildCommands(
        process.env.clientId!,
        process.env.devGuildId!
      )
    )) as ApplicationCommandJSON[];

    let remainingCommands: ApplicationCommandJSON[] = [];

    for (let existingCommand of existingCommands) {
      if (
        !commands.find(
          (r) =>
            r.info.name.toLowerCase() === existingCommand.name.toLowerCase()
        )
      ) {
        await rest.delete(
          Routes.applicationGuildCommand(
            process.env.clientId!,
            process.env.devGuildId!,
            existingCommand.id
          )
        );
      } else {
        remainingCommands.push(existingCommand);
      }
    }

    let toBeRegistered: RESTPatchAPIApplicationCommandJSONBody[] = [];

    for (let possibleCommand of commands) {
      if (
        !remainingCommands.find(
          (r) =>
            r.name.toLowerCase() === possibleCommand.info.name.toLowerCase()
        )
      ) {
        toBeRegistered.push(possibleCommand.info.toJSON());
      }
    }

    if (toBeRegistered.length > 0) {
      toBeRegistered = toBeRegistered.concat(remainingCommands);
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.clientId!,
          process.env.devGuildId!
        ),
        {
          body: toBeRegistered,
        }
      );
    }
  }
}
