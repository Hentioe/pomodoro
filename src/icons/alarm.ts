import { addIcon } from "@iconify-icon/solid";

const Alarm = "alarm";

addIcon(Alarm, {
  width: 24,
  height: 24,
  body: `
  <g fill="none">
    <path d="M21 13a9 9 0 1 1-18 0a9 9 0 0 1 18 0" />
    <path stroke="currentColor" stroke-linecap="square" stroke-width="1.5" d="m22.5 6.5l-4-4m-17 4l4-4M21 13a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z" />
    <path stroke="currentColor" stroke-linecap="square" stroke-width="1.5" d="M12 8.5V13l3 3" />
	</g> 
  `,
});

export default Alarm;
