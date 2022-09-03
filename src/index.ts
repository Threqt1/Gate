require("dotenv").config();

import { readdir } from "fs/promises";
import { join } from "path";
import { CommandInfo } from "./defs/CommandInfo";

import { Client, Collection, GatewayIntentBits } from "discord.js";
import { registerCommands } from "./util/register_commands";
import { EventInfo } from "./defs/EventInfo";
import { RegisteredCommandInfo } from "./defs/RegisteredCommandInfo";

declare module "discord.js" {
  export interface Client {
    commands: Collection<String, RegisteredCommandInfo>;
    categories: Collection<String, RegisteredCommandInfo[]>;
  }
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});
client.commands = new Collection();
client.categories = new Collection();

(async () => {
  const eventsPath = join(__dirname, "events");
  const eventFiles = await (
    await readdir(eventsPath)
  ).filter((r) => r.endsWith(".js"));
  for (const eventFile of eventFiles) {
    const configuration: EventInfo = require(join(eventsPath, eventFile));
    if (configuration.once) {
      client.once(configuration.event, (...args) =>
        configuration.callback(client, args)
      );
    } else {
      client.on(configuration.event, (...args) =>
        configuration.callback(client, args)
      );
    }
  }

  const commandsPath = join(__dirname, "commands");
  const folders = await readdir(commandsPath);
  let toBeRegistered: RegisteredCommandInfo[] = [];
  for (const folder of folders) {
    client.categories.set(folder, []);
    const folderPath = join(commandsPath, folder);
    const files = await (
      await readdir(folderPath)
    ).filter((r) => r.endsWith(".js"));
    for (const file of files) {
      const configuration: CommandInfo = require(join(folderPath, file));
      toBeRegistered.push({
        callback: configuration.callback,
        info: configuration.info,
        category: folder,
      } as RegisteredCommandInfo);
    }
  }
  await registerCommands(toBeRegistered, true);
  for (let command of toBeRegistered) {
    client.categories.get(command.category)?.push(command);
    client.commands.set(command.info.name.toLowerCase(), command);
  }
  return client.login(process.env.token);
})();
