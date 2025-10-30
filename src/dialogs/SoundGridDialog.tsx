import { Icon, IconifyIcon } from "@iconify-icon/solid";
import classNames from "classnames";
import { Accessor, createSignal, For, onMount, Setter } from "solid-js";
import { MusicName, onSettingsUpdated, ping, previewSound, TickName, writeSettings } from "tauri-plugin-backend-api";
import { BasicDialog } from "../components";
import DialogDecoration, { ControlButton } from "../components/DialogDecoration";
import { useTranslator } from "../i18n";
import icons from "../icons";

interface Props {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
}

interface SoundOption {
  label: string;
  value: string;
  icon: IconifyIcon | string;
}

const DEFAULT_TICK_SOUND: TickName = "default_tick";
const DEFAULT_BACKGROUND_MUSIC: MusicName = "none";

export default (props: Props) => {
  const t = useTranslator();
  const [tick, setTick] = createSignal<TickName>(DEFAULT_TICK_SOUND);
  const [background, setBackground] = createSignal<MusicName>(DEFAULT_BACKGROUND_MUSIC);

  const tickOptions: SoundOption[] = [
    { label: t("sounds.none"), value: "none", icon: icons.RemixNone },
    { label: t("sounds.tick.clock_hand"), value: "default_tick", icon: icons.RemixClockHand },
    { label: t("sounds.tick.clock_tick_tock"), value: "clock-tick-tock_tick", icon: icons.RemixTickTock },
    { label: t("sounds.tick.mokugyo"), value: "mokugyo_tick", icon: icons.RemixMokugyo },
    // { label: t("sounds.tick.heartbeat"), value: "heartbeat_tick" },
    { label: t("sounds.tick.ekg"), value: "ekg_tick", icon: icons.RemixEkg },
    // { label: t("sounds.tick.kun"), value: "kun_tick" },
  ];

  const backgroundOptions: SoundOption[] = [
    { label: t("sounds.none"), value: "none", icon: icons.RemixNone },
    // { label: t("sounds.background.white_noise"), value: "white-noise_music" },
    { label: t("sounds.background.timer"), value: "timer_music", icon: icons.RemixTimer },
    { label: t("sounds.background.rain_strong"), value: "rain-strong_music", icon: icons.RemixRainStrong },
    { label: t("sounds.background.rain_thunder"), value: "rain-thunder_music", icon: icons.RemixRainThunder },
    { label: t("sounds.background.wind_strong"), value: "wind-strong_music", icon: icons.RemixWindStrong },
    { label: t("sounds.background.beach"), value: "beach_music", icon: icons.RemixBeach },
    { label: t("sounds.background.bonfire"), value: "bonfire_music", icon: icons.RemixBonfire },
    { label: t("sounds.background.nature_stream"), value: "nature-stream_music", icon: icons.RemixNatureStream },
    { label: t("sounds.background.nature_crickets"), value: "nature-crickets_music", icon: icons.RemixNatureCrickets },
  ];

  const handleTickChange = async (value: string) => {
    const tick = value as TickName;
    await writeSettings({ tickSound: tick });
    await previewSound(tick, 1.0);
  };

  const handleBackgroundChange = async (value: string) => {
    const music = value as MusicName;
    await writeSettings({ backgroundMusic: music });
    await previewSound(music, 1.0);
  };

  onMount(async () => {
    await onSettingsUpdated((settings) => {
      if (settings.tickSound != null) {
        setTick(settings.tickSound);
      }

      if (settings.backgroundMusic != null) {
        setBackground(settings.backgroundMusic);
      }
    });

    await ping("--push=settings");
  });

  return (
    <BasicDialog
      fullScreen
      open={props.open}
      setOpen={props.setOpen}
      header={
        <DialogDecoration
          title={t("sounds.title")}
          leftButton={ControlButton.None}
          rightButton={ControlButton.Close}
          setOpen={props.setOpen}
        />
      }
    >
      <div class="flex flex-col gap-[1rem]">
        <SoundListSection
          options={tickOptions}
          title={t("sounds.tick_sound")}
          selected={tick()}
          onSelect={handleTickChange}
        />
        <SoundListSection
          options={backgroundOptions}
          title={t("sounds.background_music")}
          selected={background()}
          onSelect={handleBackgroundChange}
        />
      </div>
    </BasicDialog>
  );
};

const SoundListSection = (
  props: { title: string; options: SoundOption[]; selected: string; onSelect: (value: string) => void },
) => {
  return (
    <div>
      <p class="font-bold text-gray-500">{props.title}</p>
      <div class="mt-[1rem] grid grid-cols-3 gap-x-[1rem] gap-y-[1rem]">
        <For each={props.options}>
          {(option) => (
            <div class="flex flex-col justify-center items-center gap-[0.5rem]">
              <div
                onClick={() => props.onSelect(option.value)}
                class={classNames([
                  "w-full aspect-square text-zinc-700 hover:bg-sky-200 rounded-full cursor-pointer transition-colors flex justify-center items-center",
                  { "bg-blue-200/70 text-blue-600!": props.selected === option.value },
                ])}
              >
                <Icon icon={option.icon!} class="text-[4rem] w-[4rem] h-[4rem]" />
              </div>
              <span class="text-zinc-600">{option.label}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
