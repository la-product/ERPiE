const numberValue = (value) => Number.parseFloat(value) || 0;
const mapItems = (items) => items.map((item) => ({
    productCode: item.productCode || "",
    description: item.description || "",
    quantity: numberValue(item.quantity),
    unitPriceExVat: numberValue(item.unitPriceExVat),
    vatRate: numberValue(item.vatRate),
    totalPriceExVat: numberValue(item.totalPriceExVat),
    totalPriceIncVat: numberValue(item.totalPriceIncVat),
}));

export const mapPurchaseInvoiceDtoToForm = (invoice) => ({
    id: invoice.id || "",
    purchaseInvoiceNumber: invoice.purchaseInvoiceNumber || "",
    variableNumber: invoice.variableNumber || "",
    issueDate: invoice.issueDate || "",
    taxableSupplyDate: invoice.taxableSupplyDate || "",
    dueDate: invoice.dueDate || "",
    customerId: invoice.customerId || "",
    supplierId: invoice.supplierId || "",
    status: invoice.status || "Nezaplaceno",
    totalAmountExVat: invoice.totalAmountExVat || 0,
    vatAmount: invoice.vatAmount || 0,
    totalAmountIncVat: invoice.totalAmountIncVat || 0,
    currencyCode: invoice.currencyCode || "Kč",
    bankAccount: invoice.bankAccount || "",
    paymentMethod: invoice.paymentMethod || "Bankovní převod",
    note: invoice.note || "",
});

export const mapPurchaseInvoiceItemToForm = (item) => ({
    productCode: item.productCode || "",
    description: item.description || "",
    quantity: item.quantity ?? 1,
    unitPriceExVat: item.unitPriceExVat ?? 0,
    vatRate: item.vatRate ?? 0,
    totalPriceExVat: item.totalPriceExVat ?? 0,
    totalPriceIncVat: item.totalPriceIncVat ?? 0,
});

export const mapFormToCreatePurchaseInvoiceDto = (formData, items) => ({
    purchaseInvoiceNumber: formData.purchaseInvoiceNumber?.trim() || "",
    issueDate: formData.issueDate,
    taxableSupplyDate: formData.taxableSupplyDate,
    dueDate: formData.dueDate,
    customerId: Number.parseInt(formData.customerId, 10),
    supplierId: Number.parseInt(formData.supplierId, 10),
    status: formData.status || "Nezaplaceno",
    totalAmountExVat: numberValue(formData.totalAmountExVat),
    vatAmount: numberValue(formData.vatAmount),
    totalAmountIncVat: numberValue(formData.totalAmountIncVat),
    currencyCode: formData.currencyCode || "Kč",
    bankAccount: formData.bankAccount || "",
    variableNumber: formData.variableNumber || "",
    paymentMethod: formData.paymentMethod || "",
    note: formData.note || "",
    items: mapItems(items),
});

export const mapFormToUpdatePurchaseInvoiceDto = (formData, items) => ({
    purchaseInvoiceNumber: formData.purchaseInvoiceNumber?.trim() || "",
    variableNumber: formData.variableNumber || "",
    issueDate: formData.issueDate,
    taxableSupplyDate: formData.taxableSupplyDate,
    dueDate: formData.dueDate,
    status: formData.status || "Nezaplaceno",
    totalAmountExVat: numberValue(formData.totalAmountExVat),
    vatAmount: numberValue(formData.vatAmount),
    totalAmountIncVat: numberValue(formData.totalAmountIncVat),
    currencyCode: formData.currencyCode || "Kč",
    bankAccount: formData.bankAccount || "",
    paymentMethod: formData.paymentMethod || "",
    note: formData.note || "",
    items: mapItems(items),
});
