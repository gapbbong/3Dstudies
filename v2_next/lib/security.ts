
const SALT = '3D_STUDY_NEXT_SECURE_SALT';

// Simple obfuscation to deter network tab snooping
export const obfuscate = (data: any): string => {
    const str = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(str.split('').map((c, i) =>
        String.fromCharCode(c.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length))
    ).join(''))));
};

export const deobfuscate = (encoded: string): any => {
    try {
        const decoded = atob(encoded);
        const str = decodeURIComponent(escape(decoded.split('').map((c, i) =>
            String.fromCharCode(c.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length))
        ).join('')));
        return JSON.parse(str);
    } catch (e) {
        console.error("Deobfuscation failed", e);
        return null;
    }
};

export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwxDuptCcSFGPULQFH-BNOtDodq610O2Df9rXlM1LJCO1LyWcYPXoJZfLqj2ndd7ukI/exec';
