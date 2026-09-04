import React, { useRef, useState } from 'react';
import { Sparkles, Upload, Wand2 } from 'lucide-react';

interface PromptOrUploadProps {
  isGenerating: boolean;
  onGenerateFromPrompt: (prompt: string) => void;
  onUploadImage: (file: File) => void;
}

export const PromptOrUpload: React.FC<PromptOrUploadProps> = ({
  isGenerating,
  onGenerateFromPrompt,
  onUploadImage,
}) => {
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
      {/* Top section: Prompt Input and Image Upload side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Prompt Input Form */}
        <form
          onSubmit={handleSubmitPrompt}
          className="lg:col-span-7 flex flex-col justify-between bg-black/50 p-4 rounded-xl border border-white/5"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <label htmlFor="material-prompt-input" className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono">
                SÍNTESE DE MATERIAL VIA PROMPT IA
              </label>
            </div>
            <p className="text-[11px] text-gray-400">
              A inteligência artificial analisa as características físicas do material e sintetiza o conjunto completo de mapas PBR seamless.
            </p>
            <div className="relative">
              <input
                type="text"
                id="material-prompt-input"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Ex: Mármore Carrara branco polido com veios dourados, ou placa de titânio escovado..."
                disabled={isGenerating}
                className="w-full bg-[#050608]/90 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-gray-600 outline-hidden transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
            <span className="text-[10px] font-mono text-gray-500">Ex: Tijolo rústico, Madeira nobre, Aço escovado</span>
            <button
              type="submit"
              id="btn-generate-ai-material"
              disabled={isGenerating || !promptText.trim()}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-black font-bold rounded-md flex items-center gap-2 text-xs transition-all glow-cyan disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider font-mono"
            >
              <Wand2 className={`w-3.5 h-3.5 text-black ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Gerando...' : 'Gerar com IA'}</span>
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
          <p className="text-xs font-semibold text-white text-center">
            Carregue uma Foto / Imagem Exemplo
          </p>
          <p className="text-[11px] text-gray-500 text-center mt-0.5">
            Arraste um arquivo ou clique para selecionar (JPG, PNG)
          </p>
        </div>
      </div>
    </div>
  );
};
