import { Dialog } from "@ark-ui/solid/dialog";
import { Accessor, JSX, Setter } from "solid-js";
import { Portal } from "solid-js/web";

interface Props {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
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
            <Dialog.Description>{props.children}</Dialog.Description>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
