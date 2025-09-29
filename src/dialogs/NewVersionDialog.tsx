// import { openUrl } from "@tauri-apps/plugin-opener";
import RocketPhoto from "/src/assets/images/rocket.png";
import { Accessor, For, Setter } from "solid-js";
import { downloadPackage, toast } from "tauri-plugin-backend-api";
import { StandardDialog } from "../components";

export default (props: { update?: Update; open: Accessor<boolean>; setOpen: Setter<boolean> }) => {
  const handleUpdateConfirm = async () => {
    const url = props.update?.download?.[0].url;
    if (url) {
      // await openUrl(url);
      await downloadPackage(url, props.update?.latest || "unknown");
      await toast("更新包正在下载，从通知中查看进度");
    }

    return true;
  };

  const ChangelogDetails = (props: { details?: string[] }) => {
    return (
      <div class="flex flex-col gap-[0.25rem]">
        <For each={props.details}>
          {(line) => <p>•&nbsp;&nbsp;{line}</p>}
        </For>
      </div>
    );
  };

  return (
    <StandardDialog
      title={"发现新版本"}
      open={props.open}
      setOpen={props.setOpen}
      onConfirm={handleUpdateConfirm}
      confirmText="开始下载"
    >
      <div>
        <div class="flex justify-center">
          <img src={RocketPhoto} class="w-[3rem]" />
        </div>
        <p class="mt-[1rem] text-center text-red-600 font-mono">
          {props.update?.latest || "未知版本号"}
        </p>
        <p class="mt-[0.5rem] text-center">
          {props.update?.changelog?.summary || "暂无更新摘要。"}
        </p>
      </div>
      <div class="my-[1rem] w-full h-[1px] bg-zinc-200" />
      <ChangelogDetails details={props.update?.changelog?.details} />
    </StandardDialog>
  );
};
