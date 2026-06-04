/**
 * Mapuje InvoiceDTO na formát vhodný pro editaci
 * @param {Object} invoiceDto
 * @returns {Object}
 */
export const mapInvoiceDtoToForm = (invoiceDto) => {
    return {
        id: invoiceDto.id || "",
        issueDate: invoiceDto.issueDate || "",
        dueDate: invoiceDto.dueDate || "",
        customerId: invoiceDto.customerId || "",
        totalAmountExVat: invoiceDto.totalAmountExVat || "",
        vatAmount: invoiceDto.vatAmount || "",
        totalAmountIncVat: invoiceDto.totalAmountIncVat || "",
        currencyCode: invoiceDto.currencyCode || "",
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
        dueDate: formData.dueDate,
        customerId: parseInt(formData.customerId),
        totalAmountExVat: parseFloat(formData.totalAmountExVat) || 0,
        vatAmount: parseFloat(formData.vatAmount) || 0,
        totalAmountIncVat: parseFloat(formData.totalAmountIncVat) || 0,
        currencyCode: formData.currencyCode || "CZK",
        status: formData.status || "",
        items: items.map((item) => ({
            productId: item.productId,
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

    if (formData.issueDate) dto.issueDate = formData.issueDate;
    if (formData.dueDate) dto.dueDate = formData.dueDate;
    if (formData.status) dto.status = formData.status;
    if (formData.totalAmountExVat)
        dto.totalAmountExVat = parseFloat(formData.totalAmountExVat);
    if (formData.vatAmount) dto.vatAmount = parseFloat(formData.vatAmount);
    if (formData.totalAmountIncVat)
        dto.totalAmountIncVat = parseFloat(formData.totalAmountIncVat);
    if (formData.currencyCode) dto.currencyCode = formData.currencyCode;

    return dto;
};

/**
 * Mapuje položku faktury na InvoiceItemDTO
 * @param {Object} item
 * @returns {Object}
 */
export const mapFormItemToInvoiceItemDto = (item) => {
    return {
        productId: item.productId,
        description: item.description,
        quantity: parseInt(item.quantity) || 1,
        unitPrice: parseFloat(item.unitPrice) || 0,
        vatRate: parseFloat(item.vatRate) || 0,
        totalPrice: parseFloat(item.totalPrice) || 0

    };
};
