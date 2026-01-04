import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import * as nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: process.env.APP_USER,
        pass: process.env.APP_PASS,
    },
});

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    trustedOrigins: [process.env.APP_ORIGIN!],
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "USER"
            },
            phone: {
                type: "string",
                required: false
            },
            profile: {
                type: "string",
                defaultValue: "active",
                required: false
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            try {
                const verificationUrl = `${process.env.BETTER_AUTH_URL}/verify-email?token=${token}`;
                const info = await transporter.sendMail({
                    from: '"Prisma blog" <prismablog@dev.com>',
                    to: user.email,
                    subject: "Hello ✔",
                    text: "Hello world?", // Plain-text version of the message
                    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f6f8;
            font-family: Arial, Helvetica, sans-serif;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .header {
            background-color: #0f172a;
            color: #ffffff;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 30px;
            color: #333333;
            line-height: 1.6;
        }
        .button-wrapper {
            text-align: center;
            margin: 30px 0;
        }
        .verify-button {
            background-color: #2563eb;
            color: #ffffff;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            display: inline-block;
        }
        .footer {
            padding: 20px;
            font-size: 12px;
            color: #777777;
            text-align: center;
            background-color: #f4f6f8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Prisma Blog</h2>
        </div>

        <div class="content">
            <h3>Verify your email address</h3>

            <p> Hello ${user.name}
                Thank you for signing up for <strong>Prisma Blog</strong>.
                Please confirm your email address by clicking the button below.
            </p>

            <div class="button-wrapper">
                <a
                    href="${verificationUrl}"
                    class="verify-button"
                    target="_blank"
                >
                    Verify Email
                </a>
            </div>

            <p>
                If the button doesn’t work, copy and paste the following link
                into your browser:
            </p>

            <p style="word-break: break-all;">
                ${verificationUrl}
            </p>

            <p>
                If you did not create an account, you can safely ignore this
                email.
            </p>
        </div>

        <div class="footer">
            <p>
                © 2026 Prisma Blog. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`, // HTML version of the message
                });

                console.log("Message sent:", info.messageId);
            } catch (error:any) {
                console.log(error.message)
                throw error;
            }
        },
    },
    socialProviders: {
        google: { 
            prompt: "select_account",
            accessType: "offline", 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
            
        }, 
    },
});