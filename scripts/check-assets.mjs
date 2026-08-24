import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceRoots = [path.join(root, "src"), path.join(root, "public")];
const references = new Set();

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (/\.(tsx?|jsx?|css|mjs|json)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, "utf8");
      for (const match of content.matchAll(/(?:src|href|image):?\s*["'`]([^"'`]*\/images\/[^"'`]+)["'`]/g)) {
        references.add(match[1].split("?")[0]);
      }
    }
  }
}

for (const sourceRoot of sourceRoots) walk(sourceRoot);
const missing = [...references].filter((reference) => !fs.existsSync(path.join(root, "public", reference.replace(/^\//, ""))));
if (missing.length) {
  console.error("Missing public assets:\n" + missing.join("\n"));
  process.exit(1);
}
console.log(`Checked ${references.size} public asset references.`);