import { iconGenConfig } from "./config.ts";
import { genPlainIcon, scanInputs, writeIconModule } from "./support/helpet.ts";

const tmpOutputDir = "./dist/tmp/dialog-icons";

const inputs = scanInputs(iconGenConfig.remixInputPath, "svg");

for (const input of inputs) {
  const outPath = await genPlainIcon(input, tmpOutputDir);
  await writeIconModule(outPath, "remix");
}
