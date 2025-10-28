import { Accessor, createSignal, onMount, Setter } from "solid-js";
import { MusicName, onSettingsUpdated, ping, previewSound, TickName, writeSettings } from "tauri-plugin-backend-api";
import { StandardDialog } from "../components";
import Rodio, { RodioOption } from "../components/Rodio";
import { useTranslator } from "../i18n";
import icons from "../icons";

interface Props {
  open: Accessor<boolean>;
  setOpen: Setter<boolean>;
}

const DEFAULT_TICK_SOUND: TickName = "default_tick";
const DEFAULT_BACKGROUND_MUSIC: MusicName = "none";

export default (props: Props) => {
  const t = useTranslator();
  const [editingTick, setEditingTick] = createSignal<TickName>(DEFAULT_TICK_SOUND);
  const [submittedTick, setSubmittedTick] = createSignal<TickName>(DEFAULT_TICK_SOUND);
  const [editingBackground, setEditingBackground] = createSignal<MusicName>(DEFAULT_BACKGROUND_MUSIC);
  const [submittedBackground, setSubmittedBackground] = createSignal<MusicName>(DEFAULT_BACKGROUND_MUSIC);

  const tickOptions: RodioOption[] = [
    { label: t("sounds.none"), value: "none", icon: icons.RemixNone },
    { label: t("sounds.tick.pointer"), value: "default_tick", icon: icons.RemixClockHands },
    { label: t("sounds.tick.tick_tock"), value: "tick-tock_tick", icon: icons.RemixTickTock },
    { label: t("sounds.tick.mokugyo"), value: "mokugyo_tick", icon: icons.RemixMokugyo },
    // { label: t("sounds.tick.heartbeat"), value: "heartbeat_tick" },
    { label: t("sounds.tick.ekg"), value: "ekg_tick", icon: icons.RemixEkg },
    // { label: t("sounds.tick.kun"), value: "kun_tick" },
  ];

  const backgroundOptions: RodioOption[] = [
    { label: t("sounds.none"), value: "none", icon: icons.RemixNone },
    // { label: t("sounds.background.white_noise"), value: "white-noise_music" },
    { label: t("sounds.background.timer"), value: "timer_music", icon: icons.RemixTimer },
    { label: t("sounds.background.rain"), value: "rain_music", icon: icons.RemixRainStrong },
    { label: t("sounds.background.rain_thunder"), value: "rain-thunder_music", icon: icons.RemixRainThunder },
    { label: t("sounds.background.wind_strong"), value: "wind-strong_music", icon: icons.RemixWindStrong },
    { label: t("sounds.background.beach"), value: "beach_music", icon: icons.RemixBeach },
    { label: t("sounds.background.bonfire"), value: "bonfire_music", icon: icons.RemixBonfire },
    { label: t("sounds.background.nature_stream"), value: "nature-stream_music", icon: icons.RemixNatureStream },
    { label: t("sounds.background.nature_crickets"), value: "nature-crickets_music", icon: icons.RemixNatureCrickets },
  ];

  const handleTickChange = async (value: string) => {
    const tick = value as TickName;
    setEditingTick(tick);
    await previewSound(tick, 1.0);
  };

  const handleBackgroundChange = async (value: string) => {
    const music = value as MusicName;
    setEditingBackground(music);
    await previewSound(music, 1.0);
  };

  const handleSoundConfirm = async () => {
    if (editingTick() !== submittedTick()) {
      await writeSettings({ tickSound: editingTick() });
    }
    if (editingBackground() !== submittedBackground()) {
      await writeSettings({ backgroundMusic: editingBackground() });
    }

    return true;
  };

  const handleSoundCancel = () => {
    setEditingTick(submittedTick());
    setEditingBackground(submittedBackground());
  };

  onMount(async () => {
    await onSettingsUpdated((settings) => {
      if (settings.tickSound != null) {
        setEditingTick(settings.tickSound);
        setSubmittedTick(settings.tickSound);
      }

      if (settings.backgroundMusic != null) {
        setEditingBackground(settings.backgroundMusic);
        setSubmittedBackground(settings.backgroundMusic);
      }
    });

    await ping("--push=settings");
  });

  return (
    <StandardDialog
      title={t("sounds.title")}
      open={props.open}
      setOpen={props.setOpen}
      onConfirm={handleSoundConfirm}
      onCancel={handleSoundCancel}
    >
      <div class="flex flex-col gap-[1rem]">
        <Rodio
          label={t("sounds.tick_sound")}
          value={editingTick()}
          options={tickOptions}
          onValueChange={handleTickChange}
        />
        <Rodio
          label={t("sounds.background_music")}
          value={editingBackground()}
          options={backgroundOptions}
          onValueChange={handleBackgroundChange}
        />
      </div>
    </StandardDialog>
  );
};
