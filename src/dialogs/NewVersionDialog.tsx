import RocketPhoto from "/src/assets/images/rocket.png";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Accessor, For, Setter } from "solid-js";
import { downloadPackage, toast } from "tauri-plugin-backend-api";
import { BasicDialog } from "../components";
import CloseableTitleBar from "../components/CloseableTitleBar";

export default (props: { update?: Update; open: Accessor<boolean>; setOpen: Setter<boolean> }) => {
  const handleUpdate = async () => {
    const url = props.update?.download?.[0].url;
    if (url) {
      await downloadPackage(url, props.update?.latest || "unknown");
      await toast("更新包正在下载，从通知中查看进度");
    }

    props.setOpen(false);
  };

  const handleBrowserDownload = async () => {
    const url = props.update?.download?.[0].url;
    if (url) {
      await openUrl(url);
      await toast("请留意浏览器的下载任务");
    }

    props.setOpen(false);
  };

  const Footer = () => {
    return (
      <div class="flex flex-col gap-[0.75rem]">
        <button onClick={handleUpdate} class="w-full bg-blue-500 text-zinc-50 py-[0.5rem] rounded-full text-center">
          立即更新
        </button>
        <button onClick={handleBrowserDownload}>从浏览器下载</button>
      </div>
    );
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
    <BasicDialog
      open={props.open}
      setOpen={props.setOpen}
      header={<CloseableTitleBar title="发现新版本" setOpen={props.setOpen} />}
      footer={<Footer />}
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
    </BasicDialog>
  );
};
