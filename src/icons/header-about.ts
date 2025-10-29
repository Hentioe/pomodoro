import { addIcon } from "@iconify-icon/solid";

const HeaderAbout = "header-about";

addIcon(
  HeaderAbout,
  {
    width: 24,
    height: 24,
    body: `
  <defs id="defs1"/>
  <path fill="#fff" d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2" id="path1" style="fill:currentColor;fill-opacity:1"/>
`,
  },
);

export default HeaderAbout;
