import { REST, Routes } from "discord.js";
import { RegisteredCommandInfo } from "../defs/RegisteredCommandInfo";

interface ApplicationCommandJSON {
  name: string;
  id: string;
}

export async function registerCommands(
  commands: RegisteredCommandInfo[],
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
  } else {
    await rest.put(Routes.applicationCommands(process.env.clientId!), {
      body: commands.map((r) => r.info.toJSON()),
    });
  }
}
