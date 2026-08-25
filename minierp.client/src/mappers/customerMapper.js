export const mapCustomerDtoToForm = (customerDto) => {
    return {
        id: customerDto.id || "",
        name: customerDto.name || "",
        email: customerDto.email || "",
        street: customerDto.street || "",
        city: customerDto.city || "",
        zip: customerDto.zip || "",
        phone: customerDto.phone || "",
        ico: customerDto.ico || "",           
        dic: customerDto.dic || "",
        accountNumber: customerDto.accountNumber || "",
        bankCode: customerDto.bankCode || "",
        isSupplier: customerDto.isSupplier ?? false,
        note: customerDto.note || "",
    };
};

export const mapFormToCreateCustomerDto = (formData) => {
    return {
        name: formData.name,
        email: formData.email,
        street: formData.street,
        city: formData.city,
        zip: formData.zip,
        phone: formData.phone,
        ico: formData.ico,
        dic: formData.dic,
        accountNumber: formData.accountNumber,
        bankCode: formData.bankCode,
        isSupplier: formData.isSupplier,
        note: formData.note,
    };
};

export const mapFormToUpdateCustomerDto = (formData) => {
    const dto = {};

    if (formData.name) dto.name = formData.name;
    if (formData.email) dto.email = formData.email;
    if (formData.street) dto.street = formData.street;
    if (formData.city) dto.city = formData.city;
    if (formData.zip) dto.zip = formData.zip;
    if (formData.phone) dto.phone = formData.phone;
    if (formData.ico) dto.ico = formData.ico;
    if (formData.dic) dto.dic = formData.dic;
    if (formData.accountNumber) dto.accountNumber = formData.accountNumber;
    if (formData.bankCode) dto.bankCode = formData.bankCode;
    if (formData.isSupplier !== undefined) dto.isSupplier = formData.isSupplier;
    if (formData.note !== undefined) dto.note = formData.note;

    return dto;
};