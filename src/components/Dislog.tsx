import { Dialog } from "@ark-ui/solid/dialog";
import { Accessor, JSX, Setter } from "solid-js";
import { Portal } from "solid-js/web";

interface Props {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
  title: string;
  children: JSX.Element;
  confirmText?: string;
  onConfirm?: () => Promise<boolean>;
  onCancel?: () => void;
}

export default (props: Props) => {
  const handleConfirm = async () => {
    if (props.onConfirm) {
      if (await props.onConfirm()) {
        // 确定回调返回成功才关闭
        props.setOpen(false);
      }
    } else {
      props.setOpen(false);
    }
  };

  const handleCancel = () => {
    if (props.onCancel) {
      props.onCancel();
    }
    props.setOpen(false);
  };

  return (
    <Dialog.Root lazyMount unmountOnExit open={props.open()} onOpenChange={() => props.setOpen(false)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <div>
              <Dialog.Title>{props.title}</Dialog.Title>
              <Dialog.Description>{props.children}</Dialog.Description>
            </div>
            <div class="flex justify-end items-center">
              <div class="flex gap-[2rem]">
                <DialogButton onClick={handleCancel}>取消</DialogButton>
                <DialogButton onClick={handleConfirm}>{props.confirmText || "确认"}</DialogButton>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

const DialogButton = (props: { children: JSX.Element; onClick?: () => void }) => {
  const handleClick = () => {
    if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <button onClick={handleClick} class="text-red-400">
      {props.children}
    </button>
  );
};
