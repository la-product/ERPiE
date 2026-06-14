/**
 * @typedef {Object} CustomerDTO
 * @property {number} id
 * @property {string} name
 * @property {string} street
 * @property {string} city
 * @property {string} zip
 * @property {string} email
 * @property {string} phone
 * @property {string} ico
 * @property {boolean} isSupplier
 */

/**
 * @typedef {Object} CreateCustomerDTO
 * @property {string} name
 * @property {string} street
 * @property {string} city
 * @property {string} zip
 * @property {string} email
 * @property {string} phone
 * @property {string} ico
 * @property {boolean} isSupplier
 */

/**
 * @typedef {Object} UpdateCustomerDTO
 * @property {string} [name]
 * @property {string} [street]
 * @property {string} [city]
 * @property {string} [zip]
 * @property {string} [email]
 * @property {string} [phone]
 * @property {string} [ico]
 * @property {boolean} [isSupplier]
 */

/**
 * @typedef {Object} CustomerDetailDTO
 * @property {number} id
 * @property {string} name
 * @property {string} street
 * @property {string} city
 * @property {string} zip
 * @property {string} email
 * @property {string} phone
 * @property {string} ico
 * @property {boolean} isSupplier
 * @property {Array} orders
 */

export { };