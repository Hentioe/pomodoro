import { Dialog } from "@ark-ui/solid/dialog";
import { Accessor, JSX, Setter, Show } from "solid-js";
import { Portal } from "solid-js/web";

interface Props {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
  header?: JSX.Element;
  footer?: JSX.Element;
  children: JSX.Element;
  onCancel?: () => void;
}

export default (props: Props) => {
  const handleCancel = () => {
    if (props.onCancel) {
      props.onCancel();
    }
    props.setOpen(false);
  };

  return (
    <Dialog.Root lazyMount unmountOnExit open={props.open()} onOpenChange={handleCancel}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Show when={props.header}>
              <div data-scope="dialog" data-part="header">
                {props.header}
              </div>
            </Show>
            <Dialog.Description>{props.children}</Dialog.Description>
            <Show when={props.footer}>
              <div data-scope="dialog" data-part="footer">
                {props.footer}
              </div>
            </Show>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
