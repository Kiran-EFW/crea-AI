import log from "electron-log";
import { ipcMain } from "electron";
import { createTestOnlyLoggedHandler } from "./safe_handle";

export const logger = log.scope("aws_s3_handlers");
const testOnlyHandle = createTestOnlyLoggedHandler(logger);

export function registerAwsS3Handlers() {
  testOnlyHandle("aws-s3:fake-connect", async (event) => {
    logger.info("Simulating AWS S3 OAuth connection for testing");
    event.sender.send("deep-link-received", {
      type: "aws-s3-oauth-return",
      url: "https://oauth.crea.ai/api/integrations/aws-s3/login",
    });
    logger.info("Sent fake aws-s3 deep-link-received event during testing.");
  });
}
