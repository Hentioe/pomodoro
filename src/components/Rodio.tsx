import { RadioGroup } from "@ark-ui/solid/radio-group";
import { Icon, IconifyIcon } from "@iconify-icon/solid";
import { Index, Show } from "solid-js";

export interface RodioOption {
  label: string;
  value: string;
  icon?: string | IconifyIcon;
}

interface Props {
  label: string;
  options: RodioOption[];
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
              <div class="flex items-center gap-[0.5rem]">
                <Show when={option().icon}>
                  <Icon icon={option().icon!} class="text-[1.5rem] w-[1.5rem] h-[1.5rem]" />
                </Show>
                <RadioGroup.ItemText>{option().label}</RadioGroup.ItemText>
              </div>
              <RadioGroup.ItemControl />
              <RadioGroup.ItemHiddenInput />
            </RadioGroup.Item>
          )}
        </Index>
      </div>
    </RadioGroup.Root>
  );
};
