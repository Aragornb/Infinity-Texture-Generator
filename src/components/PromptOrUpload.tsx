import React, { useRef, useState } from 'react';
import { Info, Settings, Sparkles, Upload, Wand2, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface PromptOrUploadProps {
  isGenerating: boolean;
  onGenerateFromPrompt: (prompt: string) => void;
  onUploadImage: (file: File) => void;
  hasAiKey?: boolean;
  hasEnvKey?: boolean;
  onOpenSettings?: () => void;
  educationalNotice?: string | null;
  onDismissEducationalNotice?: () => void;
}

export const PromptOrUpload: React.FC<PromptOrUploadProps> = ({
  isGenerating,
  onGenerateFromPrompt,
  onUploadImage,
  hasAiKey = false,
  hasEnvKey = false,
  onOpenSettings,
  educationalNotice,
  onDismissEducationalNotice,
}) => {
  const { t } = useLanguage();
  const [promptText, setPromptText] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmitPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() || isGenerating) return;
    onGenerateFromPrompt(promptText.trim());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(file);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUploadImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="w-full glass rounded-xl p-4 shadow-2xl flex flex-col gap-4">
      {/* Educational Notice Banner if triggered by server fallback or key absence */}
      {educationalNotice && (
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-mono text-[11px] leading-relaxed">{educationalNotice}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onOpenSettings && (
              <button
                type="button"
                id="btn-educational-configure-key"
                onClick={onOpenSettings}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 rounded text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                {t('configureAiKeyBtn')}
              </button>
            )}
            {onDismissEducationalNotice && (
              <button
                type="button"
                onClick={onDismissEducationalNotice}
                className="p-1 text-amber-400 hover:text-amber-200 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top section: Prompt Input and Image Upload side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Prompt Input Form */}
        <form
          onSubmit={handleSubmitPrompt}
          className="lg:col-span-7 flex flex-col justify-between bg-black/50 p-4 rounded-xl border border-white/5"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <label
                  htmlFor="material-prompt-input"
                  className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono"
                >
                  {t('aiPromptTitle')}
                </label>
              </div>

              {/* Dynamic AI Status / Open Core Badge */}
              {onOpenSettings && (
                <button
                  type="button"
                  id="btn-prompt-ai-status"
                  onClick={onOpenSettings}
                  title={hasAiKey ? t('aiStatusActiveTooltip') : t('aiStatusLocalTooltip')}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono cursor-pointer transition-all border ${
                    hasAiKey
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/60'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400/60'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      hasAiKey ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span>{hasAiKey ? t('aiStatusGemini') : t('aiStatusDeterministic')}</span>
                  <Settings className="w-3 h-3 opacity-70 ml-0.5" />
                </button>
              )}
            </div>

            <p className="text-[11px] text-gray-400">{t('aiPromptDesc')}</p>

            <div className="relative">
              <input
                type="text"
                id="material-prompt-input"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder={t('promptPlaceholder')}
                disabled={isGenerating}
                className="w-full bg-[#050608]/90 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-gray-600 outline-hidden transition-all"
              />
            </div>

            {/* Educational hint if no AI key configured */}
            {!hasAiKey && (
              <div className="flex items-center justify-between text-[10px] font-mono text-amber-300/80 pt-0.5 px-0.5">
                <span>⚡ {t('educationalNoticeLocal')}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
            <span className="text-[10px] font-mono text-gray-500">{t('promptExamples')}</span>
            <button
              type="submit"
              id="btn-generate-ai-material"
              disabled={isGenerating || !promptText.trim()}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-black font-bold rounded-md flex items-center gap-2 text-xs transition-all glow-cyan disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider font-mono cursor-pointer"
            >
              <Wand2 className={`w-3.5 h-3.5 text-black ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? t('generatingBtn') : t('generateAiBtn')}</span>
            </button>
          </div>
        </form>

        {/* Reference Image Upload Dropzone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            isDragOver
              ? 'border-cyan-400 bg-cyan-500/10'
              : 'border-white/10 bg-black/40 hover:border-cyan-400/50 hover:bg-cyan-950/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            id="file-upload-input"
            accept="image/png,image/jpeg,image/webp,image/tiff"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="p-2.5 rounded-full bg-white/5 mb-2 text-cyan-400 border border-white/5">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-white text-center">{t('uploadTitle')}</p>
          <p className="text-[11px] text-gray-500 text-center mt-0.5">{t('uploadDesc')}</p>
        </div>
      </div>
    </div>
  );
};

