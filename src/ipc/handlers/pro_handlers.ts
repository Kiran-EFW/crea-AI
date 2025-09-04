import log from "electron-log";
import { createLoggedHandler } from "./safe_handle";
import { readSettings } from "../../main/settings"; // Assuming settings are read this way
import { UserBudgetInfo, UserBudgetInfoSchema } from "../ipc_types";
import { IS_TEST_BUILD } from "../utils/test_utils";
import { getCreaUserInfo, CREA_API_ENDPOINTS } from "../utils/crea_auth";

const logger = log.scope("pro_handlers");
const handle = createLoggedHandler(logger);

const CONVERSION_RATIO = (10 * 3) / 2;

export function registerProHandlers() {
  // This method should try to avoid throwing errors because this is auxiliary
  // information and isn't critical to using the app
  handle("get-user-budget", async (): Promise<UserBudgetInfo | null> => {
    if (IS_TEST_BUILD) {
      // Avoid spamming the API in E2E tests.
      return null;
    }
    logger.info("Attempting to fetch user budget information from Crea API.");

    const settings = readSettings();

    const creaApiKey = settings.providerSettings?.auto?.apiKey?.value;

    if (!creaApiKey) {
      logger.error("Crea Pro API key is not configured.");
      return null;
    }

    try {
      // Use the new Crea authentication system
      const userInfoResponse = await getCreaUserInfo({
        apiKey: creaApiKey,
        timeout: 10000,
        retries: 3,
      });

      if (!userInfoResponse || !userInfoResponse.user_info) {
        logger.error("Invalid response format from Crea API");
        return null;
      }

      const userInfoData = userInfoResponse.user_info;
      logger.info("Successfully fetched user budget information from Crea API.");

      return UserBudgetInfoSchema.parse({
        usedCredits: userInfoData.spend * CONVERSION_RATIO,
        totalCredits: userInfoData.max_budget * CONVERSION_RATIO,
        budgetResetDate: new Date(userInfoData.budget_reset_at),
      });

    } catch (error: any) {
      logger.error(`Error fetching user budget from Crea API: ${error.message}`, error);
      return null;
    }
  });
}
