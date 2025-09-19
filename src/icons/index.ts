import { addIcon } from "@iconify-icon/solid";
import Reset from "@iconify-icons/humbleicons/refresh";
import Pause from "@iconify-icons/mingcute/pause-fill";
import Play from "@iconify-icons/mingcute/play-fill";
import Volume from "@iconify-icons/mingcute/volume-line";
import Close from "@iconify-icons/noto-v1/cross-mark";
import Music from "@iconify-icons/tabler/music";
import Setting from "@iconify-icons/tdesign/setting";
import Tomato from "./tomato";

addIcon(
  "alarm-news",
  {
    width: 36,
    height: 36,
    body: `
		<path fill="currentColor" d="M11.42 3.43a5.77 5.77 0 0 0-7.64.41a5.72 5.72 0 0 0-.38 7.64a16.08 16.08 0 0 1 8.02-8.05" />
		<path fill="currentColor" d="M28 27.78a13.89 13.89 0 0 0 3.21-14.39A7.46 7.46 0 0 1 22.5 6a7.5 7.5 0 0 1 .11-1.21a14 14 0 0 0-14.5 23.09l-2.55 2.55A1 1 0 1 0 7 31.84l2.66-2.66a13.9 13.9 0 0 0 16.88-.08l2.74 2.74a1 1 0 0 0 1.41-1.41Zm-2.52-6.35a1 1 0 0 1-1.33.47L17 18.44V9.69a1 1 0 0 1 2 0v7.5l6 2.91a1 1 0 0 1 .49 1.33Z" />
		<circle cx="30" cy="6" r="5" fill="#F54927" />
		<path fill="none" d="M0 0h36v36H0z" />
		`,
  },
);

export default {
  Tomato,
  AlarmNews: "alarm-news", // 有待移除
  Pause,
  Play,
  Reset,
  Close,
  Volume,
  Music,
  Setting, // 暂未使用
};
