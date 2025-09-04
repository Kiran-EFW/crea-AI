import { cleanFullResponse } from "@/ipc/utils/cleanFullResponse";
import { describe, it, expect } from "vitest";

describe("cleanFullResponse", () => {
  it("should replace < characters in crea-write attributes", () => {
    const input = `<crea-write path="src/file.tsx" description="Testing <a> tags.">content</crea-write>`;
    const expected = `<crea-write path="src/file.tsx" description="Testing ＜a＞ tags.">content</crea-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should replace < characters in multiple attributes", () => {
    const input = `<crea-write path="src/<component>.tsx" description="Testing <div> tags.">content</crea-write>`;
    const expected = `<crea-write path="src/＜component＞.tsx" description="Testing ＜div＞ tags.">content</crea-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle multiple nested HTML tags in a single attribute", () => {
    const input = `<crea-write path="src/file.tsx" description="Testing <div> and <span> and <a> tags.">content</crea-write>`;
    const expected = `<crea-write path="src/file.tsx" description="Testing ＜div＞ and ＜span＞ and ＜a＞ tags.">content</crea-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle complex example with mixed content", () => {
    const input = `
      BEFORE TAG
  <crea-write path="src/pages/locations/neighborhoods/louisville/Highlands.tsx" description="Updating Highlands neighborhood page to use <a> tags.">
import React from 'react';
</crea-write>
AFTER TAG
    `;

    const expected = `
      BEFORE TAG
  <crea-write path="src/pages/locations/neighborhoods/louisville/Highlands.tsx" description="Updating Highlands neighborhood page to use ＜a＞ tags.">
import React from 'react';
</crea-write>
AFTER TAG
    `;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle other crea tag types", () => {
    const input = `<crea-rename from="src/<old>.tsx" to="src/<new>.tsx"></crea-rename>`;
    const expected = `<crea-rename from="src/＜old＞.tsx" to="src/＜new＞.tsx"></crea-rename>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle crea-delete tags", () => {
    const input = `<crea-delete path="src/<component>.tsx"></crea-delete>`;
    const expected = `<crea-delete path="src/＜component＞.tsx"></crea-delete>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should not affect content outside crea tags", () => {
    const input = `Some text with <regular> HTML tags. <crea-write path="test.tsx" description="With <nested> tags.">content</crea-write> More <html> here.`;
    const expected = `Some text with <regular> HTML tags. <crea-write path="test.tsx" description="With ＜nested＞ tags.">content</crea-write> More <html> here.`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle empty attributes", () => {
    const input = `<crea-write path="src/file.tsx">content</crea-write>`;
    const expected = `<crea-write path="src/file.tsx">content</crea-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle attributes without < characters", () => {
    const input = `<crea-write path="src/file.tsx" description="Normal description">content</crea-write>`;
    const expected = `<crea-write path="src/file.tsx" description="Normal description">content</crea-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });
});

