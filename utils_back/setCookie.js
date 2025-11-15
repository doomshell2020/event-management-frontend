// utils/setCookie.js
import { serialize } from 'cookie';

export function setCookie(res, name, value, options = {}) {
    const defaultOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 1, // 7 days
    };

    const cookieOptions = { ...defaultOptions, ...options };   
    const serialized = serialize(name, String(value), cookieOptions);

    res.setHeader('Set-Cookie', serialized);
}
