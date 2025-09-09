import { normalizePath } from "../../../shared/normalizePath";
import log from "electron-log";
import { SqlQuery } from "../../lib/schemas";

const logger = log.scope("scalix_tag_parser");

export function getScalixWriteTags(fullResponse: string): {
  path: string;
  content: string;
  description?: string;
}[] {
  const scalixWriteRegex = /<scalix-write([^>]*)>([\s\S]*?)<\/scalix-write>/gi;
  const pathRegex = /path="([^"]+)"/;
  const descriptionRegex = /description="([^"]+)"/;

  let match;
  const tags: { path: string; content: string; description?: string }[] = [];

  while ((match = scalixWriteRegex.exec(fullResponse)) !== null) {
    const attributesString = match[1];
    let content = match[2].trim();

    const pathMatch = pathRegex.exec(attributesString);
    const descriptionMatch = descriptionRegex.exec(attributesString);

    if (pathMatch && pathMatch[1]) {
      const path = pathMatch[1];
      const description = descriptionMatch?.[1];

      const contentLines = content.split("\n");
      if (contentLines[0]?.startsWith("```")) {
        contentLines.shift();
      }
      if (contentLines[contentLines.length - 1]?.startsWith("```")) {
        contentLines.pop();
      }
      content = contentLines.join("\n");

      tags.push({ path: normalizePath(path), content, description });
    } else {
      logger.warn(
        "Found <scalix-write> tag without a valid 'path' attribute:",
        match[0],
      );
    }
  }
  return tags;
}

export function getScalixRenameTags(fullResponse: string): {
  from: string;
  to: string;
}[] {
  const scalixRenameRegex =
    /<scalix-rename from="([^"]+)" to="([^"]+)"[^>]*>([\s\S]*?)<\/scalix-rename>/g;
  let match;
  const tags: { from: string; to: string }[] = [];
  while ((match = scalixRenameRegex.exec(fullResponse)) !== null) {
    tags.push({
      from: normalizePath(match[1]),
      to: normalizePath(match[2]),
    });
  }
  return tags;
}

export function getScalixDeleteTags(fullResponse: string): string[] {
  const scalixDeleteRegex =
    /<scalix-delete path="([^"]+)"[^>]*>([\s\S]*?)<\/scalix-delete>/g;
  let match;
  const paths: string[] = [];
  while ((match = scalixDeleteRegex.exec(fullResponse)) !== null) {
    paths.push(normalizePath(match[1]));
  }
  return paths;
}

export function getScalixAddDependencyTags(fullResponse: string): string[] {
  const scalixAddDependencyRegex =
    /<scalix-add-dependency packages="([^"]+)">[^<]*<\/scalix-add-dependency>/g;
  let match;
  const packages: string[] = [];
  while ((match = scalixAddDependencyRegex.exec(fullResponse)) !== null) {
    packages.push(...match[1].split(" "));
  }
  return packages;
}

export function getScalixChatSummaryTag(fullResponse: string): string | null {
  const scalixChatSummaryRegex =
    /<scalix-chat-summary>([\s\S]*?)<\/scalix-chat-summary>/g;
  const match = scalixChatSummaryRegex.exec(fullResponse);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

export function getScalixExecuteSqlTags(fullResponse: string): SqlQuery[] {
  const scalixExecuteSqlRegex =
    /<scalix-execute-sql([^>]*)>([\s\S]*?)<\/scalix-execute-sql>/g;
  const descriptionRegex = /description="([^"]+)"/;
  let match;
  const queries: { content: string; description?: string }[] = [];

  while ((match = scalixExecuteSqlRegex.exec(fullResponse)) !== null) {
    const attributesString = match[1] || "";
    let content = match[2].trim();
    const descriptionMatch = descriptionRegex.exec(attributesString);
    const description = descriptionMatch?.[1];

    // Handle markdown code blocks if present
    const contentLines = content.split("\n");
    if (contentLines[0]?.startsWith("```")) {
      contentLines.shift();
    }
    if (contentLines[contentLines.length - 1]?.startsWith("```")) {
      contentLines.pop();
    }
    content = contentLines.join("\n");

    queries.push({ content, description });
  }

  return queries;
}

export function getScalixCommandTags(fullResponse: string): string[] {
  const scalixCommandRegex =
    /<scalix-command type="([^"]+)"[^>]*><\/scalix-command>/g;
  let match;
  const commands: string[] = [];

  while ((match = scalixCommandRegex.exec(fullResponse)) !== null) {
    commands.push(match[1]);
  }

  return commands;
}

