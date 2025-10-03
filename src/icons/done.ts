import { addIcon } from "@iconify-icon/solid";

const Done = "done";

addIcon(Done, {
  width: 24,
  height: 24,
  body: `
  <path
     fill="currentColor"
     fill-rule="evenodd"
     d="m 11.999965,23.25 a 11.25,11.25 0 0 0 9.3875,-17.45125 l -8.94375,9.9375 a 2.5,2.5 0 0 1 -3.3587503,0.3275 L 4.9999647,13 a 1.25,1.25 0 0 1 1.5,-2 l 4.0850003,3.06375 9.1825,-10.20125 a 11.25,11.25 0 1 0 -7.7675,19.3875"
     clip-rule="evenodd"
     id="path1"
     style="stroke-width:1.25" />
  `,
});

export default Done;
