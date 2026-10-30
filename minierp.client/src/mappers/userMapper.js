export const mapFormToCreateUserDto = (formData) => {
    return {
        username: formData.username,
        password: formData.password,
        role: formData.role,
    };
};
