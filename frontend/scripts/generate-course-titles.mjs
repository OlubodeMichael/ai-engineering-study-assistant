// Extracts real lesson and phase titles from the downloaded course so the UI
// can show them without asking the model to invent titles.
// Usage: npm run generate:titles
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FRONTEND_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const COURSE_DIR = path.resolve(FRONTEND_DIR, "../documents/ai-engineering-from-scratch");
const OUTPUT_FILE = path.join(FRONTEND_DIR, "src/features/chat/data/courseTitles.json");
const HEADING_PATTERN = /^#\s+(.+?)\s*#*\s*$/m;
const PHASE_PREFIX_PATTERN = /^Phase\s+\d+\s*[:\u2014-]\s*/i;

async function readHeading(filePath) {
  try {
    const match = HEADING_PATTERN.exec(await readFile(filePath, "utf8"));
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

async function listDirectories(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}

async function collectPhase(phaseSlug, phases, lessons) {
  const phaseDir = path.join(COURSE_DIR, "phases", phaseSlug);
  const phaseHeading = await readHeading(path.join(phaseDir, "README.md"));
  if (phaseHeading) phases[phaseSlug] = phaseHeading.replace(PHASE_PREFIX_PATTERN, "");

  for (const lessonSlug of await listDirectories(phaseDir)) {
    const title = await readHeading(path.join(phaseDir, lessonSlug, "docs", "en.md"));
    if (title) lessons[`phases/${phaseSlug}/${lessonSlug}`] = title;
  }
}

async function main() {
  const phases = {};
  const lessons = {};
  for (const phaseSlug of await listDirectories(path.join(COURSE_DIR, "phases"))) {
    await collectPhase(phaseSlug, phases, lessons);
  }

  await writeFile(OUTPUT_FILE, `${JSON.stringify({ phases, lessons }, null, 2)}\n`);
  console.info(
    `Wrote ${Object.keys(phases).length} phase and ${Object.keys(lessons).length} lesson titles.`,
  );
}

main().catch((error) => {
  console.error("Failed to generate course titles:", error);
  process.exitCode = 1;
});
