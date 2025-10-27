import { iconGenConfig } from "./config.ts";
import { genPlainIcon, scanInputs } from "./helpet.ts";

const remixIconsOutput = "./public/assets/remix-icons";

const inputs = scanInputs(iconGenConfig.remixInputPath, "svg");
for (const input of inputs) {
  await genPlainIcon(input, remixIconsOutput);
}
