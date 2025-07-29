
// Rate limiting service para proteção contra DDoS
class RateLimitService {
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly maxRequests = 100; // máximo de requests por janela de tempo
  private readonly windowMs = 60000; // janela de 1 minuto
  private readonly blockDuration = 300000; // bloquear por 5 minutos após limite
  private blockedIPs = new Map<string, number>();

  private getClientId(): string {
    // Usar IP + User Agent como identificador único
    const userAgent = navigator.userAgent;
    const timestamp = Math.floor(Date.now() / this.windowMs);
    return `${userAgent}_${timestamp}`;
  }

  private cleanupOldEntries(): void {
    const now = Date.now();
    
    // Limpar contadores expirados
    for (const [key, data] of this.requestCounts.entries()) {
      if (now > data.resetTime) {
        this.requestCounts.delete(key);
      }
    }
    
    // Limpar IPs bloqueados expirados
    for (const [ip, blockTime] of this.blockedIPs.entries()) {
      if (now > blockTime) {
        this.blockedIPs.delete(ip);
      }
    }
  }

  public isBlocked(): boolean {
    this.cleanupOldEntries();
    const clientId = this.getClientId();
    const now = Date.now();
    
    // Verificar se está bloqueado
    const blockTime = this.blockedIPs.get(clientId);
    if (blockTime && now < blockTime) {
      console.warn('Cliente bloqueado por excesso de requisições');
      return true;
    }
    
    return false;
  }

  public checkRateLimit(): boolean {
    if (this.isBlocked()) {
      return false;
    }

    const clientId = this.getClientId();
    const now = Date.now();
    
    let requestData = this.requestCounts.get(clientId);
    
    if (!requestData || now > requestData.resetTime) {
      // Nova janela de tempo
      requestData = {
        count: 1,
        resetTime: now + this.windowMs
      };
      this.requestCounts.set(clientId, requestData);
      return true;
    }
    
    if (requestData.count >= this.maxRequests) {
      // Limite excedido, bloquear cliente
      this.blockedIPs.set(clientId, now + this.blockDuration);
      console.warn(`Cliente ${clientId} bloqueado por ${this.blockDuration/1000} segundos`);
      return false;
    }
    
    requestData.count++;
    return true;
  }

  public async withRateLimit<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit excedido. Tente novamente em alguns minutos.');
    }
    
    try {
      return await operation();
    } catch (error) {
      console.error('Erro na operação com rate limit:', error);
      throw error;
    }
  }
}

export const rateLimitService = new RateLimitService();
