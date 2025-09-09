import log from "electron-log";
import { ipcMain } from "electron";
import { createLoggedHandler } from "./safe_handle";
import { readSettings } from "../../main/settings";

export const logger = log.scope("github_handlers");
const handle = createLoggedHandler(logger);

export function registerGithubHandlers() {
  // Test handler for E2E testing
  handle("github:fake-connect", async (event) => {
    logger.info("Simulating GitHub OAuth connection for testing");
    event.sender.send("deep-link-received", {
      type: "github-oauth-return",
      url: "https://oauth.scalix.world/api/integrations/github/login",
    });
    logger.info("Sent fake github deep-link-received event during testing.");
  });

  // Start GitHub device flow authentication
  handle("github:start-flow", async (event, { appId }) => {
    logger.info("Starting GitHub device flow for app:", appId);
    // This would implement the actual GitHub device flow
    // For now, this is a placeholder
    event.sender.send("github:flow-error", { error: "GitHub device flow not implemented" });
  });

  // List user's GitHub repositories
  handle("github:list-repos", async () => {
    logger.info("Listing GitHub repositories");
    const settings = readSettings();
    if (!settings.githubAccessToken) {
      throw new Error("GitHub access token not found");
    }
    // This would implement the actual GitHub API call
    // For now, return empty array
    return [];
  });

  // Get branches for a GitHub repository
  handle("github:get-repo-branches", async (event, { owner, repo }) => {
    logger.info(`Getting branches for ${owner}/${repo}`);
    const settings = readSettings();
    if (!settings.githubAccessToken) {
      throw new Error("GitHub access token not found");
    }
    // This would implement the actual GitHub API call
    // For now, return default branches
    return [
      { name: "main", commit: { sha: "abc123" } },
      { name: "master", commit: { sha: "def456" } }
    ];
  });

  // Check if a repository name is available
  handle("github:is-repo-available", async (event, { org, name }) => {
    logger.info(`Checking if repo ${org}/${name} is available`);
    const settings = readSettings();
    if (!settings.githubAccessToken) {
      throw new Error("GitHub access token not found");
    }
    // This would implement the actual GitHub API call
    // For now, assume it's available
    return { available: true };
  });

  // Create a new GitHub repository
  handle("github:create-repo", async (event, { org, name, appId, branch }) => {
    logger.info(`Creating repo ${org}/${name} for app ${appId}`);
    const settings = readSettings();
    if (!settings.githubAccessToken) {
      throw new Error("GitHub access token not found");
    }
    // This would implement the actual GitHub API call
    // For now, this is a placeholder
    logger.info("GitHub repo creation not fully implemented");
  });

  // Connect to an existing GitHub repository
  handle("github:connect-existing-repo", async (event, { owner, repo, branch, appId }) => {
    logger.info(`Connecting to existing repo ${owner}/${repo} for app ${appId}`);
    const settings = readSettings();
    if (!settings.githubAccessToken) {
      throw new Error("GitHub access token not found");
    }
    // This would implement the actual GitHub API call and database update
    // For now, this is a placeholder
    logger.info("GitHub repo connection not fully implemented");
  });

  // Push/sync local repository to GitHub
  handle("github:push", async (event, { appId, force }) => {
    logger.info(`Pushing repo for app ${appId}, force: ${force}`);
    // This would implement the actual git push operation
    // For now, this is a placeholder
    return { success: true };
  });

  // Disconnect GitHub repository
  handle("github:disconnect", async (event, { appId }) => {
    logger.info(`Disconnecting GitHub repo for app ${appId}`);
    // This would implement the actual disconnection logic
    // For now, this is a placeholder
    logger.info("GitHub repo disconnection not fully implemented");
  });
}
