const express = require("express");
const axios = require("axios");
const qs = require("querystring");
const app = express();
const PORT = process.env.PORT || 3000;

require("dotenv").config();

// Health check route
app.get("/", (req, res) => {
  res.send("✅ Server is up and running!");
});

// Linked Role verification route
app.get("/linked-role", async (req, res) => {
  const code = req.query.code;
  console.log("🔑 Received code:", code);

  if (!code) return res.status(400).send("Missing code");

  try {
    console.log("📡 Exchanging code for token...");
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      qs.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.REDIRECT_URI,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenRes.data.access_token;
    console.log("✅ Token received:", accessToken);

    console.log("👤 Fetching user info...");
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const user = userRes.data;
    console.log(`🎉 Linked role verified for ${user.username}#${user.discriminator}`);

    res.send("✅ Linked Role verification successful!");
  } catch (err) {
    console.error("❌ Verification failed:", err.response?.data || err.message);
    res.status(500).send("❌ Verification failed.");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
