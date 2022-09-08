import { GuildMember, SlashCommandBuilder } from "discord.js";
import { CommandInfo } from "../../defs/CommandInfo";

export = {
  callback: async (client, interaction) => {
    await interaction.deferReply();
    if (
      ["637098379377246229", "811273777933189191"].includes(
        interaction.user.id
      ) === false
    )
      return interaction.editReply("You cannot execute this command!");
    const emitted = interaction.options.getString("event");
    await interaction.editReply("Emitting " + emitted + " event...");
    if (interaction.guild) {
      let me: GuildMember | null = null;
      try {
        me = await interaction.guild.members.fetchMe();
      } catch (e) {}
      if (me) {
        switch (emitted) {
          case "guildMemberAdd":
            return client.emit("guildMemberAdd", me);
          case "guildMemberRemove":
            return client.emit("guildMemberRemove", me);
          default:
            return;
        }
      }
    }
  },
  info: new SlashCommandBuilder()
    .setName("test")
    .setDescription("For testing")
    .addStringOption((option) => {
      return option
        .setName("event")
        .setDescription("The event to emit")
        .setRequired(true)
        .addChoices(
          {
            name: "Guild Member Add",
            value: "guildMemberAdd",
          },
          {
            name: "Guild Member Remove",
            value: "guildMemberRemove",
          }
        );
    }),
} as CommandInfo;
