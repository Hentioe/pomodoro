import { Slider } from "@ark-ui/solid/slider";

interface Props {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  onValueChangeEnd?: (value: number) => void;
}

export default (props: Props) => {
  const handleValueChangeEnd = (value: number) => {
    props.onValueChangeEnd?.(value);
  };

  return (
    <Slider.Root
      defaultValue={[props.value]}
      step={props.step || 0.1}
      min={props.min || 0}
      max={props.max || 1}
      onValueChange={details => props.onValueChange?.(details.value[0])}
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
