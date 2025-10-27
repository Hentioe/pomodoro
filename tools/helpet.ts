import { $, Glob } from "bun";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import { iconGenConfig } from "./config";

export function scanInputs(path: string, suffix: string) {
  const pattern = `${path}/*.${suffix}`;
  const svgFilesIterator = new Glob(pattern).scanSync(path);

  return Array.from(svgFilesIterator);
}

export async function genPlainIcon(input: string, outputDir: string) {
  if (existsSync(outputDir) === false) {
    mkdirSync(outputDir, { recursive: true });
  }
  const fileName = path.basename(input);
  await $`${iconGenConfig.inkscapeExec} --export-plain-svg=${outputDir}/${fileName} ${input}`;

  return `${outputDir}/${fileName}`;
}
