require("dotenv").config();

import { readdir } from "fs/promises";
import { join } from "path";
import { CommandInfo } from "./defs/CommandInfo";

import { Client, GatewayIntentBits } from "discord.js";
import { registerCommands } from "./util/register_commands";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

(async () => {
  const commandsPath = join(__dirname, "commands");
  const folders = await readdir(commandsPath);
  let toBeRegistered: CommandInfo[] = [];
  for (const folder of folders) {
    const folderPath = join(commandsPath, folder);
    const files = await readdir(folderPath);
    for (const file of files) {
      if (!file.endsWith(".js")) continue;
      const configuration: CommandInfo = require(join(
        folderPath,
        file
      )).configuration;
      toBeRegistered.push(configuration);
    }
  }
  await registerCommands(toBeRegistered);
  return client.login(process.env.token);
})();
