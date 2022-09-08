/* TODO:

*/

require("dotenv").config();
const REQUIRED_KEYS = [
  "token",
  "clientId",
  "devGuildId",
  "acceptedRole",
  "requiredRole",
];
const KEYS = Object.keys(process.env!);
const MISSING_KEYS = REQUIRED_KEYS.filter((r) => KEYS.includes(r) === false);
if (MISSING_KEYS.length > 0)
  throw new Error(
    "The .env file doesn't contain the following needed keys: " +
      MISSING_KEYS.join(", ")
  );

import { readdir } from "fs/promises";
import path, { join } from "path";
import { QuickDB } from "quick.db";
import { CommandInfo } from "./defs/CommandInfo";

import { Client, Collection, GatewayIntentBits } from "discord.js";
import { registerCommands } from "./util/register_commands";
import { EventInfo } from "./defs/EventInfo";
import { RegisteredCommandInfo } from "./defs/RegisteredCommandInfo";

declare module "discord.js" {
  export interface Client {
    commands: Collection<String, RegisteredCommandInfo>;
    categories: Collection<String, RegisteredCommandInfo[]>;
    db: QuickDB;
  }
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
client.commands = new Collection();
client.categories = new Collection();
client.db = new QuickDB({
  filePath: path.join(__dirname, "..", "database.sqlite"),
});

(async () => {
  const eventsPath = join(__dirname, "events");
  const eventFiles = (await readdir(eventsPath)).filter((r) =>
    r.endsWith(".js")
  );
  for (const eventFile of eventFiles) {
    const configuration: EventInfo = require(join(eventsPath, eventFile));
    if (configuration.once) {
      client.once(configuration.event, (...args) =>
        configuration.callback(client, ...args)
      );
    } else {
      client.on(configuration.event, (...args) => {
        return configuration.callback(client, ...args);
      });
    }
  }

  const commandsPath = join(__dirname, "commands");
  const folders = await readdir(commandsPath);
  let toBeRegistered: RegisteredCommandInfo[] = [];
  for (const folder of folders) {
    client.categories.set(folder, []);
    const folderPath = join(commandsPath, folder);
    const files = (await readdir(folderPath)).filter((r) => r.endsWith(".js"));
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
