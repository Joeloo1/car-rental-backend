/**
 * Validation utility functions for forms
 */

export interface ValidationErrors {
  [key: string]: string;
}

export const validateEmail = (email: string): string | null => {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Invalid email format";
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string,
): string | null => {
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name) return "Name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  if (name.length > 100) return "Name must not exceed 100 characters";
  return null;
};

export const validatePhoneNumber = (phone: string): string | null => {
  if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone))
    return "Invalid phone number format";
  return null;
};

export const validateLoginForm = (
  email: string,
  password: string,
): ValidationErrors => {
  const errors: ValidationErrors = {};

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  return errors;
};

export const validateRegisterForm = (
  email: string,
  password: string,
  confirmPassword: string,
  name: string,
  phone?: string,
): ValidationErrors => {
  const errors: ValidationErrors = {};

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  const passwordMatchError = validatePasswordMatch(password, confirmPassword);
  if (passwordMatchError) errors.confirmPassword = passwordMatchError;

  const nameError = validateName(name);
  if (nameError) errors.name = nameError;

  if (phone) {
    const phoneError = validatePhoneNumber(phone);
    if (phoneError) errors.phone = phoneError;
  }

  return errors;
};

export const validateDateRange = (
  startDate: string,
  endDate: string,
): string | null => {
  if (!startDate || !endDate) return "Both dates are required";

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) return "End date must be after start date";
  if (start < new Date()) return "Start date cannot be in the past";

  return null;
};

export const validateCarForm = (data: {
  title: string;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  locationCity: string;
  categoryId: string;
  description: string;
}): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.title?.trim()) errors.title = "Car title is required";
  if (data.title?.length > 100)
    errors.title = "Title must not exceed 100 characters";

  if (!data.brand?.trim()) errors.brand = "Brand is required";
  if (!data.model?.trim()) errors.model = "Model is required";

  if (
    !data.year ||
    data.year < 1900 ||
    data.year > new Date().getFullYear() + 1
  )
    errors.year = "Invalid year";

  if (!data.pricePerDay || data.pricePerDay < 0)
    errors.pricePerDay = "Price must be a positive number";

  if (!data.locationCity?.trim()) errors.locationCity = "Location is required";
  if (!data.categoryId) errors.categoryId = "Category is required";
  if (!data.description?.trim()) errors.description = "Description is required";

  return errors;
};
