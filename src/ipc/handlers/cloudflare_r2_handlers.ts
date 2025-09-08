import log from "electron-log";
import { ipcMain } from "electron";
import { createTestOnlyLoggedHandler } from "./safe_handle";

export const logger = log.scope("cloudflare_r2_handlers");
const testOnlyHandle = createTestOnlyLoggedHandler(logger);

export function registerCloudflareR2Handlers() {
  testOnlyHandle("cloudflare-r2:fake-connect", async (event) => {
    logger.info("Simulating Cloudflare R2 OAuth connection for testing");
    event.sender.send("deep-link-received", {
      type: "cloudflare-r2-oauth-return",
      url: "https://oauth.crea.ai/api/integrations/cloudflare-r2/login",
    });
    logger.info("Sent fake cloudflare-r2 deep-link-received event during testing.");
  });
}
