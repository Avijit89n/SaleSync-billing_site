import "dotenv/config";
import { google } from "googleapis";
import express from "express";

const app = express();
const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  REDIRECT_URI
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/gmail.send"],
});

app.get("/oauth2callback", async (req, res) => {
  try {
    if (req.query.error) {
      res.status(400).send("Google authorization was denied.");
      return;
    }

    const code = req.query.code;

    if (!code) {
      res.status(400).send("Authorization code is missing.");
      return;
    }

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      res.status(400).send(
        "No refresh token received. Try revoking the previous app access and authorizing again."
      );
      return;
    }

    console.log("\nNew refresh token:\n");
    console.log(tokens.refresh_token);
    console.log("\nUpdate GMAIL_REFRESH_TOKEN in your .env file.");

    res.send("Gmail authorization successful. You can close this browser tab.");
    server.close();
  } catch (error) {
    console.error("OAuth error:", error.response?.data || error.message);
    res.status(500).send("Token generation failed. Check your backend terminal.");
  }
});

const server = app.listen(PORT, async () => {
  console.log(`Waiting for Google OAuth callback on ${REDIRECT_URI}`);
  console.log(`Authorization URL:\n${authUrl}`);

  // Open the URL manually if automatic browser opening fails.
});