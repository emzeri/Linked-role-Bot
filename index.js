require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { linkedRoles, attribution } = require("./metadata");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.content === "!linkedroles") {
    const embed = new EmbedBuilder()
      .setTitle("Linked Roles")
      .setDescription("Here are the available linked roles:")
      .setColor(0x00AE86)
      .setFooter({
        text: attribution.footerText,
        iconURL: client.user.displayAvatarURL() || attribution.footerIcon
      });

    // Sort by position (descending: Owner > Manager > Mod > Member)
    linkedRoles
      .sort((a, b) => b.position - a.position)
      .forEach(role => {
        embed.addFields({ name: role.name, value: role.description, inline: false });
      });

    message.channel.send({ embeds: [embed] });
  }
});

client.login(process.env.BOT_TOKEN);
