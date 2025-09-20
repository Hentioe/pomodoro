import { addIcon } from "@iconify-icon/solid";

const AboutNew = "about-new";

addIcon(
  AboutNew,
  {
    width: 24,
    height: 24,
    body: `
    <path fill="#fff"
      d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2" />
    <circle cx="18" cy="6" r="5" fill="red" />
  `,
  },
);

export default AboutNew;
