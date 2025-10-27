import * as cheerio from "cheerio";
import caseConvert from "js-convert-case";
import path from "path";
import { iconGenConfig } from "./config";
import { genPlainIcon, scanInputs } from "./helpet";

const tmpOutputDir = "./dist/tmp/dialog-icons";
const codeOutputDir = "./src/icons";

const inputs = scanInputs(iconGenConfig.dialogInputPath, "svg");

for (const input of inputs) {
  const out = await genPlainIcon(input, tmpOutputDir);
  await parsePlainSvg(out);
}

async function parsePlainSvg(input: string) {
  const content = await Bun.file(input).text();
  const $ = cheerio.load(content, { xmlMode: true });
  const rootNode = $("svg");
  const width = rootNode.attr("width")!;
  const height = rootNode.attr("height")!;
  const innerBody = rootNode.html()!;

  const fileName = path.basename(input).replace(".svg", "");
  const code = renderCode(`dialog-${fileName}`, width, height, innerBody);

  writeFile(code, `${codeOutputDir}/dialog-${fileName}.ts`);
}

function renderCode(iconName: string, width: string, height: string, innerBody: string) {
  // 转换为模块名称，例如 DialogAdd
  const moduleName = caseConvert.toPascalCase(iconName);
  // 将 body 中的 #000000 替换为 currentColor
  innerBody = innerBody.replace(/#000000/g, "currentColor");
  return `import { addIcon } from "@iconify-icon/solid";

const ${moduleName} = "${iconName}";

addIcon(
  ${moduleName},
  {
    width: ${width},
    height: ${height},
    body: \`${innerBody}\`
  },
);

export default ${moduleName};
`;
}

function writeFile(content: string, outputPath: string) {
  Bun.write(outputPath, content);
}
