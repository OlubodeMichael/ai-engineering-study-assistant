import { describe, expect, it } from "vitest";
import { buildSourceLink } from "./sourceLinks";

describe("buildSourceLink", () => {
  it("links English lessons to the course website without /docs/en.md", () => {
    expect(buildSourceLink("phases/11-llm-engineering/09-function-calling/docs/en.md")).toEqual({
      kind: "lesson",
      url: "https://aiengineeringfromscratch.com/lesson?path=phases%2F11-llm-engineering%2F09-function-calling",
    });
  });

  it.each([
    "README.md",
    "ROADMAP.md",
    "phases/11-llm-engineering/README.md",
    "phases/11-llm-engineering/09-function-calling/docs/es.md",
    "phases/11-llm-engineering/09-function-calling/extra/docs/en.md",
  ])("falls back to GitHub for non-lesson path %j", (path) => {
    expect(buildSourceLink(path)).toEqual({
      kind: "repository",
      url: `https://github.com/rohitg00/ai-engineering-from-scratch/blob/main/${path}`,
    });
  });

  it.each([
    "https://evil.example/x.md",
    "javascript:alert(1)",
    "/etc/passwd",
    "../secrets.md",
    "phases/../../x.md",
    "phases//docs.md",
    "phases/with space.md",
    "phases/../x/docs/en.md",
    "",
  ])("rejects unsafe path %j", (path) => {
    expect(buildSourceLink(path)).toBeNull();
  });
});
