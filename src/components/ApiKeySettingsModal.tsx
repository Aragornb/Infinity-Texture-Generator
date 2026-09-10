import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Cpu,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  Laptop,
  Server,
  Settings,
  Sparkles,
  X,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { getStoredApiKey, removeStoredApiKey, setStoredApiKey } from '../utils/apiKeyStorage';

interface ApiKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasEnvKey: boolean;
  onKeyUpdated?: () => void;
}

export const ApiKeySettingsModal: React.FC<ApiKeySettingsModalProps> = ({
  isOpen,
  onClose,
  hasEnvKey,
  onKeyUpdated,
}) => {
  const { t } = useLanguage();
  const [storedKey, setStoredKeyState] = useState<string>('');
  const [inputKey, setInputKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = getStoredApiKey();
      setStoredKeyState(current);
      setInputKey(current);
      setTestResult(null);
      setToastMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = inputKey.trim();
    setStoredApiKey(trimmed);
    setStoredKeyState(trimmed);
    setToastMessage(trimmed ? t('testSuccess') : t('removeKeyBtn'));
    if (onKeyUpdated) onKeyUpdated();
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemove = () => {
    removeStoredApiKey();
    setStoredKeyState('');
    setInputKey('');
    setTestResult(null);
    setToastMessage(t('removeKeyBtn'));
    if (onKeyUpdated) onKeyUpdated();
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTestConnection = async () => {
    const keyToTest = inputKey.trim() || storedKey;
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(keyToTest ? { 'x-gemini-api-key': keyToTest } : {}),
        },
        body: JSON.stringify({ apiKey: keyToTest }),
      });
      const data = await res.json();
      if (data.valid) {
        setTestResult({
          success: true,
          message: data.message || t('testSuccess'),
        });
      } else {
        setTestResult({
          success: false,
          message: data.message || t('testFailed'),
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Falha ao conectar com o servidor.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="modal-open-core-settings"
        className="bg-[#0c0e14] border border-white/10 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-4 sticky top-0 bg-[#0c0e14]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <span>{t('openCoreSettingsTitle')}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Open Core
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {t('openCoreSettingsSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-settings-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 flex-1">
          {/* Active Operating Status Banner */}
          <div className="p-3.5 rounded-lg border bg-black/40 border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider block">
                {t('activeEngineMode')}
              </span>
              <div className="flex items-center gap-2 mt-1">
                {hasEnvKey ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-xs font-semibold text-emerald-300">
                      {t('modeEnvKeyActive')}
                    </span>
                  </>
                ) : storedKey ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                    <span className="text-xs font-semibold text-cyan-300">
                      {t('modeBrowserKeyActive')}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-xs font-semibold text-amber-300">
                      {t('modeOpenCoreActive')}
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              id="btn-test-connection"
              onClick={handleTestConnection}
              disabled={isTesting || (!hasEnvKey && !storedKey && !inputKey.trim())}
              className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              {isTesting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>{isTesting ? t('testingKey') : t('testKeyBtn')}</span>
            </button>
          </div>

          {/* Test connection alert message if any */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="font-mono text-[11px] leading-relaxed">{testResult.message}</span>
            </div>
          )}

          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-2.5 rounded-lg bg-cyan-950/50 border border-cyan-500/40 text-cyan-200 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Direct Browser Key Entry Form */}
          <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="input-gemini-key"
                className="text-xs font-bold text-gray-200 font-mono flex items-center gap-2 uppercase tracking-wide"
              >
                <Key className="w-4 h-4 text-cyan-400" />
                <span>{t('apiKeyInputLabel')}</span>
              </label>

              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 hover:underline transition-colors"
              >
                <span>{t('getKeyLink')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative flex items-center">
              <input
                id="input-gemini-key"
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder={t('apiKeyInputPlaceholder')}
                className="w-full bg-[#050608] border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 rounded-lg pl-3.5 pr-10 py-2.5 text-xs text-white font-mono placeholder-gray-600 outline-hidden transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 p-1 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                title={showKey ? 'Ocultar chave' : 'Mostrar chave'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                id="btn-save-key-storage"
                onClick={handleSave}
                disabled={!inputKey.trim()}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-black font-bold rounded-md flex items-center gap-2 text-xs transition-all glow-cyan disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider font-mono cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-black" />
                <span>{t('saveKeyBtn')}</span>
              </button>

              {storedKey && (
                <button
                  type="button"
                  id="btn-remove-key-storage"
                  onClick={handleRemove}
                  className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-md flex items-center gap-1.5 text-xs transition-all uppercase tracking-wider font-mono cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t('removeKeyBtn')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Open Core Architecture Explanation Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 font-bold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('openCoreConceptTitle')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Card 1: Local Deterministic */}
              <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400">
                  <Laptop className="w-4 h-4" />
                  <h4 className="text-xs font-bold font-mono text-gray-200">
                    {t('openCoreCard1Title')}
                  </h4>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {t('openCoreCard1Desc')}
                </p>
              </div>

              {/* Card 2: Environment Variable */}
              <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Server className="w-4 h-4" />
                  <h4 className="text-xs font-bold font-mono text-gray-200">
                    {t('openCoreCard2Title')}
                  </h4>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {t('openCoreCard2Desc')}
                </p>
              </div>

              {/* Card 3: Browser localStorage */}
              <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Key className="w-4 h-4" />
                  <h4 className="text-xs font-bold font-mono text-gray-200">
                    {t('openCoreCard3Title')}
                  </h4>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {t('openCoreCard3Desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-md text-xs font-mono transition-colors cursor-pointer"
          >
            {t('settingsCloseBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
