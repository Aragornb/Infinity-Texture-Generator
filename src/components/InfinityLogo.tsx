import React from 'react';

interface InfinityLogoProps {
  className?: string;
  size?: number;
}

export const InfinityLogo: React.FC<InfinityLogoProps> = ({
  className = 'w-9 h-9',
  size,
}) => {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Infinity Texture Generator Logo"
    >
      <defs>
        {/* Dark Squircle Background Gradients */}
        <radialGradient
          id="bgGrad"
          cx="50%"
          cy="35%"
          r="70%"
          fx="50%"
          fy="30%"
        >
          <stop offset="0%" stopColor="#2c3038" />
          <stop offset="50%" stopColor="#1e2127" />
          <stop offset="100%" stopColor="#121417" />
        </radialGradient>

        <linearGradient id="bgBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#454c59" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#15171b" stopOpacity="0.8" />
        </linearGradient>

        {/* Left Metallic Cyan Loop Gradient */}
        <linearGradient id="cyanMetalGrad" x1="15%" y1="15%" x2="50%" y2="85%">
          <stop offset="0%" stopColor="#93e8ff" />
          <stop offset="25%" stopColor="#38bdf8" />
          <stop offset="65%" stopColor="#0284c7" />
          <stop offset="85%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>

        {/* Specular Highlight along Metallic Rim */}
        <linearGradient id="cyanHighlight" x1="20%" y1="10%" x2="40%" y2="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#7dd3fc" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
        </linearGradient>

        {/* Right Stone / Concrete Loop Gradient */}
        <linearGradient id="stoneGrad" x1="50%" y1="20%" x2="85%" y2="85%">
          <stop offset="0%" stopColor="#adb5bd" />
          <stop offset="30%" stopColor="#868e96" />
          <stop offset="70%" stopColor="#5c636a" />
          <stop offset="100%" stopColor="#343a40" />
        </linearGradient>

        {/* Soft Drop Shadow Filter for 3D depth */}
        <filter id="loopShadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#000000" floodOpacity="0.65" />
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.4" />
        </filter>

        {/* Procedural Micro-Roughness Texture for Stone Loop */}
        <filter id="stoneRoughness" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="4" result="noise" />
          <feColorMatrix
            type="matrix"
            values="0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0    0    0    0.45 0"
            in="noise"
            result="coloredNoise"
          />
          <feBlend mode="overlay" in="SourceGraphic" in2="coloredNoise" />
        </filter>

        {/* Clipping mask for right half (stone side) */}
        <clipPath id="rightHalfClip">
          <rect x="256" y="0" width="256" height="512" />
        </clipPath>

        {/* Clipping mask for left half (metallic cyan side) */}
        <clipPath id="leftHalfClip">
          <rect x="0" y="0" width="260" height="512" />
        </clipPath>
      </defs>

      {/* Squircle Dark Icon Base */}
      <rect
        x="16"
        y="16"
        width="480"
        height="480"
        rx="110"
        fill="url(#bgGrad)"
        stroke="url(#bgBorderGrad)"
        strokeWidth="3"
      />

      {/* Inner ambient glow on dark tile */}
      <circle cx="170" cy="256" r="140" fill="#0284c7" opacity="0.12" filter="blur(40px)" />
      <circle cx="340" cy="256" r="140" fill="#64748b" opacity="0.08" filter="blur(40px)" />

      {/* 3D Infinity Symbol Group */}
      <g filter="url(#loopShadow)">
        {/* Right Loop: Rough Stone / Concrete Material */}
        <g clipPath="url(#rightHalfClip)">
          {/* Main Outer Stone Loop */}
          <path
            d="M 256,256 C 290,210 330,175 385,175 C 445,175 480,215 480,256 C 480,297 445,337 385,337 C 330,337 290,302 256,256 Z"
            fill="none"
            stroke="url(#stoneGrad)"
            strokeWidth="56"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#stoneRoughness)"
          />
          {/* Outer bevel shadow on stone */}
          <path
            d="M 256,256 C 290,210 330,175 385,175 C 445,175 480,215 480,256 C 480,297 445,337 385,337 C 330,337 290,302 256,256 Z"
            fill="none"
            stroke="#212529"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.35"
          />
          {/* Light stone top edge flecks */}
          <path
            d="M 330,175 C 365,175 440,185 465,225"
            fill="none"
            stroke="#ced4da"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.4"
          />
        </g>

        {/* Left Loop: Glossy Cyan Metallic Chrome Material */}
        <g clipPath="url(#leftHalfClip)">
          {/* Main Outer Metallic Cyan Loop */}
          <path
            d="M 256,256 C 222,210 182,175 127,175 C 67,175 32,215 32,256 C 32,297 67,337 127,337 C 182,337 222,302 256,256 Z"
            fill="none"
            stroke="url(#cyanMetalGrad)"
            strokeWidth="56"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Torus Inner Groove / Bevel Highlight */}
          <path
            d="M 256,256 C 222,210 182,175 127,175 C 67,175 32,215 32,256 C 32,297 67,337 127,337 C 182,337 222,302 256,256 Z"
            fill="none"
            stroke="#075985"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.4"
          />

          {/* Sharp Specular Gleam on Top Rim */}
          <path
            d="M 205,200 C 175,178 145,175 127,175 C 80,175 50,205 40,240"
            fill="none"
            stroke="url(#cyanHighlight)"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Inner Rim Light Reflection */}
          <path
            d="M 127,215 C 100,215 82,232 82,256 C 82,280 100,297 127,297 C 150,297 175,280 200,256"
            fill="none"
            stroke="#e0f2fe"
            strokeWidth="5"
            opacity="0.7"
          />
        </g>

        {/* Center Crossover Interlock - Left branch passes smoothly over with 3D shadow */}
        <g>
          {/* Occlusion Shadow cast on the crossing strand */}
          <path
            d="M 235,225 L 275,285"
            stroke="#0a0f18"
            strokeWidth="24"
            strokeLinecap="round"
            opacity="0.5"
            filter="blur(4px)"
          />
          {/* Overpassing strand with metallic cyan finish and bevel */}
          <path
            d="M 220,298 C 240,275 265,240 285,218"
            stroke="url(#cyanMetalGrad)"
            strokeWidth="54"
            strokeLinecap="round"
          />
          {/* Gleam on crossing strand */}
          <path
            d="M 230,290 C 245,270 265,242 280,224"
            stroke="#bae6fd"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.65"
          />
        </g>
      </g>
    </svg>
  );
};
