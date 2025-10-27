import { $, Glob } from "bun";
import path from "path";
import { iconGenConfig } from "./config.ts";

const remixIconsOutput = "./public/assets/remix-icons";

function scanInputs() {
  // 查找所有 .svg 文件（不递归）
  const pattern = `${iconGenConfig.remixInputPath}/*.svg`;
  const svgFilesIterator = new Glob(pattern).scanSync(iconGenConfig.remixInputPath);

  return Array.from(svgFilesIterator);
}

async function genPlainIcon(input: string) {
  const fileName = path.basename(input);
  await $`${iconGenConfig.inkscapeExec} --export-plain-svg=${remixIconsOutput}/${fileName} ${input}`;
}

const inputs = scanInputs();
for (const input of inputs) {
  await genPlainIcon(input);
}
