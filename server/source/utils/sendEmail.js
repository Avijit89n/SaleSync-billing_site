import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASS,
    },
});

export const sendEmail = async (to, token) => {

    const varificationURL = `${process.env.CLIENT_URL}/auth/email-verify?token=${token}&email=${to}`

    const info = await transporter.sendMail({
        from: `"SaleSync" <${process.env.ADMIN_EMAIL}>`,
        to,
        subject: "Verify your email address",
        html:
            `<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Verify your email</title>
                <style>
                    /* RESET */
                    body { margin: 0; padding: 0; -webkit-font-smoothing: antialiased; word-spacing: normal; background-color: #F4F4F5; }
                    table { border-collapse: collapse; width: 100%; }
                    
                    /* TYPOGRAPHY */
                    body, td, th {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    color: #18181B; /* Zinc-900 (Almost Black) */
                    line-height: 1.6;
                    }

                    /* CONTAINER */
                    .wrapper { width: 100%; table-layout: fixed; background-color: #F4F4F5; padding: 40px 0; }
                    .main-card {
                    max-width: 480px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
                    overflow: hidden;
                    }

                    /* BRAND HEADER */
                    .header {
                    padding: 32px 32px 0 32px;
                    text-align: center;
                    }
                    .brand-name {
                    font-size: 26px;
                    font-weight: 800; /* Extra bold for impact */
                    color: #ff6f00;
                    letter-spacing: -0.5px;
                    margin: 0;
                    }
                    .tagline {
                    font-size: 13px;
                    color: #71717A; /* Zinc-500 */
                    font-weight: 500;
                    margin-top: 4px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    }

                    /* CONTENT */
                    .content { padding: 32px; }
                    
                    .h1-title {
                    font-size: 20px;
                    font-weight: 600;
                    margin-top: 0;
                    margin-bottom: 16px;
                    text-align: center;
                    }

                    .text-body {
                    font-size: 15px;
                    color: #3F3F46; /* Zinc-700 */
                    margin-bottom: 24px;
                    text-align: center;
                    }

                    /* BUTTON */
                    .btn-container { text-align: center; margin: 32px 0; }
                    .btn:hover { background-color: #e65100; }

                    /* FOOTER */
                    .footer {
                    background-color: #F4F4F5; /* Matches body bg */
                    padding: 24px;
                    text-align: center;
                    font-size: 12px;
                    color: #A1A1AA;
                    }
                    
                    /* DIVIDER */
                    .divider { height: 1px; background-color: #E4E4E7; margin: 24px 0; border: none; }

                </style>
                </head>
                <body>
                <div class="wrapper">
                    <div class="main-card">
                    
                    <div class="header">
                        <div class="brand-name">SaleSync</div>
                        <div class="tagline">Sync sales. Simplify billing.</div>
                    </div>

                    <div class="content">
                        <hr class="divider" />

                        <h1 class="h1-title">Verify your email address</h1>
                        
                        <p class="text-body">
                        You recently registered for an account. To complete the process and keep your account secure, please verify this email address.
                        </p>

                        <div class="btn-container">
                        <a style="background-color: #ff6f00;
                                    color: #ffffff;
                                    font-size: 15px;
                                    font-weight: 600;
                                    text-decoration: none;
                                    padding: 12px 32px;
                                    border-radius: 6px; /* Modern slightly rounded corners */
                                    display: inline-block;
                                    transition: all 0.2s;" 
                            href="${varificationURL}" >
                                Verify email
                            </a>
                        </div>

                        <p class="text-body" style="font-size: 13px; margin-bottom: 8px;">
                        Or paste this link into your browser:
                        </p>
                        
                        <div style="
                            background-color: #FAFAFA;
                            border: 1px solid #E4E4E7;
                            border-radius: 6px;
                            padding: 12px;
                            font-size: 11px;
                            color: #71717A;
                            text-decoration: none;
                            font-family: monospace;
                            word-break: break-all;
                            text-align: center;
                            margin-top: 10px;
                        ">
                        ${varificationURL}
                        </div>

                        <p class="text-body" style="font-size: 13px; margin-top: 24px; color: #71717A;">
                        This link expires in 10 minutes. If you didn't ask for this, you can ignore this email.
                        </p>
                    </div>
                    </div>

                    <div class="footer">
                    &copy; ${new Date().getFullYear()} SaleSync Inc. All rights reserved.
                    </div>
                </div>
                </body>
                </html>`
    })




    console.log("Message sent:", info.messageId);
}