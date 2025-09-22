import { openUrl } from "@tauri-apps/plugin-opener";
import { Accessor, For, Setter } from "solid-js";
import { Dialog } from "../components";

export default (props: { update?: Update; open: Accessor<boolean>; setOpen: Setter<boolean> }) => {
  const handleUpdateConfirm = async () => {
    const url = props.update?.download?.[0].url;
    if (url) {
      await openUrl(url);
    }

    return true;
  };

  const ChangelogSummary = (props: { content: string }) => {
    return (
      <For each={props.content.split("\n")}>
        {(line) => <p>{line}</p>}
      </For>
    );
  };

  return (
    <Dialog
      title="发现新版本"
      open={props.open}
      setOpen={props.setOpen}
      onConfirm={handleUpdateConfirm}
      confirmText="前往下载"
    >
      <ChangelogSummary content={props.update?.changelog?.summary || "无更新内容"} />
    </Dialog>
  );
};
