import nodemailer from "nodemailer";

// =====================================================
// ENVIRONMENT CHECK
// =====================================================

console.log("========================================");
console.log("SaleSync Email Configuration");
console.log("EMAIL:", process.env.ADMIN_EMAIL);
console.log(
    "EMAIL PASSWORD EXISTS:",
    !!process.env.ADMIN_EMAIL_PASS
);
console.log(
    "EMAIL PASSWORD LENGTH:",
    process.env.ADMIN_EMAIL_PASS?.length
);
console.log("========================================");

// =====================================================
// GMAIL SMTP
// =====================================================

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASS,
    },
});

// =====================================================
// SMTP CONNECTION TEST
// =====================================================

transporter.verify((error) => {
    if (error) {
        console.error("========================================");
        console.error("❌ SMTP CONNECTION FAILED");
        console.error("code:", error.code);
        console.error("command:", error.command);
        console.error("response:", error.response);
        console.error("message:", error.message);
        console.error("========================================");
    } else {
        console.log("========================================");
        console.log("✅ SMTP CONNECTION SUCCESSFUL");
        console.log("========================================");
    }
});

// =====================================================
// SEND EMAIL
// =====================================================

export const sendEmail = async (to, otp) => {
    try {
        const info = await transporter.sendMail({
            from:
                '"SaleSync" <' +
                process.env.ADMIN_EMAIL +
                ">",

            to: to,

            subject: "Your SaleSync verification code",

            html: `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>SaleSync Verification Code</title>

<style>

html,
body {
    margin: 0;
    padding: 0;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
}

body,
td,
th {
    font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        Helvetica,
        Arial,
        sans-serif;

    color: #18181B;
    line-height: 1.6;
}

.wrapper {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    background-color: #F4F4F5;
    padding: 40px 12px;
    overflow-x: hidden;
}

.main-card {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    box-sizing: border-box;
    background-color: #ffffff;
    border-radius: 8px;

    box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.1),
        0 1px 2px rgba(0, 0, 0, 0.06);

    overflow: hidden;
}

.header {
    padding: 32px 32px 0;
    text-align: center;
    box-sizing: border-box;
}

.brand-name {
    font-size: 26px;
    font-weight: 800;
    color: #ff6f00;
    letter-spacing: -0.5px;
    margin: 0;
}

.tagline {
    font-size: 13px;
    color: #71717A;
    font-weight: 500;
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.content {
    padding: 32px;
    box-sizing: border-box;
}

.h1-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 16px;
    text-align: center;
}

.text-body {
    font-size: 15px;
    color: #3F3F46;
    margin-bottom: 24px;
    text-align: center;
}

.otp-container {
    width: 100%;
    max-width: 100%;
    text-align: center;
    margin: 32px 0;
    box-sizing: border-box;
    overflow: hidden;
}

.otp-box {
    display: inline-block;
    max-width: 100%;
    box-sizing: border-box;
    background-color: #FFF7ED;
    border: 1px solid #FED7AA;
    border-radius: 10px;
    padding: 18px 28px;
}

.otp {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: 8px;
    color: #EA580C;
    line-height: 1;

    font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        Helvetica,
        Arial,
        sans-serif;

    white-space: nowrap;
}

.expiry {
    text-align: center;
    font-size: 13px;
    color: #71717A;
    margin-top: 24px;
}

.divider {
    height: 1px;
    background-color: #E4E4E7;
    margin: 24px 0;
    border: none;
}

.footer {
    width: 100%;
    box-sizing: border-box;
    background-color: #F4F4F5;
    padding: 24px;
    text-align: center;
    font-size: 12px;
    color: #A1A1AA;
}

@media only screen and (max-width: 520px) {

    html,
    body {
        width: 100%;
        max-width: 100%;
        overflow-x: hidden;
    }

    .wrapper {
        width: 100%;
        max-width: 100%;
        padding: 20px 12px;
        box-sizing: border-box;
        overflow-x: hidden;
    }

    .main-card {
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
    }

    .header {
        padding: 28px 20px 0;
    }

    .content {
        padding: 24px 20px;
    }

    .otp-container {
        width: 100%;
        max-width: 100%;
        overflow: hidden;
    }

    .otp-box {
        max-width: 100%;
        padding: 16px 20px;
    }

    .otp {
        font-size: 28px;
        letter-spacing: 6px;
    }

    .footer {
        width: 100%;
        box-sizing: border-box;
    }
}

</style>

</head>

<body>

<div class="wrapper">

<div class="main-card">

<div class="header">

<div class="brand-name">
    SaleSync
</div>

<div class="tagline">
    Sync sales. Simplify billing.
</div>

</div>

<div class="content">

<hr class="divider">

<h1 class="h1-title">
    Verify your email address
</h1>

<p class="text-body">
    You recently registered for a SaleSync account.
    Use the verification code below to verify your email address
    and secure your account.
</p>

<div class="otp-container">

<div class="otp-box">

<div class="otp">
    ${otp}
</div>

</div>

</div>

<p class="expiry">
    This verification code expires in
    <strong>10 minutes</strong>.
</p>

<hr class="divider">

<p
    class="text-body"
    style="font-size:13px;margin-bottom:0;color:#71717A;"
>
    If you didn't create a SaleSync account,
    you can safely ignore this email.
</p>

</div>

<div class="footer">
    &copy; ${new Date().getFullYear()}
    SaleSync Inc. All rights reserved.
</div>

</div>

</div>

</body>

</html>
            `,
        });

        console.log(
            "✅ Verification OTP email sent:",
            info.messageId
        );

        return info;

    } catch (error) {

        console.error("========================================");
        console.error("❌ EMAIL SENDING FAILED");
        console.error("code:", error.code);
        console.error("command:", error.command);
        console.error("response:", error.response);
        console.error("responseCode:", error.responseCode);
        console.error("message:", error.message);
        console.error("========================================");

        throw error;
    }
};