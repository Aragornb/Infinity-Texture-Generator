import React, { useState } from 'react';
import { MaterialProperties, TextureResolution } from '../types';
import {
  Eraser,
  Eye,
  Layers,
  Maximize2,
  RefreshCw,
  RotateCcw,
  Sliders,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import {
  getLocalizedMaterialCategories,
  findMaterialPresetById,
} from '../utils/materialTypePresets';
import { useLanguage } from '../i18n/LanguageContext';

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
  const { t, language } = useLanguage();
  const [selectedTypeId, setSelectedTypeId] = useState<string>('generic');

  const localizedCategories = getLocalizedMaterialCategories(language);

  const handleSelectType = (typeId: string) => {
    setSelectedTypeId(typeId);
    if (typeId === 'custom') return;
    const preset = findMaterialPresetById(typeId);
    if (preset) {
      onMaterialChange(preset.settings);
    }
  };

  const handleSliderChange = (changes: Partial<MaterialProperties>) => {
    setSelectedTypeId('custom');
    onMaterialChange(changes);
  };

  const currentPreset = findMaterialPresetById(selectedTypeId);
  const currentTiling = material.seamlessTiling || 1;

  return (
    <div className="w-full glass rounded-xl p-4 sm:p-5 shadow-2xl flex flex-col gap-5 text-xs">
      {/* Header (Clean title & Resolution selector) */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-3.5 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm tracking-tight uppercase font-mono">
              {t('controlsTitle')}
            </h3>
          </div>
        </div>

        {/* Resolution selector */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/5">
          <span className="text-gray-400 text-[10px] uppercase font-mono px-1">
            {t('resolutionLabel')}
          </span>
          {([1024, 2048, 4096] as const).map((res) => (
            <button
              key={res}
              type="button"
              id={`btn-res-${res}`}
              onClick={() => onResolutionChange(res)}
              disabled={isProcessing}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
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

      {/* Tipo do Material Selector */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-black/50 to-black/50 p-3.5 rounded-xl border border-cyan-500/25 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-bold text-white text-xs uppercase tracking-wider font-mono">
              {t('materialTypeLabel')}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 leading-tight">
            {selectedTypeId === 'custom'
              ? t('customTypeDesc')
              : currentPreset
              ? currentPreset.description
              : t('customTypeDesc')}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            id="select-material-type"
            value={selectedTypeId}
            onChange={(e) => handleSelectType(e.target.value)}
            className="bg-zinc-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs rounded-lg px-3 py-2 outline-none focus:border-cyan-400 cursor-pointer hover:bg-zinc-800 transition-colors shadow-sm min-w-[240px]"
          >
            {selectedTypeId === 'custom' && (
              <option value="custom">{t('customType')}</option>
            )}
            {localizedCategories.map((group) => (
              <optgroup key={group.category} label={group.category} className="bg-zinc-900 text-gray-300 font-sans">
                {group.items.map((item) => (
                  <option key={item.id} value={item.id} className="text-white font-mono">
                    {item.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Structured & Visually Pleasing Control Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        
        {/* ========================================================================= */}
        {/* CARD 1: Geometria, Escala & Relevo (Surface Geometry & UV Tiling)         */}
        {/* ========================================================================= */}
        <div className="bg-[#0b0e14]/90 border border-white/10 rounded-xl p-4 flex flex-col justify-between gap-4 shadow-md">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white text-xs uppercase tracking-wide font-mono">
                {t('groupReliefTitle')}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              {t('groupReliefBadge')}
            </span>
          </div>

          <div className="space-y-4">
            {/* 1.1 Escala da Textura (UV Tiling) */}
            <div className="space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-white/5">
              <div className="flex items-center justify-between">
                <label htmlFor="texture-scale-input" className="text-gray-200 font-medium">
                  {t('textureScale')}
                </label>
                <span className="font-mono text-cyan-400 font-bold text-xs bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  {currentTiling.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                id="texture-scale-input"
                min="0.5"
                max="8.0"
                step="0.1"
                value={currentTiling}
                onChange={(e) => handleSliderChange({ seamlessTiling: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1">
                  {[0.5, 1, 2, 4, 8].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSliderChange({ seamlessTiling: val })}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                        Math.abs(currentTiling - val) < 0.05
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {val}x
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-gray-500 font-mono">UV Repeat</span>
              </div>
            </div>

            {/* 1.2 Intensidade da Normal & Formato */}
            <div className="space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-white/5">
              <div className="flex items-center justify-between">
                <label htmlFor="normal-strength-input" className="text-gray-200 font-medium">
                  {t('normalStrength')}
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
                onChange={(e) => handleSliderChange({ normalStrength: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-gray-400 text-[10px] font-mono">{t('normalFormat')}</span>
                <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded border border-white/5 font-mono">
                  <button
                    type="button"
                    id="normal-format-opengl"
                    onClick={() => handleSliderChange({ normalFormat: 'OpenGL' })}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
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
                    onClick={() => handleSliderChange({ normalFormat: 'DirectX' })}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
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

            {/* 1.3 Escala de Deslocamento (Height) */}
            <div className="space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-white/5">
              <div className="flex items-center justify-between">
                <label htmlFor="disp-scale-input" className="text-gray-200 font-medium">
                  {t('displacementScale')}
                </label>
                <span className="font-mono text-cyan-400 font-bold">{material.displacementScale.toFixed(3)}m</span>
              </div>
              <input
                type="range"
                id="disp-scale-input"
                min="0.000"
                max="0.090"
                step="0.002"
                value={material.displacementScale}
                onChange={(e) => handleSliderChange({ displacementScale: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>0.000m Plano</span>
                <span>0.045m Médio</span>
                <span>0.090m Alto Relevo</span>
              </div>
            </div>

            {/* 1.4 Largura de Emenda Seamless */}
            <div className="space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-white/5">
              <div className="flex items-center justify-between">
                <label htmlFor="seamless-width-input" className="text-gray-200 font-medium">
                  {t('seamlessBlendWidth')}
                </label>
                <span className="font-mono text-cyan-300 font-bold">{Math.round(material.seamlessBlendWidth * 100)}%</span>
              </div>
              <input
                type="range"
                id="seamless-width-input"
                min="0.05"
                max="0.35"
                step="0.01"
                value={material.seamlessBlendWidth}
                onChange={(e) => handleSliderChange({ seamlessBlendWidth: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>5% Borda Estrita</span>
                <span>18% Padrão</span>
                <span>35% Gradiente Suave</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 2: Reflexão & Acabamento Físico (PBR Reflection & Finish)            */}
        {/* ========================================================================= */}
        <div className="bg-[#0b0e14]/90 border border-white/10 rounded-xl p-4 flex flex-col justify-between gap-4 shadow-md">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white text-xs uppercase tracking-wide font-mono">
                {t('groupReflectionTitle')}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              {t('groupReflectionBadge')}
            </span>
          </div>

          <div className="space-y-4">
            {/* 2.1 Reflexo (Refletividade / Specular Level) */}
            <div className="space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-white/5">
              <div className="flex items-center justify-between">
                <label htmlFor="specular-level-input" className="text-gray-200 font-medium flex items-center gap-1.5">
                  <span>{t('specularLevel')}</span>
                </label>
                <span className="font-mono text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  {Math.round((material.specularLevel ?? 0.5) * 100)}%
                </span>
              </div>
              <input
                type="range"
                id="specular-level-input"
                min="0.0"
                max="1.0"
                step="0.01"
                value={material.specularLevel ?? 0.5}
                onChange={(e) => handleSliderChange({ specularLevel: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>{t('specularFosco')}</span>
                <span>{t('specularDefault')}</span>
                <span>{t('specularMirror')}</span>
              </div>
            </div>

            {/* 2.2 Rugosidade Média (Roughness) */}
            <div className="space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-white/5">
              <div className="flex items-center justify-between">
                <label htmlFor="base-roughness-input" className="text-gray-200 font-medium">
                  {t('baseRoughness')}
                </label>
                <span className="font-mono text-cyan-300 font-bold">{material.baseRoughness.toFixed(2)}</span>
              </div>
              <input
                type="range"
                id="base-roughness-input"
                min="0.02"
                max="0.98"
                step="0.01"
                value={material.baseRoughness}
                onChange={(e) => handleSliderChange({ baseRoughness: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>0.02 {t('roughnessSmooth')}</span>
                <span>0.50 Médio</span>
                <span>0.98 {t('roughnessRough')}</span>
              </div>
            </div>

            {/* 2.3 Metalicidade (Metallic) */}
            <div className="space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-white/5">
              <div className="flex items-center justify-between">
                <label htmlFor="metallic-input" className="text-gray-200 font-medium">
                  {t('metallic')}
                </label>
                <span className="font-mono text-cyan-300 font-bold">{material.metallic.toFixed(2)}</span>
              </div>
              <input
                type="range"
                id="metallic-input"
                min="0.0"
                max="1.0"
                step="0.05"
                value={material.metallic}
                onChange={(e) => handleSliderChange({ metallic: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>{t('metallicDielectric')}</span>
                <span>0.5 Semi-metal</span>
                <span>{t('metallicPure')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 3: Propriedades Ópticas & Emissão (Optics & Emission)                */}
        {/* ========================================================================= */}
        <div className="bg-[#0b0e14]/90 border border-white/10 rounded-xl p-4 flex flex-col justify-between gap-4 shadow-md">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white text-xs uppercase tracking-wide font-mono">
                {t('groupOpticsTitle')}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {t('groupOpticsBadge')}
            </span>
          </div>

          <div className="space-y-4">
            {/* 3.1 Transparência (Transmission) */}
            <div className="space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-white/5">
              <div className="flex items-center justify-between">
                <label htmlFor="transparency-input" className="text-gray-200 font-medium flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('transparency')}</span>
                </label>
                <span className="font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
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
                onChange={(e) => handleSliderChange({ transparency: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>{t('transparencyOpaque')}</span>
                <span>{t('transparencyTranslucent')}</span>
                <span>{t('transparencyGlass')}</span>
              </div>
            </div>

            {/* 3.2 Refração (Índice IOR) */}
            <div className="space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-white/5">
              <div className="flex items-center justify-between">
                <label htmlFor="ior-input" className="text-gray-200 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('ior')}</span>
                </label>
                <span className="font-mono text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
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
                onChange={(e) => handleSliderChange({ ior: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>{t('iorAir')}</span>
                <span>{t('iorWater')}</span>
                <span>{t('iorGlass')}</span>
                <span>{t('iorDiamond')}</span>
              </div>
            </div>

            {/* 3.3 Emissão (Glow Intensity) */}
            <div className="space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-white/5">
              <div className="flex items-center justify-between">
                <label htmlFor="emissive-input" className="text-gray-200 font-medium flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{t('emissive')}</span>
                </label>
                <span className="font-mono text-yellow-300 font-bold bg-yellow-950/60 px-2 py-0.5 rounded border border-yellow-500/30">
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
                onChange={(e) => handleSliderChange({ emissiveIntensity: parseFloat(e.target.value) })}
                className="w-full accent-yellow-400 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>{t('emissiveOff')}</span>
                <span>2.5x Médio</span>
                <span>{t('emissiveMax')}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Action Buttons: Limpar Material, Configurações Iniciais & Recalcular Mapas */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-2.5">
          {onClearToDefault && (
            <button
              type="button"
              id="btn-footer-clear-material"
              onClick={() => {
                setSelectedTypeId('generic');
                onClearToDefault();
              }}
              disabled={isProcessing}
              className="px-3.5 py-2 bg-white/5 hover:bg-red-500/15 active:scale-[0.98] text-gray-300 hover:text-red-200 font-medium rounded-lg flex items-center gap-2 transition-all border border-white/10 hover:border-red-500/30 uppercase tracking-wider font-mono text-xs cursor-pointer disabled:opacity-40 shadow-sm"
              title={t('clearMaterialTooltip')}
            >
              <Eraser className="w-3.5 h-3.5 text-red-400" />
              <span>{t('clearMaterialBtn')}</span>
            </button>
          )}

          {onResetToInitial && (
            <button
              type="button"
              id="btn-footer-reset-initial"
              onClick={() => {
                setSelectedTypeId('generic');
                onResetToInitial();
              }}
              disabled={isProcessing}
              className="px-3.5 py-2 bg-white/5 hover:bg-white/10 active:scale-[0.98] text-gray-300 hover:text-white font-medium rounded-lg flex items-center gap-2 transition-all border border-white/10 uppercase tracking-wider font-mono text-xs cursor-pointer disabled:opacity-40 shadow-sm"
              title={t('initialSettingsTooltip')}
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('initialSettingsBtn')}</span>
            </button>
          )}
        </div>

        <button
          type="button"
          id="btn-recompute-maps"
          onClick={onRecomputeMaps}
          disabled={isProcessing}
          className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 active:scale-[0.99] text-black font-bold rounded-lg flex items-center gap-2 transition-all glow-cyan disabled:opacity-50 uppercase tracking-wider font-mono text-xs cursor-pointer shadow-md"
        >
          <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
          <span>{isProcessing ? t('recomputingBtn') : t('recomputeBtn')}</span>
        </button>
      </div>
    </div>
  );
};
