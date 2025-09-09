import log from "electron-log";
import { ipcMain } from "electron";
import { createTestOnlyLoggedHandler } from "./safe_handle";

export const logger = log.scope("github_handlers");
const testOnlyHandle = createTestOnlyLoggedHandler(logger);

export function registerGithubHandlers() {
  testOnlyHandle("github:fake-connect", async (event) => {
    logger.info("Simulating GitHub OAuth connection for testing");
    event.sender.send("deep-link-received", {
      type: "github-oauth-return",
      url: "https://oauth.scalix.world/api/integrations/github/login",
    });
    logger.info("Sent fake github deep-link-received event during testing.");
  });
}
