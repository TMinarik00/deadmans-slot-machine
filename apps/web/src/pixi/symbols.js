// Symbol SVG definitions and texture loading for the PixiJS slot machine.
// 33 unique symbols: 4 shared card suits + game-specific icons for each of 4 games.
// SVGs loaded as data URIs via PixiJS textures for crisp WebGL rendering.

import { Texture, ImageSource } from "pixi.js";

const s = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${inner}</svg>`;

// ═══════════════════════════════════════════
// SVG DEFINITIONS
// ═══════════════════════════════════════════

const SYMBOL_SVGS = {
  // ── Shared Card Suits ──
  spade: s(
    `<path d="M60 12 C60 12 16 48 16 70 C16 88 32 96 48 86 L44 108 H76 L72 86 C88 96 104 88 104 70 C104 48 60 12 60 12Z" fill="#B0BEC5" stroke="#CFD8DC" stroke-width="2.5"/>`,
  ),
  heart: s(
    `<path d="M60 105 C55 99 10 63 10 38 C10 18 27 8 43 8 C52 8 57 14 60 21 C63 14 68 8 77 8 C93 8 110 18 110 38 C110 63 65 99 60 105Z" fill="#EF4444" stroke="#FCA5A5" stroke-width="2.5"/>`,
  ),
  diamond_card: s(
    `<path d="M60 6 L108 60 L60 114 L12 60Z" fill="#60A5FA" stroke="#93C5FD" stroke-width="2.5"/>`,
  ),
  club: s(
    `<circle cx="60" cy="36" r="22" fill="#34D399" stroke="#6EE7B7" stroke-width="2"/>
     <circle cx="36" cy="64" r="22" fill="#34D399" stroke="#6EE7B7" stroke-width="2"/>
     <circle cx="84" cy="64" r="22" fill="#34D399" stroke="#6EE7B7" stroke-width="2"/>
     <rect x="52" y="74" width="16" height="32" rx="2" fill="#34D399" stroke="#6EE7B7" stroke-width="2"/>`,
  ),

  // ── Dead Man's Gun ──
  sheriff_badge: s(
    `<defs><linearGradient id="sb" x1="0" y1="0" x2="1" y2="1">
       <stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#B8860B"/>
     </linearGradient></defs>
     <polygon points="60,5 72,40 110,40 80,62 90,100 60,76 30,100 40,62 10,40 48,40" fill="url(#sb)" stroke="#FFE066" stroke-width="2.5"/>
     <circle cx="60" cy="56" r="15" fill="#6B4E13" stroke="#FFD700" stroke-width="2.5"/>
     <text x="60" y="62" text-anchor="middle" fill="#FFD700" font-size="16" font-weight="bold" font-family="Arial,sans-serif">W</text>`,
  ),
  gem_diamond: s(
    `<defs><linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
       <stop offset="0%" stop-color="#C084FC"/><stop offset="100%" stop-color="#7C3AED"/>
     </linearGradient></defs>
     <polygon points="30,40 60,8 90,40 60,112" fill="url(#gd)" stroke="#DDD6FE" stroke-width="2.5"/>
     <polygon points="30,40 60,8 90,40 60,52" fill="#E9D5FF" opacity="0.45"/>
     <line x1="30" y1="40" x2="90" y2="40" stroke="#DDD6FE" stroke-width="2"/>`,
  ),
  revolver: s(
    `<rect x="45" y="30" width="55" height="20" rx="5" fill="#8E9AAF" stroke="#B0BAC9" stroke-width="2"/>
     <rect x="26" y="28" width="26" height="26" rx="4" fill="#64748B" stroke="#8E9AAF" stroke-width="2"/>
     <circle cx="39" cy="41" r="9" fill="none" stroke="#475569" stroke-width="3.5"/>
     <path d="M48 56 L54 88 L36 88 L42 56Z" fill="#5D3A1A" stroke="#8B5E34" stroke-width="2"/>
     <rect x="95" y="34" width="10" height="12" rx="2" fill="#64748B"/>`,
  ),
  skull: s(
    `<ellipse cx="60" cy="46" rx="34" ry="36" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2.5"/>
     <ellipse cx="44" cy="40" rx="10" ry="11" fill="#1E293B"/>
     <ellipse cx="76" cy="40" rx="10" ry="11" fill="#1E293B"/>
     <ellipse cx="60" cy="56" rx="4" ry="3.5" fill="#1E293B"/>
     <path d="M46 70 L50 63 L55 70 L60 63 L65 70 L70 63 L74 70" fill="none" stroke="#1E293B" stroke-width="3.5" stroke-linecap="round"/>`,
  ),
  cowboy_hat: s(
    `<defs><linearGradient id="ch" x1="0" y1="0" x2="0" y2="1">
       <stop offset="0%" stop-color="#A16207"/><stop offset="100%" stop-color="#713F12"/>
     </linearGradient></defs>
     <ellipse cx="60" cy="80" rx="52" ry="12" fill="#5C3310" stroke="#92400E" stroke-width="2.5"/>
     <path d="M18 80 C18 80 26 38 42 32 L60 16 L78 32 C94 38 102 80 102 80" fill="url(#ch)" stroke="#B45309" stroke-width="2.5"/>
     <ellipse cx="60" cy="50" rx="20" ry="4" fill="#8B6914" opacity="0.3"/>`,
  ),
  whiskey: s(
    `<path d="M36 26 L30 98 C30 104 42 110 60 110 C78 110 90 104 90 98 L84 26Z" fill="#1E293B" stroke="#475569" stroke-width="2"/>
     <path d="M33 52 L30 98 C30 104 42 110 60 110 C78 110 90 104 90 98 L87 52Z" fill="#F59E0B" opacity="0.65"/>
     <line x1="36" y1="26" x2="84" y2="26" stroke="#64748B" stroke-width="4" stroke-linecap="round"/>`,
  ),
  target: s(
    `<circle cx="60" cy="60" r="48" fill="#DC2626" stroke="#FCA5A5" stroke-width="2"/>
     <circle cx="60" cy="60" r="34" fill="#FAFAFA"/>
     <circle cx="60" cy="60" r="22" fill="#DC2626"/>
     <circle cx="60" cy="60" r="8" fill="#FAFAFA"/>`,
  ),

  // ── Dead Man's Treasure ──
  gold_star: s(
    `<defs><linearGradient id="gs" x1="0" y1="0" x2="1" y2="1">
       <stop offset="0%" stop-color="#FDE047"/><stop offset="100%" stop-color="#EAB308"/>
     </linearGradient></defs>
     <polygon points="60,6 75,42 114,42 82,66 94,104 60,80 26,104 38,66 6,42 45,42" fill="url(#gs)" stroke="#FEF08A" stroke-width="2.5"/>
     <polygon points="60,22 70,46 94,46 74,60 82,84 60,70 38,84 46,60 26,46 50,46" fill="#FEF9C3" opacity="0.35"/>`,
  ),
  scroll: s(
    `<defs><linearGradient id="sc" x1="0" y1="0" x2="0" y2="1">
       <stop offset="0%" stop-color="#DEB887"/><stop offset="100%" stop-color="#B8860B"/>
     </linearGradient></defs>
     <rect x="24" y="18" width="72" height="84" rx="5" fill="url(#sc)" stroke="#A0724A" stroke-width="2"/>
     <ellipse cx="24" cy="24" rx="8" ry="8" fill="#C9A96E" stroke="#A0724A" stroke-width="1.5"/>
     <ellipse cx="96" cy="96" rx="8" ry="8" fill="#C9A96E" stroke="#A0724A" stroke-width="1.5"/>
     <line x1="36" y1="42" x2="82" y2="42" stroke="#8B6914" stroke-width="2.5" opacity="0.4"/>
     <line x1="36" y1="58" x2="76" y2="58" stroke="#8B6914" stroke-width="2.5" opacity="0.4"/>
     <line x1="36" y1="74" x2="70" y2="74" stroke="#8B6914" stroke-width="2.5" opacity="0.4"/>`,
  ),
  moneybag: s(
    `<path d="M48 24 L54 12 L66 12 L72 24" fill="none" stroke="#166534" stroke-width="3.5"/>
     <path d="M34 44 C24 54 20 78 28 96 C34 106 46 112 60 112 C74 112 86 106 92 96 C100 78 96 54 86 44 C80 38 70 32 60 32 C50 32 40 38 34 44Z" fill="#166534" stroke="#22C55E" stroke-width="2.5"/>
     <text x="60" y="82" text-anchor="middle" fill="#FCD34D" font-size="36" font-weight="bold" font-family="Arial,sans-serif">$</text>`,
  ),
  pickaxe: s(
    `<line x1="28" y1="98" x2="92" y2="22" stroke="#5C3310" stroke-width="9" stroke-linecap="round"/>
     <line x1="28" y1="98" x2="92" y2="22" stroke="#78350F" stroke-width="6" stroke-linecap="round"/>
     <path d="M82 16 L104 10 L98 32 L88 28Z" fill="#94A3B8" stroke="#CBD5E1" stroke-width="2"/>`,
  ),
  dynamite: s(
    `<rect x="28" y="34" width="20" height="58" rx="5" fill="#DC2626" stroke="#FCA5A5" stroke-width="1.5"/>
     <rect x="50" y="28" width="20" height="64" rx="5" fill="#DC2626" stroke="#FCA5A5" stroke-width="1.5"/>
     <rect x="72" y="34" width="20" height="58" rx="5" fill="#DC2626" stroke="#FCA5A5" stroke-width="1.5"/>
     <path d="M60 28 C60 18 64 10 70 6" fill="none" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
     <circle cx="71" cy="5" r="5" fill="#FCD34D"/>`,
  ),
  trophy: s(
    `<defs><linearGradient id="tr" x1="0" y1="0" x2="0" y2="1">
       <stop offset="0%" stop-color="#FDE047"/><stop offset="100%" stop-color="#CA8A04"/>
     </linearGradient></defs>
     <path d="M36 18 L84 18 L80 60 C78 74 68 80 60 80 C52 80 42 74 40 60Z" fill="url(#tr)" stroke="#EAB308" stroke-width="2.5"/>
     <path d="M36 24 C24 24 14 36 14 50 C14 60 22 66 34 60" fill="none" stroke="#EAB308" stroke-width="3.5"/>
     <path d="M84 24 C96 24 106 36 106 50 C106 60 98 66 86 60" fill="none" stroke="#EAB308" stroke-width="3.5"/>
     <rect x="50" y="80" width="20" height="10" fill="#CA8A04"/>
     <rect x="38" y="90" width="44" height="12" rx="4" fill="#B45309" stroke="#EAB308" stroke-width="2"/>`,
  ),
  golden_key: s(
    `<circle cx="34" cy="40" r="18" fill="none" stroke="#EAB308" stroke-width="7"/>
     <circle cx="34" cy="40" r="18" fill="none" stroke="#FDE047" stroke-width="4"/>
     <rect x="48" y="36" width="52" height="8" rx="3" fill="#CA8A04" stroke="#EAB308" stroke-width="2"/>
     <rect x="88" y="44" width="8" height="16" rx="2" fill="#CA8A04" stroke="#EAB308" stroke-width="1.5"/>
     <rect x="76" y="44" width="8" height="13" rx="2" fill="#CA8A04" stroke="#EAB308" stroke-width="1.5"/>`,
  ),

  // ── Coyote Moon ──
  mustang: s(
    `<defs><linearGradient id="mu" x1="0" y1="0" x2="0" y2="1">
       <stop offset="0%" stop-color="#F8FAFC"/><stop offset="100%" stop-color="#94A3B8"/>
     </linearGradient></defs>
     <path d="M72 16 C76 12 80 8 82 4 L84 10 C84 18 80 26 74 30 L88 46 L98 42 L100 50 L90 56 L92 78 L84 80 L80 62 L68 76 L58 98 L48 96 L58 72 L42 82 L30 98 L20 94 L36 74 L24 56 C18 48 20 36 28 30 C36 24 50 20 62 18Z" fill="url(#mu)" stroke="#CBD5E1" stroke-width="2.5"/>`,
  ),
  spirit_star: s(
    `<defs><linearGradient id="sp" x1="0" y1="0" x2="1" y2="1">
       <stop offset="0%" stop-color="#E9D5FF"/><stop offset="100%" stop-color="#A855F7"/>
     </linearGradient></defs>
     <path d="M60 4 L66 44 L108 60 L66 76 L60 116 L54 76 L12 60 L54 44Z" fill="url(#sp)" stroke="#D8B4FE" stroke-width="2"/>
     <path d="M60 22 L64 48 L90 60 L64 72 L60 98 L56 72 L30 60 L56 48Z" fill="#F3E8FF" opacity="0.45"/>`,
  ),
  coyote: s(
    `<path d="M34 98 L38 66 L24 54 L30 46 C36 40 44 36 52 34 L48 16 L56 28 L60 12 L64 28 L72 16 L68 34 C76 36 84 40 90 46 L96 54 L82 66 L86 98Z" fill="#6B7280" stroke="#9CA3AF" stroke-width="2.5"/>
     <circle cx="47" cy="47" r="4" fill="#FCD34D"/>
     <circle cx="73" cy="47" r="4" fill="#FCD34D"/>
     <path d="M54 60 L60 56 L66 60" fill="none" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>`,
  ),
  crescent_moon: s(
    `<defs><linearGradient id="mn" x1="0" y1="0" x2="1" y2="1">
       <stop offset="0%" stop-color="#FDE68A"/><stop offset="100%" stop-color="#EAB308"/>
     </linearGradient></defs>
     <path d="M78 12 C50 18 30 42 30 68 C30 96 52 114 80 108 C55 108 38 90 38 68 C38 44 56 24 78 12Z" fill="url(#mn)" stroke="#FDE68A" stroke-width="2.5"/>`,
  ),
  eagle: s(
    `<path d="M60 28 L54 34 L8 56 L20 50 L10 70 L36 56 L46 66 L52 54 L60 46 L68 54 L74 66 L84 56 L110 70 L100 50 L112 56 L66 34Z" fill="#78350F" stroke="#B45309" stroke-width="2"/>
     <path d="M54 34 L60 28 L66 34 L60 38Z" fill="#92400E"/>
     <circle cx="56" cy="36" r="2" fill="#FCD34D"/>
     <path d="M58 40 L60 44 L56 43Z" fill="#EAB308"/>`,
  ),
  cactus: s(
    `<rect x="50" y="22" width="20" height="80" rx="10" fill="#16A34A" stroke="#4ADE80" stroke-width="2.5"/>
     <path d="M50 54 L34 54 L34 36 C34 28 44 26 44 36 L44 48 L50 48" fill="#16A34A" stroke="#4ADE80" stroke-width="2"/>
     <path d="M70 44 L86 44 L86 62 C86 70 76 72 76 62 L76 50 L70 50" fill="#16A34A" stroke="#4ADE80" stroke-width="2"/>`,
  ),
  campfire: s(
    `<path d="M60 12 C54 28 38 44 40 66 C42 82 54 88 60 84 C56 76 50 68 54 54 C56 44 60 40 60 40 C60 40 64 44 66 54 C70 68 64 76 60 84 C66 88 78 82 80 66 C82 44 66 28 60 12Z" fill="#F97316" stroke="#FDBA74" stroke-width="1.5"/>
     <path d="M60 28 C56 38 48 50 50 64 C52 74 58 76 60 74 C58 68 54 62 56 52 C58 44 60 40 60 40 C60 40 62 44 64 52 C66 62 62 68 60 74 C62 76 68 74 70 64 C72 50 64 38 60 28Z" fill="#FCD34D" opacity="0.65"/>
     <line x1="28" y1="95" x2="54" y2="78" stroke="#5C3310" stroke-width="5" stroke-linecap="round"/>
     <line x1="92" y1="95" x2="66" y2="78" stroke="#5C3310" stroke-width="5" stroke-linecap="round"/>`,
  ),
  rattlesnake: s(
    `<path d="M22 78 C28 66 40 54 52 48 C62 42 72 48 78 56 C84 62 88 56 92 46 C96 36 98 30 94 24" fill="none" stroke="#4D7C0F" stroke-width="12" stroke-linecap="round"/>
     <path d="M22 78 C28 66 40 54 52 48 C62 42 72 48 78 56 C84 62 88 56 92 46 C96 36 98 30 94 24" fill="none" stroke="#84CC16" stroke-width="7" stroke-linecap="round"/>
     <circle cx="92" cy="22" r="3.5" fill="#FCD34D"/>
     <path d="M17 76 L12 84 L24 80Z" fill="#4D7C0F"/>`,
  ),
};

// ═══════════════════════════════════════════
// GAME → SYMBOL TEXTURE MAPPING
// Each game maps its symbol IDs to texture keys above
// ═══════════════════════════════════════════

export const GAME_SYMBOL_MAP = {
  "dead-mans-gun": {
    wild: "sheriff_badge",
    scatter: "gem_diamond",
    revolver: "revolver",
    skull: "skull",
    cowboy: "cowboy_hat",
    whiskey: "whiskey",
    target: "target",
    spade: "spade",
    heart: "heart",
    diamond_card: "diamond_card",
  },
  "dead-mans-treasure": {
    wild: "gold_star",
    scatter: "scroll",
    moneybag: "moneybag",
    pickaxe: "pickaxe",
    dynamite: "dynamite",
    trophy: "trophy",
    key: "golden_key",
    spade: "spade",
    heart: "heart",
    diamond_card: "diamond_card",
    club: "club",
  },
  "coyote-moon": {
    wild: "mustang",
    scatter: "spirit_star",
    coyote: "coyote",
    moon: "crescent_moon",
    eagle: "eagle",
    cactus: "cactus",
    fire: "campfire",
    snake: "rattlesnake",
    spade: "spade",
    heart: "heart",
    diamond_card: "diamond_card",
    club: "club",
  },
};

// ═══════════════════════════════════════════
// TEXTURE LOADING
// Uses Image elements + ImageSource/Texture for reliable PixiJS v8 SVG loading.
// Falls back gracefully if individual symbols fail.
// ═══════════════════════════════════════════

let _cache = null;

function loadSvgAsTexture(svgString) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      try {
        const source = new ImageSource({ resource: img });
        resolve(new Texture({ source }));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  });
}

export async function loadSymbolTextures() {
  if (_cache) return _cache;

  const textures = {};
  const entries = Object.entries(SYMBOL_SVGS);

  const results = await Promise.allSettled(
    entries.map(async ([key, svg]) => {
      const tex = await loadSvgAsTexture(svg);
      if (tex) {
        textures[key] = tex;
      } else {
        console.warn(`[Slot] Symbol "${key}" failed to load`);
      }
    }),
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  if (failed > 0) console.warn(`[Slot] ${failed} symbols failed to load`);

  _cache = textures;
  return _cache;
}

export function getTexture(textures, gameId, symbolId) {
  const map = GAME_SYMBOL_MAP[gameId];
  if (!map) return null;
  const key = map[symbolId];
  return key && textures[key] ? textures[key] : null;
}
