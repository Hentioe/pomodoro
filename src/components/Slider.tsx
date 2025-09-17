import { Slider } from "@ark-ui/solid/slider";

interface Props {
  label: string;
  value: number;
}

export default (props: Props) => (
  <Slider.Root value={[props.value]} step={0.1} min={0} max={1}>
    <Slider.Label>{props.label}</Slider.Label>
    <Slider.Control>
      <Slider.Track>
        <Slider.Range />
      </Slider.Track>
      <Slider.Thumb index={0}>
        <Slider.HiddenInput />
      </Slider.Thumb>
    </Slider.Control>
  </Slider.Root>
);
