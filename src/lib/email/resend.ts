import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = "SerpVive <hello@mail.serpvive.com>";
export const FOUNDER_EMAIL = "Levi from SerpVive <levi@mail.serpvive.com>";
