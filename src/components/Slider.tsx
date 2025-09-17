import { Slider } from "@ark-ui/solid/slider";

interface Props {
  label: string;
  value: number;
  onValueChangeEnd?: (value: number) => void;
}

export default (props: Props) => {
  const handleValueChangeEnd = (value: number) => {
    props.onValueChangeEnd?.(value);
  };

  return (
    <Slider.Root
      defaultValue={[props.value]}
      step={0.1}
      min={0}
      max={1}
      onValueChangeEnd={details => handleValueChangeEnd(details.value[0])}
    >
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
};
