import React from 'react';
import { ContinentId } from '../types/registry';

interface WorldMapCartographyProps {
  selectedContinent: ContinentId;
  onSelectContinent: (continent: ContinentId) => void;
  continentCounts: Record<Exclude<ContinentId, 'All'>, number>;
  totalPortals: number;
  totalSubNational: number;
  totalApis: number;
}

export const WorldMapCartography: React.FC<WorldMapCartographyProps> = ({
  selectedContinent,
  onSelectContinent,
  continentCounts,
  totalPortals,
  totalSubNational,
  totalApis,
}) => {
  const regions: {
    id: Exclude<ContinentId, 'All'>;
    label: string;
    cx: number;
    cy: number;
    path: string;
  }[] = [
    {
      id: 'Americas',
      label: 'Americas',
      cx: 195,
      cy: 175,
      path: 'M 95,45 L 215,40 L 250,95 L 210,155 L 235,185 L 295,225 L 270,320 L 230,355 L 210,270 L 180,195 L 125,135 L 85,75 Z',
    },
    {
      id: 'Europe',
      label: 'Europe',
      cx: 430,
      cy: 92,
      path: 'M 365,45 L 515,38 L 535,105 L 485,130 L 385,135 L 355,95 Z',
    },
    {
      id: 'Africa',
      label: 'Africa',
      cx: 440,
      cy: 225,
      path: 'M 365,145 L 475,145 L 520,195 L 495,315 L 435,335 L 405,255 L 350,205 Z',
    },
    {
      id: 'Asia',
      label: 'Asia',
      cx: 635,
      cy: 130,
      path: 'M 522,42 L 775,50 L 795,145 L 725,215 L 620,210 L 535,175 L 505,125 Z',
    },
    {
      id: 'Oceania',
      label: 'Oceania',
      cx: 735,
      cy: 285,
      path: 'M 665,245 L 795,245 L 810,325 L 685,330 Z',
    },
  ];

  return (
    <div className="flex flex-col justify-between h-full bg-[#F4EFE6] border border-[#DED6C6] rounded-lg p-6">
      <div className="flex items-center justify-between border-b border-[#DED6C6] pb-3 mb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-stone-500 block">
            Interactive Cartographic Index
          </span>
          <h2 className="text-lg font-semibold text-stone-900 mt-0.5">
            Select a Continent to Filter Sovereign Jurisdictions
          </h2>
        </div>
        {selectedContinent !== 'All' && (
          <button
            type="button"
            onClick={() => onSelectContinent('All')}
            className="px-3 py-1.5 text-xs font-medium text-stone-800 bg-white border border-stone-300 rounded hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0"
          >
            Show All Continents
          </button>
        )}
      </div>

      {/* Archival Vector Map */}
      <div className="relative w-full overflow-hidden rounded bg-[#FBF9F5] border border-[#E5DEC9] p-3">
        <svg
          viewBox="0 0 880 380"
          className="w-full h-auto select-none"
          role="img"
          aria-label="Interactive world map of government portals by continent"
        >
          {/* Graticule grid lines */}
          <g stroke="#EAE3D2" strokeWidth="1" strokeDasharray="3 3">
            <line x1="0" y1="75" x2="880" y2="75" />
            <line x1="0" y1="150" x2="880" y2="150" />
            <line x1="0" y1="225" x2="880" y2="225" />
            <line x1="0" y1="300" x2="880" y2="300" />
            <line x1="176" y1="0" x2="176" y2="380" />
            <line x1="352" y1="0" x2="352" y2="380" />
            <line x1="528" y1="0" x2="528" y2="380" />
            <line x1="704" y1="0" x2="704" y2="380" />
          </g>

          {regions.map((reg) => {
            const isActive = selectedContinent === reg.id;
            const isMuted = selectedContinent !== 'All' && !isActive;
            const count = continentCounts[reg.id] || 0;

            return (
              <g
                key={reg.id}
                onClick={() =>
                  onSelectContinent(isActive ? 'All' : reg.id)
                }
                className="cursor-pointer transition-opacity duration-150"
                style={{ opacity: isMuted ? 0.45 : 1 }}
              >
                <path
                  d={reg.path}
                  fill={isActive ? '#1E3A8A' : '#E5DEC9'}
                  stroke={isActive ? '#172554' : '#A8A29E'}
                  strokeWidth={isActive ? '2' : '1.25'}
                  className="transition-colors duration-150 hover:fill-[#1E3A8A]/80"
                />
                <rect
                  x={reg.cx - 58}
                  y={reg.cy - 18}
                  width="116"
                  height="36"
                  rx="4"
                  fill={isActive ? '#172554' : '#1C1917'}
                  fillOpacity="0.9"
                />
                <text
                  x={reg.cx}
                  y={reg.cy - 2}
                  textAnchor="middle"
                  fill="#FBF9F5"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                >
                  {reg.label}
                </text>
                <text
                  x={reg.cx}
                  y={reg.cy + 12}
                  textAnchor="middle"
                  fill="#D6CEBE"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {count} States
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Archival Registry Summary Ledger */}
      <dl className="grid grid-cols-3 gap-4 pt-4 mt-4 border-t border-[#DED6C6] text-left">
        <div>
          <dt className="text-xs text-stone-500">Documented Portals</dt>
          <dd className="text-xl font-semibold font-mono tabular-nums text-stone-900 mt-0.5">
            {totalPortals.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500">States & Provinces</dt>
          <dd className="text-xl font-semibold font-mono tabular-nums text-stone-900 mt-0.5">
            {totalSubNational.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500">Verified Public APIs</dt>
          <dd className="text-xl font-semibold font-mono tabular-nums text-stone-900 mt-0.5">
            {totalApis.toLocaleString()}
          </dd>
        </div>
      </dl>
    </div>
  );
};
