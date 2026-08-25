/**
 * Mapuje InvoiceDTO na formát vhodný pro editaci
 * @param {Object} invoiceDto
 * @returns {Object}
 */
export const mapInvoiceDtoToForm = (invoiceDto) => {
    return {
        id: invoiceDto.id || "",
        invoiceNumber: invoiceDto.invoiceNumber || "",
        issueDate: invoiceDto.issueDate || "",
        taxableSupplyDate: invoiceDto.taxableSupplyDate || "",
        dueDate: invoiceDto.dueDate || "",
        supplierId: invoiceDto.supplierId || "",
        customerId: invoiceDto.customerId || "",
        totalAmountExVat: invoiceDto.totalAmountExVat || "",
        vatAmount: invoiceDto.vatAmount || "",
        totalAmountIncVat: invoiceDto.totalAmountIncVat || "",
        currencyCode: invoiceDto.currencyCode || "",
        bankAccount: invoiceDto.bankAccount || "",
        variableSymbol: invoiceDto.variableSymbol || "",
        paymentMethod: invoiceDto.paymentMethod || "",
        status: invoiceDto.status || "",
    };
};

/**
 * Mapuje formulář a položky na CreateInvoiceDTO
 * @param {Object} formData
 * @param {Array} items
 * @returns {Object}
 */
export const mapFormToCreateInvoiceDto = (formData, items) => {
    return {
        issueDate: formData.issueDate,
        taxableSupplyDate: formData.taxableSupplyDate,
        dueDate: formData.dueDate,
        supplierId: parseInt(formData.supplierId),
        customerId: parseInt(formData.customerId),
        totalAmountExVat: parseFloat(formData.totalAmountExVat) || 0,
        vatAmount: parseFloat(formData.vatAmount) || 0,
        totalAmountIncVat: parseFloat(formData.totalAmountIncVat) || 0,
        currencyCode: formData.currencyCode || "Kč",
        bankAccount: formData.bankAccount,
        variableSymbol: formData.variableSymbol,
        paymentMethod: formData.paymentMethod,
        status: formData.status || "",
        items: items.map((item) => ({
            description: item.description,
            quantity: parseInt(item.quantity) || 1,
            unitPrice: parseFloat(item.unitPrice) || 0,
            vatRate: parseFloat(item.vatRate) || 0,
            totalPrice: parseFloat(item.totalPrice) || 0,
        })),
    };
};

/**
 * Mapuje formulář na UpdateInvoiceDTO
 * @param {Object} formData
 * @returns {Object}
 */
export const mapFormToUpdateInvoiceDto = (formData) => {
    const dto = {};

    if (formData.invoiceNumber) dto.invoiceNumber = formData.invoiceNumber;
    if (formData.issueDate) dto.issueDate = formData.issueDate;
    if (formData.taxableSupplyDate) dto.taxableSupplyDate = formData.taxableSupplyDate;
    if (formData.dueDate) dto.dueDate = formData.dueDate;
    if (formData.status) dto.status = formData.status;
    if (formData.totalAmountExVat)
        dto.totalAmountExVat = parseFloat(formData.totalAmountExVat);
    if (formData.vatAmount) dto.vatAmount = parseFloat(formData.vatAmount);
    if (formData.totalAmountIncVat)
        dto.totalAmountIncVat = parseFloat(formData.totalAmountIncVat);
    if (formData.currencyCode) dto.currencyCode = formData.currencyCode;
    if (formData.bankAccount) dto.bankAccount = formData.bankAccount;
    if (formData.variableSymbol) dto.variableSymbol = formData.variableSymbol;
    if (formData.paymentMethod) dto.paymentMethod = formData.paymentMethod;

    return dto;
};

/**
 * Mapuje položku faktury na InvoiceItemDTO
 * @param {Object} item
 * @returns {Object}
 */
export const mapFormItemToInvoiceItemDto = (item) => {
    return {
        description: item.description,
        quantity: parseInt(item.quantity) || 1,
        unitPrice: parseFloat(item.unitPrice) || 0,
        vatRate: parseFloat(item.vatRate) || 0,
        totalPrice: parseFloat(item.totalPrice) || 0

    };
};
