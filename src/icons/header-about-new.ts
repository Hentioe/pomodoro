import { addIcon } from "@iconify-icon/solid";

const HeaderAboutNew = "header-about-new";

addIcon(
  HeaderAboutNew,
  {
    width: 24,
    height: 24,
    body: `
  <defs id="defs1"/>
  <path id="path1" d="M 12 2 A 10 10 0 0 0 2 12 A 10 10 0 0 0 12 22 A 10 10 0 0 0 22 12 A 10 10 0 0 0 21.617188 9.2597656 A 5 5 0 0 1 19 10 A 5 5 0 0 1 14 5 A 5 5 0 0 1 14.740234 2.3828125 A 10 10 0 0 0 12 2 z M 11 7 L 13 7 L 13 9 L 11 9 L 11 7 z M 11 11 L 13 11 L 13 17 L 11 17 L 11 11 z " style="fill:#e4e4e7;fill-opacity:1"/>
  <circle style="display: inline; fill: red; fill-opacity: 1; stroke: none; stroke-width: 0; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: none; paint-order: markers stroke; transform-box: fill-box; transform-origin: 50% 50%;" id="path2" cx="19" cy="5" r="4">
    <animateTransform type="scale" additive="sum" attributeName="transform" values="0 0;1 1" begin="0s" dur="0.5s" fill="freeze" keyTimes="0; 1" calcMode="spline" keySplines="0.42 0 1 1" restart="never"/>
  </circle>
`,
  },
);

export default HeaderAboutNew;
