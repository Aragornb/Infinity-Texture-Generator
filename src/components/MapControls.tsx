import React from 'react';
import { MaterialProperties, TextureResolution } from '../types';
import { Eraser, Eye, RefreshCw, RotateCcw, Settings2, Sliders, Sparkles, Sun } from 'lucide-react';

interface MapControlsProps {
  material: MaterialProperties;
  resolution: TextureResolution;
  isProcessing: boolean;
  onMaterialChange: (updated: Partial<MaterialProperties>) => void;
  onResolutionChange: (res: TextureResolution) => void;
  onRecomputeMaps: () => void;
  onResetToInitial?: () => void;
  onClearToDefault?: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  material,
  resolution,
  isProcessing,
  onMaterialChange,
  onResolutionChange,
  onRecomputeMaps,
  onResetToInitial,
  onClearToDefault,
}) => {
  return (
    <div className="w-full glass rounded-xl p-4 shadow-xl flex flex-col gap-4 text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-sm tracking-tight uppercase font-mono">
            Ajustes dos Mapas PBR & Resolução
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onClearToDefault && (
            <button
              type="button"
              id="btn-header-clear-material"
              onClick={onClearToDefault}
              disabled={isProcessing}
              className="px-2.5 py-1 bg-white/5 hover:bg-red-500/15 text-gray-300 hover:text-red-300 font-mono text-[11px] rounded flex items-center gap-1.5 transition-all border border-white/5 hover:border-red-500/30 cursor-pointer disabled:opacity-40"
              title="Voltar para o material genérico padrão sem textura aplicada"
            >
              <Eraser className="w-3 h-3 text-red-400" />
              <span>Limpar Material</span>
            </button>
          )}

          {onResetToInitial && (
            <button
              type="button"
              id="btn-header-reset-initial"
              onClick={onResetToInitial}
              disabled={isProcessing}
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-cyan-300 font-mono text-[11px] rounded flex items-center gap-1.5 transition-all border border-white/5 cursor-pointer disabled:opacity-40"
              title="Restaurar configurações padrão do material gerado"
            >
              <RotateCcw className="w-3 h-3 text-cyan-400" />
              <span>Configurações Iniciais</span>
            </button>
          )}

          {/* Resolution selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 text-[10px] uppercase font-mono mr-1">Resolução:</span>
            {([1024, 2048, 4096] as const).map((res) => (
              <button
                key={res}
                type="button"
                id={`btn-res-${res}`}
                onClick={() => onResolutionChange(res)}
                disabled={isProcessing}
                className={`px-2 py-1 rounded text-xs font-mono font-semibold transition-all ${
                  resolution === res
                    ? 'bg-cyan-500 text-black font-bold glow-cyan-sm shadow-sm'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {res === 4096 ? '4K (4096)' : res === 2048 ? '2K (2048)' : '1K (1024)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Control Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Normal Map Strength & Format */}
        <div className="space-y-2 bg-black/40 p-3 rounded-lg border border-white/5">
          <div className="flex items-center justify-between">
            <label htmlFor="normal-strength-input" className="text-gray-300 font-medium">
              Intensidade da Normal:
            </label>
            <span className="font-mono text-cyan-400 font-bold">{material.normalStrength.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            id="normal-strength-input"
            min="0.5"
            max="6.0"
            step="0.1"
            value={material.normalStrength}
            onChange={(e) => onMaterialChange({ normalStrength: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-gray-400 text-[11px] font-mono">Formato Normal:</span>
            <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded border border-white/5 font-mono">
              <button
                type="button"
                id="normal-format-opengl"
                onClick={() => onMaterialChange({ normalFormat: 'OpenGL' })}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  material.normalFormat === 'OpenGL'
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="OpenGL (Blender, Maya, Unity, WebGL) - Y+"
              >
                OpenGL (Y+)
              </button>
              <button
                type="button"
                id="normal-format-directx"
                onClick={() => onMaterialChange({ normalFormat: 'DirectX' })}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  material.normalFormat === 'DirectX'
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="DirectX (Unreal Engine 5, 3ds Max) - Y-"
              >
                DirectX (Y-)
              </button>
            </div>
          </div>
        </div>

        {/* Roughness Base & Metallic */}
        <div className="space-y-2 bg-black/40 p-3 rounded-lg border border-white/5">
          <div className="flex items-center justify-between">
            <label htmlFor="base-roughness-input" className="text-gray-300 font-medium">
              Rugosidade Média (Roughness):
            </label>
            <span className="font-mono text-cyan-300 font-bold">{material.baseRoughness.toFixed(2)}</span>
          </div>
          <input
            type="range"
            id="base-roughness-input"
            min="0.05"
            max="0.95"
            step="0.01"
            value={material.baseRoughness}
            onChange={(e) => onMaterialChange({ baseRoughness: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />

          <div className="flex items-center justify-between pt-1">
            <label htmlFor="metallic-input" className="text-gray-400 text-[11px]">
              Metalicidade (Metallic):
            </label>
            <span className="font-mono text-gray-300 text-[11px]">{material.metallic.toFixed(2)}</span>
          </div>
          <input
            type="range"
            id="metallic-input"
            min="0.0"
            max="1.0"
            step="0.05"
            value={material.metallic}
            onChange={(e) => onMaterialChange({ metallic: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Displacement & Seamless Blending */}
        <div className="space-y-2 bg-black/40 p-3 rounded-lg border border-white/5">
          <div className="flex items-center justify-between">
            <label htmlFor="disp-scale-input" className="text-gray-300 font-medium">
              Escala de Deslocamento (Height):
            </label>
            <span className="font-mono text-cyan-400 font-bold">{material.displacementScale.toFixed(3)}m</span>
          </div>
          <input
            type="range"
            id="disp-scale-input"
            min="0.002"
            max="0.08"
            step="0.002"
            value={material.displacementScale}
            onChange={(e) => onMaterialChange({ displacementScale: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />

          <div className="flex items-center justify-between pt-1">
            <label htmlFor="seamless-width-input" className="text-gray-400 text-[11px]">
              Largura de Emenda Seamless:
            </label>
            <span className="font-mono text-gray-300 text-[11px]">{Math.round(material.seamlessBlendWidth * 100)}%</span>
          </div>
          <input
            type="range"
            id="seamless-width-input"
            min="0.05"
            max="0.35"
            step="0.01"
            value={material.seamlessBlendWidth}
            onChange={(e) => onMaterialChange({ seamlessBlendWidth: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Transparency (Transmission / Opacity) */}
        <div className="space-y-2 bg-black/40 p-3 rounded-lg border border-white/5">
          <div className="flex items-center justify-between">
            <label htmlFor="transparency-input" className="text-gray-300 font-medium flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Transparência:</span>
            </label>
            <span className="font-mono text-cyan-400 font-bold">
              {Math.round((material.transparency ?? 0) * 100)}%
            </span>
          </div>
          <input
            type="range"
            id="transparency-input"
            min="0"
            max="1"
            step="0.01"
            value={material.transparency ?? 0}
            onChange={(e) => onMaterialChange({ transparency: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
            <span>0% Opaco</span>
            <span>50% Translúcido</span>
            <span>100% Vidro</span>
          </div>
        </div>

        {/* Refraction (IOR - Index of Refraction) */}
        <div className="space-y-2 bg-black/40 p-3 rounded-lg border border-white/5">
          <div className="flex items-center justify-between">
            <label htmlFor="ior-input" className="text-gray-300 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Refração (Índice IOR):</span>
            </label>
            <span className="font-mono text-amber-300 font-bold">
              {(material.ior ?? 1.5).toFixed(3)}
            </span>
          </div>
          <input
            type="range"
            id="ior-input"
            min="1.0"
            max="2.8"
            step="0.01"
            value={material.ior ?? 1.5}
            onChange={(e) => onMaterialChange({ ior: parseFloat(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[9px] font-mono text-gray-400 pt-0.5">
            <button
              type="button"
              id="btn-ior-water"
              onClick={() => onMaterialChange({ ior: 1.333 })}
              className="hover:text-amber-300 underline cursor-pointer"
              title="Água (1.333)"
            >
              Água 1.33
            </button>
            <button
              type="button"
              id="btn-ior-fabric"
              onClick={() => onMaterialChange({ ior: 1.45 })}
              className="hover:text-amber-300 underline cursor-pointer"
              title="Tecido / Acrílico (1.45)"
            >
              Tecido 1.45
            </button>
            <button
              type="button"
              id="btn-ior-glass"
              onClick={() => onMaterialChange({ ior: 1.52 })}
              className="hover:text-amber-300 underline cursor-pointer"
              title="Vidro / Cristal (1.52)"
            >
              Vidro 1.52
            </button>
            <button
              type="button"
              id="btn-ior-diamond"
              onClick={() => onMaterialChange({ ior: 2.42 })}
              className="hover:text-amber-300 underline cursor-pointer"
              title="Diamante (2.42)"
            >
              Diamante 2.42
            </button>
          </div>
        </div>

        {/* Emission (Glow / Emissive Intensity) */}
        <div className="space-y-2 bg-black/40 p-3 rounded-lg border border-white/5">
          <div className="flex items-center justify-between">
            <label htmlFor="emissive-input" className="text-gray-300 font-medium flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-yellow-400" />
              <span>Emissão (Glow / Luz):</span>
            </label>
            <span className="font-mono text-yellow-400 font-bold">
              {(material.emissiveIntensity ?? 0).toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            id="emissive-input"
            min="0"
            max="5"
            step="0.05"
            value={material.emissiveIntensity ?? 0}
            onChange={(e) => onMaterialChange({ emissiveIntensity: parseFloat(e.target.value) })}
            className="w-full accent-yellow-400 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
            <span>0.0x Inativo</span>
            <span>2.5x Difuso</span>
            <span>5.0x Néon Intenso</span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Limpar Material, Configurações Iniciais & Recalcular Mapas */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-2.5">
          {onClearToDefault && (
            <button
              type="button"
              id="btn-footer-clear-material"
              onClick={onClearToDefault}
              disabled={isProcessing}
              className="px-3.5 py-2 bg-white/5 hover:bg-red-500/15 active:scale-[0.98] text-gray-300 hover:text-red-200 font-medium rounded-md flex items-center gap-2 transition-all border border-white/10 hover:border-red-500/30 uppercase tracking-wider font-mono text-xs cursor-pointer disabled:opacity-40"
              title="Voltar para a superfície neutra genérica padrão sem textura"
            >
              <Eraser className="w-3.5 h-3.5 text-red-400" />
              <span>Limpar Material</span>
            </button>
          )}

          {onResetToInitial && (
            <button
              type="button"
              id="btn-footer-reset-initial"
              onClick={onResetToInitial}
              disabled={isProcessing}
              className="px-3.5 py-2 bg-white/5 hover:bg-white/10 active:scale-[0.98] text-gray-300 hover:text-white font-medium rounded-md flex items-center gap-2 transition-all border border-white/10 uppercase tracking-wider font-mono text-xs cursor-pointer disabled:opacity-40"
              title="Restaurar configurações originais do material gerado"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Configurações Iniciais</span>
            </button>
          )}
        </div>

        <button
          type="button"
          id="btn-recompute-maps"
          onClick={onRecomputeMaps}
          disabled={isProcessing}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 active:scale-[0.99] text-black font-bold rounded-md flex items-center gap-2 transition-all glow-cyan disabled:opacity-50 uppercase tracking-wider font-mono text-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
          <span>{isProcessing ? 'Atualizando Mapas...' : 'Recalcular Mapas com Ajustes'}</span>
        </button>
      </div>
    </div>
  );
};
