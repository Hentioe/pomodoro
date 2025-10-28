import { $, Glob } from "bun";
import * as cheerio from "cheerio";
import { existsSync, mkdirSync } from "fs";
import caseConverter from "js-convert-case";
import path from "path";
import { iconGenConfig } from "../config";

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

export function renderIconCode(iconName: string, width: string, height: string, innerBody: string) {
  // 转换为模块名称，例如 DialogAdd
  const moduleName = caseConverter.toPascalCase(iconName);
  // 将 body 中的 #000000 替换为 currentColor
  innerBody = innerBody.replace(/#000000/g, "currentColor");
  return `import { addIcon } from "@iconify-icon/solid";

const ${moduleName} = "${iconName}";

addIcon(
  ${moduleName},
  {
    width: ${width},
    height: ${height},
    body: \`${innerBody}\`,
  },
);

export default ${moduleName};
`;
}

export async function writeIconModule(input: string, prefix: string) {
  const content = await Bun.file(input).text();
  const $ = cheerio.load(content, { xmlMode: true });
  const rootNode = $("svg");
  const width = rootNode.attr("width")!;
  const height = rootNode.attr("height")!;
  const innerBody = rootNode.html()!;

  const fileName = path.basename(input).replace(".svg", "");
  const code = renderIconCode(`${prefix}-${fileName}`, width, height, innerBody);

  Bun.write(`./src/icons/${prefix}-${fileName}.ts`, code);
}
