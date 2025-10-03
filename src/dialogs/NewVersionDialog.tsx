import RocketPhoto from "/src/assets/images/rocket.png";
import { destructure } from "@solid-primitives/destructure";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Accessor, For, Setter } from "solid-js";
import { downloadPackage, toast } from "tauri-plugin-backend-api";
import { BasicDialog } from "../components";
import CloseableTitleBar from "../components/CloseableTitleBar";
import { useTranslator } from "../i18n";
import { globalState } from "../states/global";

export default (props: { open: Accessor<boolean>; setOpen: Setter<boolean> }) => {
  const t = useTranslator();
  const { update } = destructure(globalState);

  const handleUpdate = async () => {
    const url = update()?.download?.[0].url;
    if (url) {
      await downloadPackage(url, update()?.latest || "unknown");
      await toast(t("new_version.downloading_notice"));
    }

    props.setOpen(false);
  };

  const handleBrowserDownload = async () => {
    const url = update()?.download?.[0].url;
    if (url) {
      await openUrl(url);
      await toast(t("new_version.downloading_notice_browser"));
    }

    props.setOpen(false);
  };

  const Footer = () => {
    return (
      <div class="flex flex-col gap-[0.75rem]">
        <button onClick={handleUpdate} class="w-full bg-blue-500 text-zinc-50 py-[0.5rem] rounded-full text-center">
          {t("new_version.update_now")}
        </button>
        <button onClick={handleBrowserDownload}>{t("new_version.download_from_browser")}</button>
      </div>
    );
  };

  const ChangelogDetails = (props: { details?: string[] }) => {
    return (
      <ul class="list-disc pl-[1rem] text-[0.9rem] tracking-wide">
        <For each={props.details}>
          {(line) => <li>{line}</li>}
        </For>
      </ul>
    );
  };

  return (
    <BasicDialog
      open={props.open}
      setOpen={props.setOpen}
      header={<CloseableTitleBar title={t("new_version.title")} setOpen={props.setOpen} />}
      footer={<Footer />}
    >
      <div>
        <div class="flex justify-center">
          <img src={RocketPhoto} class="w-[3rem]" />
        </div>
        <p class="mt-[1rem] text-center text-red-600 font-mono">
          {update()?.latest || t("new_version.unknown_version")}
        </p>
        <p class="mt-[0.5rem] text-center">
          {update()?.changelog?.summary || t("new_version.no_release_notes")}
        </p>
      </div>
      <div class="my-[1rem] w-full h-[1px] bg-zinc-200" />
      <ChangelogDetails details={update()?.changelog?.details} />
    </BasicDialog>
  );
};
