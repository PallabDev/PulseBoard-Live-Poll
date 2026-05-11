const environment = process.env.NODE_ENV;
import { type CookieOptions } from "express";


export const CookieConfiguration: CookieOptions = {
    httpOnly: environment === 'production' ? true : false,
    secure: environment === 'production' ? true : false,
    sameSite: environment === 'production' ? 'none' : 'lax',
}
