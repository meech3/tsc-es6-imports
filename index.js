#!/usr/bin/env node

import { promises as fs, statSync } from "fs";
import path from "path";

const regex = /import(?:["'\s]*([\w*{}\n\r\t, ]+)from\s*)?["'\s].*([@\w_-]+)["'\s].*;?/g;

(async () => {
  const outDir = await getOutDir();
  await replaceAllImports(outDir);
})();

async function getOutDir() {
  const tsconfig = await fs
    .readFile(path.join(process.env.PWD, "tsconfig.json"))
    .then((data) => JSON.parse(String(data)));
  return path.join(process.env.PWD, tsconfig.compilerOptions.outDir);
}

async function replaceAllImports(dir) {
  const files = await fs.readdir(dir).then((data) => data.map((file) => path.join(dir, file)));

  await Promise.all(
    files.map(async (file) => {
      if (statSync(file).isDirectory()) {
        return replaceAllImports(file);
      }
      if (path.extname(file) !== ".js") return;
      const text = await fs.readFile(file, "utf-8");
      const replaced = await replaceRegex(text, dir);
      if (replaced !== undefined) {
        await fs.writeFile(file, replaced);
      }
    })
  );
}

async function replaceRegex(text, dir) {
  const matches = text.match(regex);
  if (matches === null) return;
  await Promise.all(
    matches.map(async (match) => {
      const transformed = await replacement(match, dir);
      text = text.replace(match, transformed);
    })
  );
  return text;
}

async function replacement(initial, dir) {
  const parts = initial.includes("'") ? initial.split("'") : initial.split('"');
  const leadsToJsFile = await pathleadsToJs(path.join(dir, parts[1]));
  if (!leadsToJsFile) {
    return initial;
  }
  if (initial.endsWith('";')) {
    return initial.replace('";', '.js";');
  }
  if (initial.endsWith('"')) {
    return initial.replace('"', '.js"');
  }
  if (initial.endsWith("';")) {
    return initial.replace("';", ".js';");
  }
  if (initial.endsWith("'")) {
    return initial.replace("'", ".js'");
  }
}

async function pathleadsToJs(file) {
  try {
    return Boolean(await fs.readFile(`${file}.js`));
  } catch (error) {
    return false;
  }
}
