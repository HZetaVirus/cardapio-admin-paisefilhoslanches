
// Serviço de sanitização para prevenir XSS e outras vulnerabilidades
export const sanitizationService = {
  // Escapa caracteres HTML perigosos
  escapeHtml: (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Remove tags HTML completamente
  stripHtml: (text: string): string => {
    const div = document.createElement('div');
    div.innerHTML = text;
    return div.textContent || div.innerText || '';
  },

  // Sanitiza texto para comentários (permite apenas alguns caracteres seguros)
  sanitizeComment: (text: string): string => {
    if (!text) return '';
    
    // Remove tags HTML
    let sanitized = sanitizationService.stripHtml(text);
    
    // Remove caracteres potencialmente perigosos
    sanitized = sanitized.replace(/[<>'"&]/g, '');
    
    // Limita o tamanho
    return sanitized.substring(0, 500);
  },

  // Sanitiza nome de usuário
  sanitizeName: (name: string): string => {
    if (!name) return '';
    
    // Remove caracteres especiais, mantém apenas letras, números, espaços e alguns acentos
    return name
      .replace(/[<>'"&]/g, '')
      .replace(/[^\w\sÀ-ÿ]/g, '')
      .substring(0, 100);
  },

  // Sanitiza endereço
  sanitizeAddress: (address: string): string => {
    if (!address) return '';
    
    return address
      .replace(/[<>'"]/g, '')
      .substring(0, 200);
  },

  // Valida e sanitiza telefone
  sanitizePhone: (phone: string): string => {
    if (!phone) return '';
    
    // Remove tudo exceto números
    return phone.replace(/\D/g, '');
  },

  // Valida URL de imagem
  isValidImageUrl: (url: string): boolean => {
    if (!url) return false;
    
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol) &&
             /\.(jpg|jpeg|png|gif|webp)$/i.test(parsed.pathname);
    } catch {
      return false;
    }
  }
};
