import log from "electron-log";
import { loadApiKey } from "@ai-sdk/provider-utils";

const logger = log.scope("crea_auth");

/**
 * Crea API Authentication System
 *
 * Handles authentication for all Crea API endpoints including:
 * - Crea Engine (advanced processing)
 * - Crea Gateway (optimized routing)
 * - Crea Pro services (user management, billing)
 */

export interface CreaAuthConfig {
  apiKey?: string;
  baseURL?: string;
  timeout?: number;
  retries?: number;
}

export interface CreaAuthHeaders {
  Authorization: string;
  "X-Crea-Client": string;
  "X-Crea-Version": string;
  "Content-Type": string;
  [key: string]: string;
}

/**
 * Validates Crea API key format
 */
export function validateCreaApiKey(apiKey: string): boolean {
  if (!apiKey) return false;

  // Crea API keys should start with 'crea_'
  if (!apiKey.startsWith('crea_')) {
    logger.error("Invalid Crea API key format. Expected key starting with 'crea_'");
    return false;
  }

  // Check minimum length (should be reasonably long)
  if (apiKey.length < 20) {
    logger.error("Crea API key appears to be too short");
    return false;
  }

  return true;
}

/**
 * Loads and validates Crea API key from settings or environment
 */
export function loadCreaApiKey(options: CreaAuthConfig = {}): string {
  const apiKey = loadApiKey({
    apiKey: options.apiKey,
    environmentVariableName: "CREA_PRO_API_KEY",
    description: "Crea Pro API key",
  });

  if (!validateCreaApiKey(apiKey)) {
    throw new Error("Invalid Crea API key format or missing key");
  }

  return apiKey;
}

/**
 * Generates Crea authentication headers
 */
export function createCreaAuthHeaders(options: CreaAuthConfig = {}): CreaAuthHeaders {
  const creaApiKey = loadCreaApiKey(options);

  return {
    Authorization: `Bearer ${creaApiKey}`,
    "X-Crea-Client": "desktop-app",
    "X-Crea-Version": process.env.npm_package_version || "1.0.0",
    "Content-Type": "application/json",
  };
}

/**
 * Crea API endpoints configuration
 */
export const CREA_API_ENDPOINTS = {
  // Crea Engine - Advanced AI processing
  ENGINE: "https://engine.crea.ai/v1",

  // Crea Gateway - Optimized routing
  GATEWAY: "https://llm-gateway.crea.ai/v1",

  // Crea Pro services
  USER_INFO: "https://llm-gateway.crea.ai/v1/user/info",
  USER_BUDGET: "https://llm-gateway.crea.ai/v1/user/budget",
  USAGE_STATS: "https://llm-gateway.crea.ai/v1/user/stats",

  // Templates and community
  TEMPLATES: "https://api.crea.ai/v1/templates",

  // Auto-updates
  UPDATES: "https://api.crea.ai/v1/update",

  // Logs and diagnostics
  LOGS_UPLOAD: "https://upload-logs.crea.ai/generate-upload-url",
} as const;

/**
 * Makes authenticated request to Crea API with retry logic
 */
export async function makeCreaApiRequest<T = any>(
  endpoint: string,
  options: RequestInit & CreaAuthConfig = {}
): Promise<T> {
  const {
    timeout = 10000,
    retries = 3,
    method = "GET",
    headers: customHeaders = {},
    ...fetchOptions
  } = options;

  const authHeaders = createCreaAuthHeaders(options);
  const headers = { ...authHeaders, ...customHeaders };

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`Crea API request attempt ${attempt}/${retries} to ${endpoint}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(endpoint, {
        method,
        headers,
        signal: controller.signal,
        ...fetchOptions,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        const error = new Error(`Crea API request failed: ${response.status} ${response.statusText}`);

        // Don't retry on authentication errors
        if (response.status === 401 || response.status === 403) {
          logger.error(`Crea authentication failed: ${errorBody}`);
          throw error;
        }

        // Retry on server errors
        if (response.status >= 500 && attempt < retries) {
          lastError = error;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        throw error;
      }

      const data = await response.json();
      logger.info(`Crea API request successful to ${endpoint}`);
      return data;

    } catch (error: any) {
      lastError = error;
      logger.warn(`Crea API request attempt ${attempt} failed: ${error.message}`);

      // Retry on network errors
      if (attempt < retries &&
          (error.name === 'AbortError' ||
           error.code === 'ECONNRESET' ||
           error.code === 'ETIMEDOUT' ||
           error.code === 'ENOTFOUND')) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      break;
    }
  }

  logger.error(`All Crea API request attempts failed. Last error: ${lastError?.message}`);
  throw lastError || new Error("Crea API request failed");
}

/**
 * Gets user budget information from Crea API
 */
export async function getCreaUserBudget(options: CreaAuthConfig = {}) {
  try {
    return await makeCreaApiRequest(CREA_API_ENDPOINTS.USER_BUDGET, {
      ...options,
      method: "GET",
    });
  } catch (error) {
    logger.error("Failed to fetch Crea user budget:", error);
    return null;
  }
}

/**
 * Gets user information from Crea API
 */
export async function getCreaUserInfo(options: CreaAuthConfig = {}) {
  try {
    return await makeCreaApiRequest(CREA_API_ENDPOINTS.USER_INFO, {
      ...options,
      method: "GET",
    });
  } catch (error) {
    logger.error("Failed to fetch Crea user info:", error);
    return null;
  }
}
