


export const formatPrice = (value, currency = 'CZK') => {
    return value.toLocaleString('cs-CZ', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + ' ' + currency;
};
