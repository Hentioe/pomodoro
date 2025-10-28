import { iconGenConfig } from "./config";
import { genPlainIcon, scanInputs, writeIconModule } from "./support/helpet";

const tmpOutputDir = "./dist/tmp/dialog-icons";

const inputs = scanInputs(iconGenConfig.dialogInputPath, "svg");

for (const input of inputs) {
  const outPath = await genPlainIcon(input, tmpOutputDir);
  await writeIconModule(outPath, "dialog");
}
