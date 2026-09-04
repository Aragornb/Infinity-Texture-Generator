import React, { useState } from 'react';
import { PBRMapData, PBRMapType } from '../types';
import { Download, Eye, Grid, Maximize2, Sparkles } from 'lucide-react';

interface MapInspector2DProps {
  maps: PBRMapData;
  materialName: string;
  normalFormat: 'OpenGL' | 'DirectX';
}

const MAP_CONFIG: { type: PBRMapType; labelPt: string; descPt: string; color: string }[] = [
  {
    type: 'diffuse',
    labelPt: 'Difusão (Albedo)',
    descPt: 'Cor base da superfície livre de sombras direcionais e iluminação.',
    color: 'border-blue-500 text-blue-400',
  },
  {
    type: 'specular',
    labelPt: 'Especular (Reflectance)',
    descPt: 'Intensidade de refletância F0 (dielétrico ~0.04 ou metálico colorido).',
    color: 'border-yellow-500 text-yellow-400',
  },
  {
    type: 'normal',
    labelPt: 'Normal Map',
    descPt: 'Vetor de perturbação de superfície Tangent Space (R:X, G:Y, B:Z).',
    color: 'border-purple-500 text-purple-400',
  },
  {
    type: 'roughness',
    labelPt: 'Rugosidade',
    descPt: 'Microrrugosidade superficial (0.0 = espelho liso, 1.0 = áspero/difuso).',
    color: 'border-emerald-500 text-emerald-400',
  },
  {
    type: 'displacement',
    labelPt: 'Deslocamento (Height)',
    descPt: 'Mapa de elevação contínuo em escala de cinza para tesselação geométrica.',
    color: 'border-amber-500 text-amber-400',
  },
  {
    type: 'ao',
    labelPt: 'Oclusão Ambiental (AO)',
    descPt: 'Escurecimento em frestas profundas e concavidades de contato de luz.',
    color: 'border-neutral-400 text-neutral-300',
  },
];

export const MapInspector2D: React.FC<MapInspector2DProps> = ({ maps, materialName, normalFormat }) => {
  const [activeMap, setActiveMap] = useState<PBRMapType>('diffuse');
  const [tilingRepeat, setTilingRepeat] = useState<1 | 2 | 3>(2);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const currentMapConfig = MAP_CONFIG.find((m) => m.type === activeMap) || MAP_CONFIG[0];
  const activeImageUrl = maps[activeMap];

  const handleDownloadSingleMap = (type: PBRMapType) => {
    const dataUrl = maps[type];
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${materialName.toLowerCase().replace(/\s+/g, '_')}_${type}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full flex flex-col glass rounded-xl overflow-hidden shadow-2xl">
      {/* Map Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#0A0B10]/90 border-b border-white/5">
        <div className="flex flex-wrap items-center gap-1.5">
          {MAP_CONFIG.map((m) => {
            const isActive = activeMap === m.type;
            return (
              <button
                key={m.type}
                type="button"
                id={`map-tab-${m.type}`}
                onClick={() => setActiveMap(m.type)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-500 text-black font-bold glow-cyan-sm shadow-md'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{m.labelPt}</span>
              </button>
            );
          })}
        </div>

        {/* 2D Tiling Mode Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-md border border-white/5 text-xs font-mono">
            <Grid className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-gray-500 text-[10px] uppercase mr-1">Tile:</span>
            {([1, 2, 3] as const).map((count) => (
              <button
                key={count}
                type="button"
                id={`tiling-2d-${count}`}
                onClick={() => setTilingRepeat(count)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  tilingRepeat === count ? 'bg-cyan-500 text-black font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                {count}x{count}
              </button>
            ))}
          </div>

          <button
            type="button"
            id="download-active-map-btn"
            onClick={() => handleDownloadSingleMap(activeMap)}
            className="p-1.5 text-gray-400 hover:text-cyan-400 hover:bg-white/5 rounded-md transition-colors"
            title="Baixar apenas este mapa (JPG)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Inspection Area */}
      <div className="relative w-full h-[400px] bg-[#050608] flex items-center justify-center overflow-hidden">
        {/* Seamless Grid Viewer */}
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url(${activeImageUrl})`,
            backgroundRepeat: 'repeat',
            backgroundSize: `${100 / tilingRepeat}% ${100 / tilingRepeat}%`,
            backgroundPosition: '0 0',
          }}
        />

        {/* Informative Overlay Badge */}
        <div className="absolute bottom-3 left-3 bg-[#0A0B10]/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 shadow-lg flex items-center gap-2 text-xs">
          <span className="font-bold text-cyan-400 font-mono">{currentMapConfig.labelPt}</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400 text-[11px]">{currentMapConfig.descPt}</span>
          {activeMap === 'normal' && (
            <span className="ml-1 px-1.5 py-0.5 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 rounded font-mono text-[10px]">
              {normalFormat} (Y {normalFormat === 'OpenGL' ? '+' : '-'})
            </span>
          )}
        </div>

        {/* Seamless Badge */}
        <div className="absolute top-3 right-3 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 px-2.5 py-1 rounded-full text-[10px] font-mono flex items-center gap-1.5 shadow-md">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>100% Seamless Tileable</span>
        </div>
      </div>

      {/* Map Thumbnails Strip */}
      <div className="grid grid-cols-6 gap-2 p-2.5 bg-[#0A0B10]/80 border-t border-white/5">
        {MAP_CONFIG.map((m) => {
          const isSelected = activeMap === m.type;
          return (
            <button
              key={m.type}
              type="button"
              id={`thumb-map-${m.type}`}
              onClick={() => setActiveMap(m.type)}
              className={`relative rounded-lg overflow-hidden border transition-all group aspect-square flex flex-col ${
                isSelected ? 'border-cyan-400 scale-[1.02] glow-cyan-sm shadow-md' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <img
                src={maps[m.type]}
                alt={m.labelPt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-xs py-0.5 px-1 text-center">
                <span className="text-[10px] font-mono text-gray-300 truncate block">
                  {m.labelPt.split(' ')[0]}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
