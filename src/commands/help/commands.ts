import {
  ActionRowBuilder,
  Collection,
  ComponentType,
  EmbedBuilder,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { CommandInfo } from "../../defs/CommandInfo";

export = {
  callback: async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: true,
    });
    let BaseEmbed = new EmbedBuilder().setTitle("Commands").setColor("Orange");
    let Pages: Collection<string, EmbedBuilder> = new Collection();
    let ActionRow = new ActionRowBuilder();
    let SelectMenu = new SelectMenuBuilder()
      .setPlaceholder("Select a Command Category")
      .setCustomId("commandsMenu");
    let SelectMenuOptions: SelectMenuOptionBuilder[] = [];
    for (let [category, commands] of client.categories) {
      let NormalCaseCategory =
        category.charAt(0).toUpperCase() + category.slice(1);
      let CategoryEmbed = new EmbedBuilder(BaseEmbed.data).setTitle(
        BaseEmbed.data.title! + " - " + NormalCaseCategory
      );
      let description = "";
      for (let command of commands) {
        description += `**•** /${command.info.name}\n`;
      }
      CategoryEmbed.setDescription(description.trim());
      Pages.set(category.toString(), CategoryEmbed);
      SelectMenuOptions.push(
        new SelectMenuOptionBuilder()
          .setLabel(NormalCaseCategory)
          .setDescription(NormalCaseCategory + " commands")
          .setValue(category.toString())
      );
    }
    SelectMenu.addOptions(...SelectMenuOptions);
    ActionRow.addComponents(SelectMenu);
    const message = await interaction.editReply({
      embeds: [Pages.get(SelectMenuOptions[0].data.value!)!],
      components: [ActionRow as any],
    });
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.SelectMenu,
      time: 8000,
    });

    collector.on("collect", async (i) => {
      await i.deferUpdate();
      await i.editReply({ embeds: [Pages.get(i.values[0])!] });
      collector.resetTimer();
    });
  },
  info: new SlashCommandBuilder()
    .setName("commands")
    .setDescription("Returns all the commands for the bot"),
} as CommandInfo;
