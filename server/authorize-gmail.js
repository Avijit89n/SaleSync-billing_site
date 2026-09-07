import fs from "fs";
import http from "http";
import { google } from "googleapis";
import { URL } from "url";

const SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
];

const CREDENTIALS_PATH = "./credentials.json";
const TOKEN_PATH = "./token.json";

// -----------------------------------------------------
// READ GOOGLE CREDENTIALS
// -----------------------------------------------------

const credentials = JSON.parse(
    fs.readFileSync(CREDENTIALS_PATH, "utf8")
);

const { client_id, client_secret } = credentials.web;

// -----------------------------------------------------
// LOCAL CALLBACK SERVER
// -----------------------------------------------------

const REDIRECT_URI = "http://localhost:3000/oauth2callback";

const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    REDIRECT_URI
);

// -----------------------------------------------------
// GENERATE AUTHORIZATION URL
// -----------------------------------------------------

const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
});

console.log("\n========================================");
console.log("Open this URL in your browser:");
console.log("========================================\n");

console.log(authUrl);

console.log("\n========================================");
console.log("Waiting for Google authorization...");
console.log("========================================\n");

// -----------------------------------------------------
// LOCAL SERVER
// -----------------------------------------------------

const server = http.createServer(async (req, res) => {

    try {

        const requestUrl = new URL(
            req.url,
            `http://localhost:3000`
        );

        if (requestUrl.pathname !== "/oauth2callback") {
            res.writeHead(404);
            res.end("Not found");
            return;
        }

        const code = requestUrl.searchParams.get("code");

        const error = requestUrl.searchParams.get("error");

        if (error) {
            console.error("❌ Google authorization failed:");
            console.error(error);

            res.writeHead(400);
            res.end("Authorization failed. You can close this window.");

            server.close();

            return;
        }

        if (!code) {
            res.writeHead(400);
            res.end("Authorization code not found.");

            server.close();

            return;
        }

        console.log("Authorization code received.");

        // -------------------------------------------------
        // EXCHANGE CODE FOR TOKENS
        // -------------------------------------------------

        const { tokens } = await oAuth2Client.getToken(code);

        // -------------------------------------------------
        // SAVE TOKEN
        // -------------------------------------------------

        fs.writeFileSync(
            TOKEN_PATH,
            JSON.stringify(tokens, null, 2)
        );

        console.log("\n========================================");
        console.log("✅ GMAIL AUTHORIZATION SUCCESSFUL");
        console.log("========================================");

        console.log("\nToken saved to:");
        console.log(TOKEN_PATH);

        res.writeHead(200, {
            "Content-Type": "text/html",
        });

        res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>SaleSync Gmail Authorization</title>
</head>

<body
    style="
        font-family:Arial,sans-serif;
        text-align:center;
        padding:60px;
    "
>

    <h1>✅ Authorization Successful</h1>

    <p>
        SaleSync is now authorized to send emails
        using your Gmail account.
    </p>

    <p>
        You can close this window.
    </p>

</body>
</html>
        `);

        setTimeout(() => {
            server.close();
        }, 1000);

    } catch (error) {

        console.error("\n❌ Authorization error:");

        console.error(
            error.response?.data || error.message
        );

        res.writeHead(500);
        res.end("Authorization failed.");

        server.close();
    }
});

// -----------------------------------------------------
// START SERVER
// -----------------------------------------------------

server.listen(3000, () => {

    console.log(
        "Local OAuth server running at http://localhost:3000"
    );

    console.log(
        "\nOpen the authorization URL above."
    );
});