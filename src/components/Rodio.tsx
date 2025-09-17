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
  onValueChange?: (value: string) => void;
}

export default (props: Props) => {
  const handleValueChange = (value: string) => {
    if (props.onValueChange) {
      props.onValueChange(value);
    }
  };

  return (
    <RadioGroup.Root value={props.value} onValueChange={(details) => handleValueChange(details.value!)}>
      <RadioGroup.Label>{props.label}</RadioGroup.Label>
      <div class="flex flex-col gap-[1rem]">
        <Index each={props.options}>
          {(option) => (
            <RadioGroup.Item value={option().value}>
              <RadioGroup.ItemText>{option().label}</RadioGroup.ItemText>
              <RadioGroup.ItemControl />
              <RadioGroup.ItemHiddenInput />
            </RadioGroup.Item>
          )}
        </Index>
      </div>
    </RadioGroup.Root>
  );
};
