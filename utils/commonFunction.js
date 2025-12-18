// utils/priceFormat.js (recommended)
export const formatPrice = (value) => {
    if (!value) return "0";

    const number = Number(value);

    // Remove .00 and format with commas
    return Number.isInteger(number)
        ? number.toLocaleString()
        : number.toFixed(2).replace(/\.00$/, "").toLocaleString();
};
