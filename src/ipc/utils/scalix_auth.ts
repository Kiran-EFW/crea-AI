import log from "electron-log";
import { loadApiKey } from "@ai-sdk/provider-utils";

const logger = log.scope("scalix_auth");

/**
 * Scalix API Authentication System
 *
 * Handles authentication for all Scalix API endpoints including:
 * - Scalix Engine (advanced processing)
 * - Scalix Gateway (optimized routing)
 * - Scalix Pro services (user management, billing)
 */

export interface ScalixAuthConfig {
  apiKey?: string;
  baseURL?: string;
  timeout?: number;
  retries?: number;
}

export interface ScalixAuthHeaders {
  Authorization: string;
  "X-Scalix-Client": string;
  "X-Scalix-Version": string;
  "Content-Type": string;
  [key: string]: string;
}

/**
 * Validates Scalix API key format
 */
export function validateScalixApiKey(apiKey: string): boolean {
  if (!apiKey) return false;

  // Scalix API keys should start with 'scalix_'
  if (!apiKey.startsWith('scalix_')) {
    logger.error("Invalid Scalix API key format. Expected key starting with 'scalix_'");
    return false;
  }

  // Check minimum length (should be reasonably long)
  if (apiKey.length < 20) {
    logger.error("Scalix API key appears to be too short");
    return false;
  }

  return true;
}

/**
 * Loads and validates Scalix API key from settings or environment
 */
export function loadScalixApiKey(options: ScalixAuthConfig = {}): string {
  const apiKey = loadApiKey({
    apiKey: options.apiKey,
    environmentVariableName: "SCALIX_PRO_API_KEY",
    description: "Scalix Pro API key",
  });

  if (!validateScalixApiKey(apiKey)) {
    throw new Error("Invalid Scalix API key format or missing key");
  }

  return apiKey;
}

/**
 * Generates Scalix authentication headers
 */
export function createScalixAuthHeaders(options: ScalixAuthConfig = {}): ScalixAuthHeaders {
  const scalixApiKey = loadScalixApiKey(options);

  return {
    Authorization: `Bearer ${scalixApiKey}`,
    "X-Scalix-Client": "desktop-app",
    "X-Scalix-Version": process.env.npm_package_version || "1.0.0",
    "Content-Type": "application/json",
  };
}

/**
 * Scalix API endpoints configuration
 */
export const SCALIX_API_ENDPOINTS = {
  // Scalix Engine - Advanced AI processing
  ENGINE: "https://engine.scalix.world/v1",

  // Scalix Gateway - Optimized routing
  GATEWAY: "https://llm-gateway.scalix.world/v1",

  // Scalix Pro services
  USER_INFO: "https://llm-gateway.scalix.world/v1/user/info",
  USER_BUDGET: "https://llm-gateway.scalix.world/v1/user/budget",
  USAGE_STATS: "https://llm-gateway.scalix.world/v1/user/stats",

  // Templates and community
  TEMPLATES: "https://api.scalix.world/v1/templates",

  // Auto-updates
  UPDATES: "https://api.scalix.world/v1/update",

  // Logs and diagnostics
  LOGS_UPLOAD: "https://upload-logs.scalix.world/generate-upload-url",
} as const;

/**
 * Makes authenticated request to Scalix API with retry logic
 */
export async function makeScalixApiRequest<T = any>(
  endpoint: string,
  options: RequestInit & ScalixAuthConfig = {}
): Promise<T> {
  const {
    timeout = 10000,
    retries = 3,
    method = "GET",
    headers: customHeaders = {},
    ...fetchOptions
  } = options;

  const authHeaders = createScalixAuthHeaders(options);
  const headers = { ...authHeaders, ...customHeaders };

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`Scalix API request attempt ${attempt}/${retries} to ${endpoint}`);

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
        const error = new Error(`Scalix API request failed: ${response.status} ${response.statusText}`);

        // Don't retry on authentication errors
        if (response.status === 401 || response.status === 403) {
          logger.error(`Scalix authentication failed: ${errorBody}`);
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
      logger.info(`Scalix API request successful to ${endpoint}`);
      return data;

    } catch (error: any) {
      lastError = error;
      logger.warn(`Scalix API request attempt ${attempt} failed: ${error.message}`);

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

  logger.error(`All Scalix API request attempts failed. Last error: ${lastError?.message}`);
  throw lastError || new Error("Scalix API request failed");
}

/**
 * Gets user budget information from Scalix API
 */
export async function getScalixUserBudget(options: ScalixAuthConfig = {}) {
  try {
    return await makeScalixApiRequest(SCALIX_API_ENDPOINTS.USER_BUDGET, {
      ...options,
      method: "GET",
    });
  } catch (error) {
    logger.error("Failed to fetch Scalix user budget:", error);
    return null;
  }
}

/**
 * Gets user information from Scalix API
 */
export async function getScalixUserInfo(options: ScalixAuthConfig = {}) {
  try {
    return await makeScalixApiRequest(SCALIX_API_ENDPOINTS.USER_INFO, {
      ...options,
      method: "GET",
    });
  } catch (error) {
    logger.error("Failed to fetch Scalix user info:", error);
    return null;
  }
}

