export type SupportedLanguage = 'pt' | 'en' | 'es' | 'zh' | 'ja';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  short: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'pt', name: 'Português (Brasil)', nativeName: 'Português (BR)', flag: '🇧🇷', short: 'PT' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', short: 'EN' },
  { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸', short: 'ES' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', short: 'ZH' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', short: 'JA' },
];
