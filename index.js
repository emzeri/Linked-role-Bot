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

=======
import express from "express";
import fetch from "node-fetch";
import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import metadata from "./metadata.js";

dotenv.config();
const app = express();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const { CLIENT_ID, CLIENT_SECRET, BOT_TOKEN, REDIRECT_URI } = process.env;

// Register metadata
async function registerMetadata() {
  const res = await fetch(`https://discord.com/api/v10/applications/${CLIENT_ID}/role-connections/metadata`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${BOT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(metadata)
  });

  if (res.ok) {
    console.log("✅ Metadata registered");
  } else {
    console.error("❌ Failed to register metadata", await res.text());
  }
}

// OAuth login
app.get("/login", (req, res) => {
  const url = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&scope=role_connections.write&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&prompt=consent`;
  res.redirect(url);
});

// OAuth callback
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  const tokenRes = await fetch("https://discord.com/api/v10/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI
    })
  });

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  const updateRes = await fetch(`https://discord.com/api/v10/users/@me/applications/${CLIENT_ID}/role-connection`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      platform_name: "GitHub",
      platform_username: "zeri-dev",
      metadata: { github_verified: true }
    })
  });

  if (updateRes.ok) {
    res.send("🎉 Linked role updated! You now have the GitHub Verified badge.");
  } else {
    res.send("❌ Failed to update role connection.");
  }
});

// Start bot and server
client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
  registerMetadata();
});

client.login(BOT_TOKEN);
app.listen(3000, () => console.log("🌐 OAuth server running on http://localhost:3000"));
>>>>>>> 892daef (feat: linkedRoles hierarchy + embed attribution)
