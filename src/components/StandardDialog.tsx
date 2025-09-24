import { Dialog } from "@ark-ui/solid/dialog";
import { Accessor, JSX, Setter, Show } from "solid-js";
import BasicDialog from "./BasicDialog";

interface ActionButtonsProps {
  onConfirm?: () => Promise<boolean>;
  onCancel?: () => void;
  confirmText?: string;
  hiddenCancel?: boolean;
}

interface Props {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
  title: string;
  children: JSX.Element;
}

export default (props: Props & ActionButtonsProps) => {
  const handleConfirm = async () => {
    if (props.onConfirm) {
      if (await props.onConfirm()) {
        // 确定回调返回成功才关闭
        props.setOpen(false);
      }
    } else {
      props.setOpen(false);
    }

    return true;
  };

  const handleCancel = () => {
    if (props.onCancel) {
      props.onCancel();
    }
    props.setOpen(false);
  };

  const Header = () => <Dialog.Title>{props.title}</Dialog.Title>;
  const Footer = () => (
    <ActionButtons
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      confirmText={props.confirmText}
      hiddenCancel={props.hiddenCancel}
    />
  );

  return (
    <BasicDialog open={props.open} setOpen={props.setOpen} header={<Header />} footer={<Footer />}>
      {props.children}
    </BasicDialog>
  );
};

const ActionButtons = (props: ActionButtonsProps) => {
  return (
    <div class="flex justify-end items-center">
      <div class="flex gap-[2rem]">
        <Show when={!props.hiddenCancel}>
          <DialogButton onClick={props.onCancel}>取消</DialogButton>
        </Show>
        <DialogButton onClick={props.onConfirm}>{props.confirmText || "确认"}</DialogButton>
      </div>
    </div>
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
