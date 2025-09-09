import { withLock } from "../ipc/utils/lock_utils";
import { readSettings, writeSettings } from "../main/settings";
// Temporary mock implementation until @scalix-ai/supabase-management-js is available
class SupabaseManagementAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseManagementAPIError';
  }
}

class SupabaseManagementAPI {
  constructor(options?: { accessToken?: string }) {
    // Mock constructor
    this.accessToken = options?.accessToken || 'mock_access_token';
  }

  accessToken: string;

  static async createClient(accessToken: string, refreshToken: string, expiresIn?: number) {
    // Mock implementation - return a basic client object
    return {
      accessToken,
      refreshToken,
      expiresIn,
      // Add other methods as needed
    };
  }

  static async refreshAccessToken(refreshToken: string) {
    // Mock implementation - return new tokens
    return {
      accessToken: 'mock_access_token',
      refreshToken: refreshToken,
      expiresIn: 3600,
    };
  }

  // Add required instance methods
  async getProjects() {
    // Mock implementation
    return [{ id: 'mock-project-id', name: 'Mock Project' }];
  }

  async getProjectApiKeys(projectId: string) {
    // Mock implementation
    return [{ name: 'mock-api-key', api_key: 'mock-api-key-value' }];
  }

  async runQuery(supabaseProjectId: string, query: string) {
    // Mock implementation
    return { data: 'mock query result' };
  }

  async getSecrets(projectId: string) {
    // Mock implementation
    return [{ name: 'mock-secret', value: 'mock-value' }];
  }

  async deleteFunction(projectId: string, functionName: string) {
    // Mock implementation - do nothing
    return;
  }
}
import log from "electron-log";
import { IS_TEST_BUILD } from "../ipc/utils/test_utils";

const logger = log.scope("supabase_management_client");

/**
 * Checks if the Supabase access token is expired or about to expire
 * Returns true if token needs to be refreshed
 */
function isTokenExpired(expiresIn?: number): boolean {
  if (!expiresIn) return true;

  // Get when the token was saved (expiresIn is stored at the time of token receipt)
  const settings = readSettings();
  const tokenTimestamp = settings.supabase?.tokenTimestamp || 0;
  const currentTime = Math.floor(Date.now() / 1000);

  // Check if the token is expired or about to expire (within 5 minutes)
  return currentTime >= tokenTimestamp + expiresIn - 300;
}

/**
 * Refreshes the Supabase access token using the refresh token
 * Updates settings with new tokens and expiration time
 */
export async function refreshSupabaseToken(): Promise<void> {
  const settings = readSettings();
  const refreshToken = settings.supabase?.refreshToken?.value;

  if (!isTokenExpired(settings.supabase?.expiresIn)) {
    return;
  }

  if (!refreshToken) {
    throw new Error(
      "Supabase refresh token not found. Please authenticate first.",
    );
  }

  try {
    // Make request to Supabase refresh endpoint
    const response = await fetch(
      "https://supabase-oauth.scalix.world/api/connect-supabase/refresh",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Supabase token refresh failed. Try going to Settings to disconnect Supabase and then reconnect to Supabase. Error status: ${response.statusText}`,
      );
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn,
    } = await response.json();

    // Update settings with new tokens
    writeSettings({
      supabase: {
        accessToken: {
          value: accessToken,
        },
        refreshToken: {
          value: newRefreshToken,
        },
        expiresIn,
        tokenTimestamp: Math.floor(Date.now() / 1000), // Store current timestamp
      },
    });
  } catch (error) {
    logger.error("Error refreshing Supabase token:", error);
    throw error;
  }
}

// Function to get the Supabase Management API client
export async function getSupabaseClient(): Promise<SupabaseManagementAPI> {
  const settings = readSettings();

  // Check if Supabase token exists in settings
  const supabaseAccessToken = settings.supabase?.accessToken?.value;
  const expiresIn = settings.supabase?.expiresIn;

  if (!supabaseAccessToken) {
    throw new Error(
      "Supabase access token not found. Please authenticate first.",
    );
  }

  // Check if token needs refreshing
  if (isTokenExpired(expiresIn)) {
    await withLock("refresh-supabase-token", refreshSupabaseToken);
    // Get updated settings after refresh
    const updatedSettings = readSettings();
    const newAccessToken = updatedSettings.supabase?.accessToken?.value;

    if (!newAccessToken) {
      throw new Error("Failed to refresh Supabase access token");
    }

    return new SupabaseManagementAPI({ accessToken: newAccessToken });
  }

  return new SupabaseManagementAPI({ accessToken: supabaseAccessToken });
}

export async function getSupabaseProjectName(
  projectId: string,
): Promise<string> {
  if (IS_TEST_BUILD) {
    return "Fake Supabase Project";
  }

  const supabase = await getSupabaseClient();
  const projects = await supabase.getProjects();
  const project = projects?.find((p) => p.id === projectId);
  return project?.name || `<project not found for: ${projectId}>`;
}

export async function executeSupabaseSql({
  supabaseProjectId,
  query,
}: {
  supabaseProjectId: string;
  query: string;
}): Promise<string> {
  if (IS_TEST_BUILD) {
    return "{}";
  }

  const supabase = await getSupabaseClient();
  const result = await supabase.runQuery(supabaseProjectId, query);
  return JSON.stringify(result);
}

export async function deleteSupabaseFunction({
  supabaseProjectId,
  functionName,
}: {
  supabaseProjectId: string;
  functionName: string;
}): Promise<void> {
  logger.info(
    `Deleting Supabase function: ${functionName} from project: ${supabaseProjectId}`,
  );
  const supabase = await getSupabaseClient();
  await supabase.deleteFunction(supabaseProjectId, functionName);
  logger.info(
    `Deleted Supabase function: ${functionName} from project: ${supabaseProjectId}`,
  );
}

export async function deploySupabaseFunctions({
  supabaseProjectId,
  functionName,
  content,
}: {
  supabaseProjectId: string;
  functionName: string;
  content: string;
}): Promise<void> {
  logger.info(
    `Deploying Supabase function: ${functionName} to project: ${supabaseProjectId}`,
  );
  const supabase = await getSupabaseClient();
  const formData = new FormData();
  formData.append(
    "metadata",
    JSON.stringify({
      entrypoint_path: "index.ts",
      name: functionName,
      // See: https://github.com/scalix-world/scalix/issues/1010
      verify_jwt: false,
    }),
  );
  formData.append("file", new Blob([content]), "index.ts");

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${supabaseProjectId}/functions/deploy?slug=${functionName}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${(supabase as any).options.accessToken}`,
      },
      body: formData,
    },
  );

  if (response.status !== 201) {
    throw await createResponseError(response, "create function");
  }

  logger.info(
    `Deployed Supabase function: ${functionName} to project: ${supabaseProjectId}`,
  );
  return response.json();
}

async function createResponseError(response: Response, action: string) {
  const errorBody = await safeParseErrorResponseBody(response);

  return new SupabaseManagementAPIError(
    `Failed to ${action}: ${response.statusText} (${response.status})${
      errorBody ? `: ${errorBody.message}` : ""
    }`,
  );
}

async function safeParseErrorResponseBody(
  response: Response,
): Promise<{ message: string } | undefined> {
  try {
    const body = await response.json();

    if (
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string"
    ) {
      return { message: body.message };
    }
  } catch {
    return;
  }
}

