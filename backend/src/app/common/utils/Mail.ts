import { Resend } from "resend";
import ApiError from "./ApiError.js";

const apiKey = process.env.RESEND_API_KEY!;
const fromEmail = process.env.RESEND_FROM!;
const resend = new Resend(apiKey);

export type EmailOptions = {
    to: string;
    subject: string;
    text: string;

};

export const sendEmail = async ({ to, subject, text }: EmailOptions) => {
    try {
        await resend.emails.send({
            from: fromEmail,
            to,
            subject,
            text,
        });
    } catch (error) {
        console.error("Error sending email:", error);
        throw new ApiError(500, "Failed to send email");
    }

};
