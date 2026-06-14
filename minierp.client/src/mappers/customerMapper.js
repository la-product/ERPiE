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
        isSupplier: customerDto.isSupplier ?? false, 
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
        isSupplier: formData.isSupplier,      
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
    if (formData.isSupplier !== undefined) dto.isSupplier = formData.isSupplier; 

    return dto;
};