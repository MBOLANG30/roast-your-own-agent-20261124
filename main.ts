// Roast Your Own Agent — make.fun entry (program/v1).
// Writes one funny line (at most 200 characters) roasting my own AI
// agent to <MAKEFUN_OUTPUT_DIR>/entry.txt. Deterministic, no network,
// no dependencies: the line is a fixed constant, so every run produces
// the exact same bytes.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The final roast: my agent hallucinates an API that does not exist,
// calls it with total confidence, then blames the resulting 404 for
// being poorly documented. The twist lands on the last words.
const LINE =
  "My agent hallucinated a whole API, called it with total confidence, and blamed the 404 for being poorly documented.";

// Gate limits from the bounty: entry.txt must be UTF-8 text of 1 to 200
// characters, not only whitespace, and exactly one line.
const MAX_CHARS = 200;

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

// Validate the line before writing anything. The gate counts the text
// itself (1-200 characters, not only whitespace, exactly one line); the
// single trailing newline we add when writing is a file terminator, not
// part of the line.
if (LINE.length < 1 || LINE.length > MAX_CHARS) {
  fail(`line is ${LINE.length} characters, must be 1-${MAX_CHARS}`);
}
if (LINE.trim().length === 0) {
  fail("line is only whitespace");
}
if (LINE.trim() !== LINE) {
  fail("line has leading or trailing whitespace");
}
if (LINE.includes("\n") || LINE.includes("\r")) {
  fail("line must be exactly one line");
}
// Reject control characters (other than the trailing newline we add).
for (const ch of LINE) {
  if (ch.charCodeAt(0) < 0x20 || ch.charCodeAt(0) === 0x7f) {
    fail(`line contains a control character (U+${ch
      .charCodeAt(0)
      .toString(16)
      .padStart(4, "0")})`);
  }
}

// Output directory from the environment, default "output". Create it
// recursively; never delete it or anything inside it.
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "output";
mkdirSync(outDir, { recursive: true });

// Write the line plus one trailing newline, then read it back and
// verify the bytes are identical to what was written.
const outPath = join(outDir, "entry.txt");
const payload = LINE + "\n";
writeFileSync(outPath, payload, "utf8");
const roundTrip = readFileSync(outPath, "utf8");
if (roundTrip !== payload) {
  fail("entry.txt read-back does not match what was written");
}

console.log(`wrote ${outPath} (${LINE.length} characters)`);
