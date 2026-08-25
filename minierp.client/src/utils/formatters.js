


export const formatPrice = (value, currency = 'CZK') => {
    return value.toLocaleString('cs-CZ', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + ' ' + currency;
};

/**
 * Naformátuje PSČ podle normy České pošty (5 číslic ve formátu "XXX XX").
 * Pokud vstup neobsahuje přesně 5 číslic, vrátí ho beze změny.
 */
export const formatZip = (zip) => {
    if (!zip) return '';
    const digits = String(zip).replace(/\D/g, '');
    if (digits.length !== 5) return zip;
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
};
