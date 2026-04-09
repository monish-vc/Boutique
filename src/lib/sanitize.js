import DOMPurify from 'dompurify';

export function sanitize(input) {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

export function sanitizeHTML(html) {
  return DOMPurify.sanitize(html);
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function validatePrice(price) {
  const num = Number(price);
  return !isNaN(num) && num > 0 && num < 1000000;
}

export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateProduct(product) {
  const errors = {};
  const nameErr = validateRequired(product.name, 'Name');
  if (nameErr) errors.name = nameErr;
  if (!validatePrice(product.price)) errors.price = 'Valid price is required';
  const catErr = validateRequired(product.category, 'Category');
  if (catErr) errors.category = catErr;
  return { valid: Object.keys(errors).length === 0, errors };
}
