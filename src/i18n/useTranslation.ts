import { useI18n } from "./I18nProvider";

export function useTranslation<K extends keyof typeof import("./locales/en").en>(module: K) {
  const { dict, lang } = useI18n();
  return {
    t: dict[module],
    lang
  };
}
