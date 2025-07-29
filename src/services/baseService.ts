
import { supabase } from "@/integrations/supabase/client";
import { rateLimitService } from "./rateLimitService";

// Wrapper para operações com rate limiting
export const withDDoSProtection = async <T>(operation: () => Promise<T>): Promise<T> => {
  return await rateLimitService.withRateLimit(operation);
};

export { supabase };
