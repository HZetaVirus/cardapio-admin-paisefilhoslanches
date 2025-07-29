
import { sanitizationService } from '@/services/sanitizationService';

export const useInputValidation = () => {
  const validateEmail = (email: string): boolean => {
    // Regex mais robusto para email
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  const validatePhone = (phone: string): boolean => {
    const cleanPhone = sanitizationService.sanitizePhone(phone);
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  };

  const sanitizeText = (text: string): string => {
    return sanitizationService.sanitizeName(text);
  };

  const sanitizePhone = (phone: string): string => {
    return sanitizationService.sanitizePhone(phone);
  };

  const validateRequired = (value: string): boolean => {
    return value?.trim().length > 0;
  };

  const validatePrice = (price: string): boolean => {
    // Validação mais rigorosa para preço
    const priceRegex = /^\d+(\.\d{1,2})?$/;
    const numPrice = parseFloat(price);
    return priceRegex.test(price) && numPrice > 0 && numPrice <= 999999.99;
  };

  const validateImageUrl = (url: string): boolean => {
    return sanitizationService.isValidImageUrl(url);
  };

  const validateTextLength = (text: string, maxLength: number): boolean => {
    return text.length <= maxLength;
  };

  // Validação anti-CSRF para tokens
  const validateCSRFToken = (token: string): boolean => {
    return token && token.length >= 32 && /^[a-zA-Z0-9]+$/.test(token);
  };

  return {
    validateEmail,
    validatePhone,
    sanitizeText,
    sanitizePhone,
    validateRequired,
    validatePrice,
    validateImageUrl,
    validateTextLength,
    validateCSRFToken
  };
};
