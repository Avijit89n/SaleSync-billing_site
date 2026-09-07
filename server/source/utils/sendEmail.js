import fs from "fs";
import path from "path";
import crypto from "crypto";
import { google } from "googleapis";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================================================
// GOOGLE CREDENTIALS
// ======================================================

const credentialsPath = path.resolve(
    __dirname,
    "../../credentials.json"
);

const tokenPath = path.resolve(
    __dirname,
    "../../token.json"
);

const credentials = JSON.parse(
    fs.readFileSync(credentialsPath, "utf8")
);

const { client_id, client_secret } = credentials.web;

const token = JSON.parse(
    fs.readFileSync(tokenPath, "utf8")
);

// ======================================================
// GMAIL AUTHENTICATION
// ======================================================

const auth = new google.auth.OAuth2(
    client_id,
    client_secret
);

auth.setCredentials(token);

const gmail = google.gmail({
    version: "v1",
    auth,
});

// ======================================================
// BASE64URL ENCODER
// ======================================================

const encodeMessage = (message) => {
    return Buffer.from(message, "utf8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
};

// ======================================================
// EMAIL VALIDATION
// ======================================================

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ======================================================
// SEND VERIFICATION EMAIL
// ======================================================

export const sendEmail = async (to, otp) => {
    try {
        if (!to || !isValidEmail(to)) {
            throw new Error("Invalid recipient email address");
        }

        if (!otp) {
            throw new Error("OTP is required");
        }

        const senderEmail = "salesync.official@gmail.com";

        // Unique ID for every email
        const messageId = `<${crypto.randomUUID()}@gmail.com>`;

        // ==================================================
        // PLAIN TEXT VERSION
        // ==================================================

        const text = `
Verify your SaleSync email address

Your verification code is:

${otp}

This code expires in 10 minutes.

If you did not create a SaleSync account, you can ignore this email.

SaleSync
        `.trim();

        // ==================================================
        // HTML VERSION
        // ==================================================

        const html = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>SaleSync Verification Code</title>
</head>

<body
    style="
        margin:0;
        padding:0;
        background:#f4f4f5;
        font-family:Arial,Helvetica,sans-serif;
        color:#18181b;
    "
>

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background:#f4f4f5;"
>

<tr>
<td
    align="center"
    style="padding:40px 16px;"
>

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        max-width:480px;
        background:#ffffff;
        border:1px solid #e4e4e7;
        border-radius:10px;
    "
>

<!-- HEADER -->

<tr>
<td
    align="center"
    style="padding:30px 24px 10px;"
>

<div
    style="
        font-size:25px;
        font-weight:bold;
        color:#ea580c;
    "
>
    SaleSync
</div>

</td>
</tr>

<!-- CONTENT -->

<tr>
<td
    style="
        padding:20px 32px 32px;
    "
>

<h1
    style="
        margin:0 0 18px;
        font-size:21px;
        line-height:1.4;
        font-weight:600;
        text-align:center;
        color:#18181b;
    "
>
    Verify your email address
</h1>

<p
    style="
        margin:0 0 24px;
        font-size:15px;
        line-height:1.6;
        color:#52525b;
        text-align:center;
    "
>
    Enter the verification code below to complete
    your SaleSync registration.
</p>

<!-- OTP -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
>

<tr>
<td align="center">

<div
    style="
        display:inline-block;
        padding:18px 26px;
        background:#fff7ed;
        border:1px solid #fed7aa;
        border-radius:8px;
    "
>

<span
    style="
        font-size:30px;
        line-height:1;
        font-weight:bold;
        letter-spacing:7px;
        color:#ea580c;
    "
>
    ${otp}
</span>

</div>

</td>
</tr>

</table>

<p
    style="
        margin:22px 0 0;
        font-size:13px;
        line-height:1.5;
        color:#71717a;
        text-align:center;
    "
>
    This code expires in <strong>10 minutes</strong>.
</p>

<hr
    style="
        margin:28px 0;
        border:0;
        border-top:1px solid #e4e4e7;
    "
>

<p
    style="
        margin:0;
        font-size:13px;
        line-height:1.6;
        color:#71717a;
        text-align:center;
    "
>
    If you did not create a SaleSync account,
    you can safely ignore this email.
</p>

</td>
</tr>

<!-- FOOTER -->

<tr>
<td
    align="center"
    style="
        padding:20px 24px;
        background:#fafafa;
        border-top:1px solid #f4f4f5;
        border-radius:0 0 10px 10px;
    "
>

<p
    style="
        margin:0;
        font-size:12px;
        line-height:1.5;
        color:#a1a1aa;
    "
>
    This is an automated message from SaleSync.
</p>

</td>
</tr>

</table>

</td>
</tr>

</table>

</body>
</html>
        `.trim();

        // ==================================================
        // MULTIPART MIME EMAIL
        // ==================================================

        const boundary = `SaleSyncBoundary_${crypto.randomUUID()}`;

        const message = [
            `From: SaleSync <${senderEmail}>`,
            `To: ${to}`,
            `Reply-To: ${senderEmail}`,
            `Subject: Your SaleSync verification code`,
            `Date: ${new Date().toUTCString()}`,
            `Message-ID: ${messageId}`,
            `MIME-Version: 1.0`,
            `Auto-Submitted: auto-generated`,
            `Content-Type: multipart/alternative; boundary="${boundary}"`,
            "",
            `--${boundary}`,
            `Content-Type: text/plain; charset="UTF-8"`,
            `Content-Transfer-Encoding: 8bit`,
            "",
            text,
            "",
            `--${boundary}`,
            `Content-Type: text/html; charset="UTF-8"`,
            `Content-Transfer-Encoding: 8bit`,
            "",
            html,
            "",
            `--${boundary}--`,
        ].join("\r\n");

        // ==================================================
        // SEND THROUGH GMAIL API
        // ==================================================

        const response = await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodeMessage(message),
            },
        });

        console.log("========================================");
        console.log("✅ SALESync OTP EMAIL SENT");
        console.log("========================================");
        console.log("Recipient:", to);
        console.log("Message ID:", response.data.id);
        console.log("========================================");

        return response.data;

    } catch (error) {

        console.error("========================================");
        console.error("❌ GMAIL API EMAIL ERROR");
        console.error("========================================");

        console.error(
            error.response?.data || error.message
        );

        console.error("========================================");

        throw error;
    }
};