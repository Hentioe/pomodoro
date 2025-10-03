import { Dialog } from "@ark-ui/solid/dialog";
import { Accessor, JSX, Setter, Show } from "solid-js";
import { Portal } from "solid-js/web";

export interface OpenProps {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
}

interface LayoutProps {
  header?: JSX.Element;
  footer?: JSX.Element;
  children: JSX.Element;
}

interface EventProps {
  onClosed?: () => void;
}

type Props = OpenProps & LayoutProps & EventProps;

export default (props: Props) => {
  return (
    <Dialog.Root lazyMount unmountOnExit closeOnInteractOutside={false} open={props.open()}>
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
