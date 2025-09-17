import { RadioGroup } from "@ark-ui/solid/radio-group";
import { Index } from "solid-js";

interface Option {
  label: string;
  value: string;
}
interface Props {
  label: string;
  options: Option[];
  value: string;
}

export default (props: Props) => {
  return (
    <RadioGroup.Root value={props.value}>
      <RadioGroup.Label>{props.label}</RadioGroup.Label>
      <Index each={props.options}>
        {(option) => (
          <RadioGroup.Item value={option().value}>
            <RadioGroup.ItemText>{option().label}</RadioGroup.ItemText>
            <RadioGroup.ItemControl />
            <RadioGroup.ItemHiddenInput />
          </RadioGroup.Item>
        )}
      </Index>
    </RadioGroup.Root>
  );
};
