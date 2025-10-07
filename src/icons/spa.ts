import { addIcon } from "@iconify-icon/solid";

const Spa = "spa";

addIcon(Spa, {
  width: 14,
  height: 14,
  body: `
	<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="0.85">
		<path d="M12 7a2.8 2.8 0 0 1 1.5 2.24c0 1.93-2.91 3.5-6.5 3.5S.5 11.18.5 9.25A2.8 2.8 0 0 1 2 7" />
		<path d="M4.08 2.25c-2 2.5 2 3.5 0 6m2.92-7c-2 2.5 2 5.5 0 8m2.92-7c-2 2.5 2 3.5 0 6" />
	</g>
  `,
});

export default Spa;
