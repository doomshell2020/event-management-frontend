/**
 * Replaces placeholders in the given HTML with dynamic values.
 *
 * @param {string} html - The HTML template with placeholders like {name}, {date}, etc.
 * @param {Object} replacements - An object with keys matching the placeholders.
 * @returns {string} - The final HTML with placeholders replaced.
 */
export const createTemplate = (html, replacements) => {
    if (!html || typeof html !== "string") {
        throw new Error("Invalid HTML content provided.");
    }

    if (!replacements || typeof replacements !== "object") {
        throw new Error("Replacements must be provided as an object.");
    }

    let processedHtml = html;

    for (const [key, value] of Object.entries(replacements)) {
        const placeholder = new RegExp(`{${key}}`, "g"); // Global replace
        processedHtml = processedHtml.replace(placeholder, value || "");
    }

    return processedHtml;
};
