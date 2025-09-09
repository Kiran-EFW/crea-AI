import log from "electron-log";
import { ipcMain } from "electron";
import { createTestOnlyLoggedHandler } from "./safe_handle";

export const logger = log.scope("supabase_handlers");
const testOnlyHandle = createTestOnlyLoggedHandler(logger);

export function registerSupabaseHandlers() {
  testOnlyHandle("supabase:fake-connect", async (event) => {
    logger.info("Simulating Supabase OAuth connection for testing");
    event.sender.send("deep-link-received", {
      type: "supabase-oauth-return",
      url: "https://oauth.scalix.world/api/integrations/supabase/login",
    });
    logger.info("Sent fake supabase deep-link-received event during testing.");
  });
}
