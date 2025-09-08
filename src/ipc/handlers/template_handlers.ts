import { createLoggedHandler } from "./safe_handle";
import log from "electron-log";
import { getAllTemplates, clearTemplateCache } from "../utils/template_utils";
import { localTemplatesData, type Template } from "../../shared/templates";

const logger = log.scope("template_handlers");
const handle = createLoggedHandler(logger);

export function registerTemplateHandlers() {
  handle("get-templates", async (): Promise<Template[]> => {
    try {
      const templates = await getAllTemplates();
      return templates;
    } catch (error) {
      logger.error("Error fetching templates:", error);
      return localTemplatesData;
    }
  });

  handle("refresh-templates", async (): Promise<Template[]> => {
    try {
      // Clear cache and force refresh
      clearTemplateCache();
      const templates = await getAllTemplates(true);
      logger.info("Templates refreshed successfully");
      return templates;
    } catch (error) {
      logger.error("Error refreshing templates:", error);
      return localTemplatesData;
    }
  });

  handle("clear-template-cache", async (): Promise<void> => {
    try {
      clearTemplateCache();
      logger.info("Template cache cleared");
    } catch (error) {
      logger.error("Error clearing template cache:", error);
      throw error;
    }
  });
}

