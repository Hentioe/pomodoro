import * as i18n from "@solid-primitives/i18n";
import { info } from "@tauri-apps/plugin-log";
import { createMemo, createSignal } from "solid-js";
import * as en from "./i18n/en";
import * as zhHans from "./i18n/zh-hans";

export type Dict = typeof zhHans.dict;

export const dict: Record<Locale, Dict> = {
  "zh-hans": zhHans.dict as Dict,
  "en": en.dict as Dict,
};

function loadEnvLocale(): Locale {
  return navigator.language.startsWith("zh-") ? "zh-hans" : "en";
}

export const envLocale = loadEnvLocale();

info("Detected locale: " + envLocale);

export function saveLocale(locale: Locale) {
  localStorage.setItem("locale", locale);
}

export function clearSavedLocale() {
  localStorage.removeItem("locale");
}

// 监听语言变化
window.addEventListener("languagechange", () => {
  setLocale(loadEnvLocale());
});

export const [locale, setLocale] = createSignal<Locale>(envLocale);
const getflatDict = createMemo(() => i18n.flatten(dict[locale()]));

export const useTranslator = () => {
  return i18n.translator(getflatDict);
};

export const proxyTranslator = () => {
  const t = i18n.translator(() => getflatDict(), i18n.resolveTemplate);

  return i18n.proxyTranslator(t);
};
