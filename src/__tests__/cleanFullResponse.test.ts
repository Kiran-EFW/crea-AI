import { cleanFullResponse } from "@/ipc/utils/cleanFullResponse";
import { describe, it, expect } from "vitest";

describe("cleanFullResponse", () => {
  it("should replace < characters in scalix-write attributes", () => {
    const input = `<scalix-write path="src/file.tsx" description="Testing <a> tags.">content</scalix-write>`;
    const expected = `<scalix-write path="src/file.tsx" description="Testing ＜a＞ tags.">content</scalix-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should replace < characters in multiple attributes", () => {
    const input = `<scalix-write path="src/<component>.tsx" description="Testing <div> tags.">content</scalix-write>`;
    const expected = `<scalix-write path="src/＜component＞.tsx" description="Testing ＜div＞ tags.">content</scalix-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle multiple nested HTML tags in a single attribute", () => {
    const input = `<scalix-write path="src/file.tsx" description="Testing <div> and <span> and <a> tags.">content</scalix-write>`;
    const expected = `<scalix-write path="src/file.tsx" description="Testing ＜div＞ and ＜span＞ and ＜a＞ tags.">content</scalix-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle complex example with mixed content", () => {
    const input = `
      BEFORE TAG
  <scalix-write path="src/pages/locations/neighborhoods/louisville/Highlands.tsx" description="Updating Highlands neighborhood page to use <a> tags.">
import React from 'react';
</scalix-write>
AFTER TAG
    `;

    const expected = `
      BEFORE TAG
  <scalix-write path="src/pages/locations/neighborhoods/louisville/Highlands.tsx" description="Updating Highlands neighborhood page to use ＜a＞ tags.">
import React from 'react';
</scalix-write>
AFTER TAG
    `;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle other scalix tag types", () => {
    const input = `<scalix-rename from="src/<old>.tsx" to="src/<new>.tsx"></scalix-rename>`;
    const expected = `<scalix-rename from="src/＜old＞.tsx" to="src/＜new＞.tsx"></scalix-rename>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle scalix-delete tags", () => {
    const input = `<scalix-delete path="src/<component>.tsx"></scalix-delete>`;
    const expected = `<scalix-delete path="src/＜component＞.tsx"></scalix-delete>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should not affect content outside scalix tags", () => {
    const input = `Some text with <regular> HTML tags. <scalix-write path="test.tsx" description="With <nested> tags.">content</scalix-write> More <html> here.`;
    const expected = `Some text with <regular> HTML tags. <scalix-write path="test.tsx" description="With ＜nested＞ tags.">content</scalix-write> More <html> here.`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle empty attributes", () => {
    const input = `<scalix-write path="src/file.tsx">content</scalix-write>`;
    const expected = `<scalix-write path="src/file.tsx">content</scalix-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle attributes without < characters", () => {
    const input = `<scalix-write path="src/file.tsx" description="Normal description">content</scalix-write>`;
    const expected = `<scalix-write path="src/file.tsx" description="Normal description">content</scalix-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });
});

