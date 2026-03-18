// PixiJS Slot Machine Engine
// Full-canvas slot machine: reels, controls, balance, spin button, win effects.
// Designed for 800px base width, scales responsively via CSS.

import {
  Application,
  Container,
  Graphics,
  Sprite,
  Text,
  TextStyle,
} from "pixi.js";
import gsap from "gsap";
import { loadSymbolTextures, getTexture, GAME_SYMBOL_MAP } from "./symbols.js";

// ── Layout constants ──
const W = 800;
const FRAME_X = 20;
const FRAME_W = 760;
const FRAME_BORDER = 3;
const FRAME_PAD = 12;
const REEL_GAP = 5;
const PAD_COUNT = 25; // padding symbols above result for spin illusion
const REEL_Y = 94;

// ── Theme colors per game ──
const THEMES = {
  "dead-mans-gun": {
    frameBorder: 0x8b6914,
    frameInner: 0x110a06,
    accent: 0xd4a020,
    reelBg: 0x0d0805,
    reelDivider: 0x1a0f08,
  },
  "dead-mans-treasure": {
    frameBorder: 0x8b6914,
    frameInner: 0x0e0a04,
    accent: 0xeab308,
    reelBg: 0x0c0804,
    reelDivider: 0x1a0e06,
  },
  "coyote-moon": {
    frameBorder: 0x4a5568,
    frameInner: 0x080a10,
    accent: 0x93c5fd,
    reelBg: 0x06080e,
    reelDivider: 0x10141e,
  },
};

function getTheme(gameId) {
  return THEMES[gameId] || THEMES["dead-mans-gun"];
}

// ── Text styles ──
function headerStyle(size, color) {
  return new TextStyle({
    fontFamily: "Rye, Georgia, serif",
    fontSize: size,
    fill: color,
    fontWeight: "bold",
  });
}

function uiStyle(size, color, weight = "600") {
  return new TextStyle({
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: size,
    fill: color,
    fontWeight: weight,
  });
}

// ═══════════════════════════════════════════
// SLOT APP CLASS
// ═══════════════════════════════════════════

export class SlotApp {
  app = null;
  textures = null;
  game = null;
  theme = null;

  // Layout values (computed per game)
  cellH = 0;
  reelW = 0;
  reelInnerW = 0;
  reelFrameH = 0;
  ctrlY = 0;
  autoY = 0;
  canvasH = 0;
  symSize = 0;

  // Display object references
  reelContainers = [];
  reelSymbols = []; // [reel][symbolIndex] = Sprite
  winGlows = []; // [reel][row] = Graphics (glow behind winning cells)
  winLines = null; // Container for win connection lines
  spinBtn = null;
  spinBtnText = null;
  spinBtnGlow = null;
  _spinBtnBg = null;
  _spinRing = null; // rotating ring during spin
  _spinIdleTween = null; // idle breathing glow
  _spinCountText = null; // auto-spin count text on button
  betChips = [];
  autoChips = [];
  balanceText = null;
  winText = null;
  winBanner = null;
  headerTitle = null;
  headerWays = null;
  autoProgressCt = null;
  autoProgressText = null;

  // State
  _spinning = false;
  _currentBet = 0;
  _currentAutoCount = 1;

  // Callbacks (set by Vue component)
  onSpin = null;
  onBetChange = null;
  onAutoChange = null;
  onBack = null;
  onAutoStop = null;

  // ── Initialization ──

  async init(containerEl, game) {
    this.game = game;
    this.theme = getTheme(game.id);
    this._calcLayout();

    this.app = new Application();
    await this.app.init({
      width: W,
      height: this.canvasH,
      background: 0x0a0604,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    });

    const c = this.app.canvas;
    c.style.width = "100%";
    c.style.height = "auto";
    c.style.display = "block";
    c.style.margin = "0 auto";

    // On desktop, cap at 800px with rounded corners
    // On mobile, fill full width for bigger gameplay
    const isMobile = window.matchMedia("(max-width: 600px)").matches;
    if (!isMobile) {
      c.style.maxWidth = W + "px";
      c.style.borderRadius = "12px";
    } else {
      c.style.borderRadius = "0";
    }
    containerEl.appendChild(c);

    // Build all display objects first (no async, always renders)
    // Order matters for z-layering: later = on top
    this._buildCanvasBg();
    this._buildHeader();
    this._buildReelFrame();
    this._buildReels();
    this._buildWinBanner(); // on top of reels so win text is visible
    this._buildControls();
    this._buildAutoProgress();

    // Load symbol textures (async, may fail gracefully)
    try {
      this.textures = await loadSymbolTextures();
    } catch (e) {
      console.error("[SlotApp] Texture loading failed:", e);
      this.textures = {};
    }
    this._fillIdleReels();

    return this;
  }

  _calcLayout() {
    const { rows, reels } = this.game;
    this.isMobile = window.matchMedia("(max-width: 600px)").matches;
    this.cellH = rows <= 4 ? 88 : rows === 5 ? 74 : 64;
    this.reelInnerW =
      FRAME_W - 2 * FRAME_BORDER - 2 * FRAME_PAD;
    this.reelW =
      (this.reelInnerW - (reels - 1) * REEL_GAP) / reels;
    this.reelFrameH =
      rows * this.cellH + 2 * (FRAME_BORDER + FRAME_PAD);
    this.ctrlY = REEL_Y + this.reelFrameH + 14;
    // Taller control area on mobile for bigger touch targets
    const ctrlH = this.isMobile ? 130 : 105;
    this.autoY = this.ctrlY + ctrlH + 6;
    this.canvasH = this.autoY + 38 + 10;
    this.symSize = Math.min(this.reelW, this.cellH) * 0.72;
  }

  // ── Header (back button, title, ways badge) ──

  _buildHeader() {
    const stage = this.app.stage;
    const t = this.theme;
    const hdrCenterY = (REEL_Y - 6) / 2 + 6; // vertical center of header area

    // ── Back button (pill-shaped with icon) ──
    const backCt = new Container();
    const backW = 90;
    const backH = 30;
    backCt.x = FRAME_X + 14 + backW / 2;
    backCt.y = hdrCenterY;

    const backBg = new Graphics();
    backBg.roundRect(-backW / 2, -backH / 2, backW, backH, backH / 2);
    backBg.fill({ color: 0x000000, alpha: 0.3 });
    backBg.roundRect(-backW / 2, -backH / 2, backW, backH, backH / 2);
    backBg.stroke({ color: t.frameBorder, width: 1.2, alpha: 0.6 });
    backCt.addChild(backBg);

    // Arrow icon (chevron drawn with lines)
    const arrow = new Graphics();
    arrow.moveTo(-8, -5);
    arrow.lineTo(-13, 0);
    arrow.lineTo(-8, 5);
    arrow.stroke({ color: t.accent, width: 2, alpha: 0.8 });
    arrow.x = -backW / 2 + 20;
    backCt.addChild(arrow);

    const backTxt = new Text({
      text: "LOBBY",
      style: uiStyle(11, 0xa08060, "700"),
    });
    backTxt.anchor.set(0.5, 0.5);
    backTxt.x = 6;
    backCt.addChild(backTxt);

    backCt.eventMode = "static";
    backCt.cursor = "pointer";

    backCt.on("pointerover", () => {
      gsap.to(backCt.scale, { x: 1.06, y: 1.06, duration: 0.12 });
      backBg.clear();
      backBg.roundRect(-backW / 2, -backH / 2, backW, backH, backH / 2);
      backBg.fill({ color: t.accent, alpha: 0.12 });
      backBg.roundRect(-backW / 2, -backH / 2, backW, backH, backH / 2);
      backBg.stroke({ color: t.accent, width: 1.5 });
      backTxt.style.fill = t.accent;
      arrow.clear();
      arrow.moveTo(-8, -5);
      arrow.lineTo(-13, 0);
      arrow.lineTo(-8, 5);
      arrow.stroke({ color: t.accent, width: 2.5 });
    });
    backCt.on("pointerout", () => {
      gsap.to(backCt.scale, { x: 1, y: 1, duration: 0.15 });
      backBg.clear();
      backBg.roundRect(-backW / 2, -backH / 2, backW, backH, backH / 2);
      backBg.fill({ color: 0x000000, alpha: 0.3 });
      backBg.roundRect(-backW / 2, -backH / 2, backW, backH, backH / 2);
      backBg.stroke({ color: t.frameBorder, width: 1.2, alpha: 0.6 });
      backTxt.style.fill = 0xa08060;
      arrow.clear();
      arrow.moveTo(-8, -5);
      arrow.lineTo(-13, 0);
      arrow.lineTo(-8, 5);
      arrow.stroke({ color: t.accent, width: 2, alpha: 0.8 });
    });
    backCt.on("pointerdown", () => {
      gsap.to(backCt.scale, { x: 0.94, y: 0.94, duration: 0.05 });
    });
    backCt.on("pointerup", () => {
      gsap.to(backCt.scale, { x: 1, y: 1, duration: 0.2, ease: "back.out(2)" });
      this.onBack?.();
    });
    stage.addChild(backCt);

    // ── Title (centered, with decorative side lines) ──
    this.headerTitle = new Text({
      text: this.game.name,
      style: headerStyle(20, t.accent),
    });
    this.headerTitle.anchor.set(0.5, 0.5);
    this.headerTitle.x = W / 2;
    this.headerTitle.y = hdrCenterY;
    stage.addChild(this.headerTitle);

    // Decorative lines flanking the title
    const titleHalfW = this.headerTitle.width / 2 + 12;
    const lineY = hdrCenterY;
    const deco = new Graphics();
    // Left line
    deco.moveTo(W / 2 - titleHalfW - 60, lineY);
    deco.lineTo(W / 2 - titleHalfW, lineY);
    deco.stroke({ color: t.accent, width: 1, alpha: 0.25 });
    // Left diamond
    const ldx = W / 2 - titleHalfW - 4;
    deco.moveTo(ldx, lineY - 3);
    deco.lineTo(ldx + 3, lineY);
    deco.lineTo(ldx, lineY + 3);
    deco.lineTo(ldx - 3, lineY);
    deco.closePath();
    deco.fill({ color: t.accent, alpha: 0.2 });
    // Right line
    deco.moveTo(W / 2 + titleHalfW, lineY);
    deco.lineTo(W / 2 + titleHalfW + 60, lineY);
    deco.stroke({ color: t.accent, width: 1, alpha: 0.25 });
    // Right diamond
    const rdx = W / 2 + titleHalfW + 4;
    deco.moveTo(rdx, lineY - 3);
    deco.lineTo(rdx + 3, lineY);
    deco.lineTo(rdx, lineY + 3);
    deco.lineTo(rdx - 3, lineY);
    deco.closePath();
    deco.fill({ color: t.accent, alpha: 0.2 });
    stage.addChild(deco);

    // ── Ways badge (styled pill) ──
    const ways = Math.pow(this.game.rows, this.game.reels);
    const waysStr = `${ways.toLocaleString()} WAYS`;
    const badgeW = 90;
    const badgeH = 24;
    const badgeX = W - FRAME_X - 14 - badgeW / 2;

    const badgeBg = new Graphics();
    badgeBg.roundRect(badgeX - badgeW / 2, hdrCenterY - badgeH / 2, badgeW, badgeH, badgeH / 2);
    badgeBg.fill({ color: t.accent, alpha: 0.08 });
    badgeBg.roundRect(badgeX - badgeW / 2, hdrCenterY - badgeH / 2, badgeW, badgeH, badgeH / 2);
    badgeBg.stroke({ color: t.accent, width: 1, alpha: 0.3 });
    stage.addChild(badgeBg);

    this.headerWays = new Text({
      text: waysStr,
      style: uiStyle(11, t.accent, "800"),
    });
    this.headerWays.anchor.set(0.5, 0.5);
    this.headerWays.x = badgeX;
    this.headerWays.y = hdrCenterY;
    stage.addChild(this.headerWays);
  }

  // ── Win banner (overlays top of reel frame) ──

  _buildWinBanner() {
    const banner = new Container();
    // Position at top of reel area, centered over the reels
    banner.y = REEL_Y + FRAME_BORDER + 4;
    banner.visible = false;

    const bannerW = FRAME_W - 2 * FRAME_BORDER - 20;
    const bannerH = 38;
    const bannerX = FRAME_X + FRAME_BORDER + 10;

    const bg = new Graphics();
    // Dark backdrop so it's readable over symbols
    bg.roundRect(bannerX, 0, bannerW, bannerH, 8);
    bg.fill({ color: 0x0a0604, alpha: 0.85 });
    bg.roundRect(bannerX, 0, bannerW, bannerH, 8);
    bg.stroke({ color: this.theme.accent, width: 1.5, alpha: 0.5 });
    // Gold accent line at bottom
    bg.rect(bannerX + 20, bannerH - 1, bannerW - 40, 1);
    bg.fill({ color: 0xffd700, alpha: 0.3 });
    banner.addChild(bg);

    this.winText = new Text({
      text: "",
      style: headerStyle(18, 0xffd700),
    });
    this.winText.anchor.set(0.5, 0.5);
    this.winText.x = W / 2;
    this.winText.y = bannerH / 2;
    banner.addChild(this.winText);

    this.winBanner = banner;
    this.app.stage.addChild(banner);
  }

  // ── Premium canvas border & background ──

  _buildCanvasBg() {
    const t = this.theme;
    const H = this.canvasH;
    const border = 4;
    const bg = new Graphics();

    // Dark base fill
    bg.rect(0, 0, W, H);
    bg.fill(0x080402);

    // ── Outer ornate border ──
    // Outermost accent line
    bg.roundRect(0, 0, W, H, 14);
    bg.stroke({ color: t.frameBorder, width: border, alpha: 0.6 });
    // Second inner line
    bg.roundRect(border + 1, border + 1, W - 2 * (border + 1), H - 2 * (border + 1), 11);
    bg.stroke({ color: t.frameBorder, width: 1, alpha: 0.3 });

    // ── Corner ornaments ──
    const inset = 12;
    const ornSize = 18;
    const cornerPositions = [
      [inset, inset],                     // top-left
      [W - inset, inset],                 // top-right
      [inset, H - inset],                 // bottom-left
      [W - inset, H - inset],             // bottom-right
    ];
    for (const [cx, cy] of cornerPositions) {
      // Diamond shape
      bg.moveTo(cx, cy - ornSize / 2);
      bg.lineTo(cx + ornSize / 2, cy);
      bg.lineTo(cx, cy + ornSize / 2);
      bg.lineTo(cx - ornSize / 2, cy);
      bg.closePath();
      bg.fill({ color: t.accent, alpha: 0.1 });
      bg.moveTo(cx, cy - ornSize / 2);
      bg.lineTo(cx + ornSize / 2, cy);
      bg.lineTo(cx, cy + ornSize / 2);
      bg.lineTo(cx - ornSize / 2, cy);
      bg.closePath();
      bg.stroke({ color: t.accent, width: 1, alpha: 0.25 });
      // Center dot
      bg.circle(cx, cy, 2);
      bg.fill({ color: t.accent, alpha: 0.35 });
    }

    // ── Edge midpoint accents ──
    const midW = W / 2;
    const midH = H / 2;
    // Top center
    bg.moveTo(midW - 30, border + 2);
    bg.lineTo(midW, border + 2);
    bg.stroke({ color: t.accent, width: 1, alpha: 0.2 });
    bg.moveTo(midW, border + 2);
    bg.lineTo(midW + 30, border + 2);
    bg.stroke({ color: t.accent, width: 1, alpha: 0.2 });
    bg.circle(midW, border + 2, 2);
    bg.fill({ color: t.accent, alpha: 0.3 });
    // Bottom center
    bg.moveTo(midW - 30, H - border - 2);
    bg.lineTo(midW, H - border - 2);
    bg.stroke({ color: t.accent, width: 1, alpha: 0.15 });
    bg.moveTo(midW, H - border - 2);
    bg.lineTo(midW + 30, H - border - 2);
    bg.stroke({ color: t.accent, width: 1, alpha: 0.15 });
    bg.circle(midW, H - border - 2, 2);
    bg.fill({ color: t.accent, alpha: 0.2 });
    // Left center
    bg.moveTo(border + 2, midH - 20);
    bg.lineTo(border + 2, midH + 20);
    bg.stroke({ color: t.accent, width: 1, alpha: 0.12 });
    bg.circle(border + 2, midH, 2);
    bg.fill({ color: t.accent, alpha: 0.2 });
    // Right center
    bg.moveTo(W - border - 2, midH - 20);
    bg.lineTo(W - border - 2, midH + 20);
    bg.stroke({ color: t.accent, width: 1, alpha: 0.12 });
    bg.circle(W - border - 2, midH, 2);
    bg.fill({ color: t.accent, alpha: 0.2 });

    // ── Subtle inner vignette (darker corners) ──
    const vigInset = border + 3;
    const vigCorners = [
      [vigInset, vigInset, vigInset + 40, vigInset, vigInset, vigInset + 40],                         // TL
      [W - vigInset, vigInset, W - vigInset - 40, vigInset, W - vigInset, vigInset + 40],             // TR
      [vigInset, H - vigInset, vigInset + 40, H - vigInset, vigInset, H - vigInset - 40],             // BL
      [W - vigInset, H - vigInset, W - vigInset - 40, H - vigInset, W - vigInset, H - vigInset - 40], // BR
    ];
    for (const [x, y, x2, y2, x3, y3] of vigCorners) {
      bg.moveTo(x2, y2);
      bg.lineTo(x, y);
      bg.lineTo(x3, y3);
      bg.stroke({ color: t.accent, width: 0.5, alpha: 0.15 });
    }

    this.app.stage.addChild(bg);
  }

  // ── Reel frame ──

  _buildReelFrame() {
    const t = this.theme;
    const frame = new Graphics();

    // Drop shadow behind the frame
    frame.roundRect(FRAME_X + 2, REEL_Y + 3, FRAME_W, this.reelFrameH, 16);
    frame.fill({ color: 0x000000, alpha: 0.35 });

    // Outer ornate border (double-ring effect)
    frame.roundRect(FRAME_X - 2, REEL_Y - 2, FRAME_W + 4, this.reelFrameH + 4, 16);
    frame.fill({ color: t.frameBorder, alpha: 0.3 });
    frame.roundRect(FRAME_X, REEL_Y, FRAME_W, this.reelFrameH, 14);
    frame.fill(t.frameBorder);

    // Inner dark area
    const ix = FRAME_X + FRAME_BORDER;
    const iy = REEL_Y + FRAME_BORDER;
    const iw = FRAME_W - 2 * FRAME_BORDER;
    const ih = this.reelFrameH - 2 * FRAME_BORDER;
    frame.roundRect(ix, iy, iw, ih, 11);
    frame.fill(t.frameInner);

    // Inner edge highlights (top + bottom)
    frame.rect(ix + 10, iy, iw - 20, 1);
    frame.fill({ color: t.accent, alpha: 0.06 });
    frame.rect(ix + 10, iy + ih - 1, iw - 20, 1);
    frame.fill({ color: t.accent, alpha: 0.04 });

    // Reel column backgrounds with subtle depth
    const reelStartX = ix + FRAME_PAD;
    const reelStartY = iy + FRAME_PAD;
    const reelH = this.game.rows * this.cellH;

    for (let r = 0; r < this.game.reels; r++) {
      const rx = reelStartX + r * (this.reelW + REEL_GAP);
      // Slight inset shadow
      frame.roundRect(rx - 1, reelStartY - 1, this.reelW + 2, reelH + 2, 7);
      frame.fill({ color: 0x000000, alpha: 0.4 });
      // Reel bg
      frame.roundRect(rx, reelStartY, this.reelW, reelH, 6);
      frame.fill(t.reelBg);
    }

    // Row dividers
    for (let row = 1; row < this.game.rows; row++) {
      const ly = reelStartY + row * this.cellH;
      frame.rect(reelStartX, ly - 0.5, this.reelInnerW, 1);
      frame.fill({ color: t.reelDivider, alpha: 0.4 });
    }

    // Column dividers (between reels)
    for (let r = 1; r < this.game.reels; r++) {
      const dx = reelStartX + r * (this.reelW + REEL_GAP) - REEL_GAP / 2;
      frame.rect(dx - 0.5, reelStartY, 1, reelH);
      frame.fill({ color: t.reelDivider, alpha: 0.3 });
    }

    // Corner accents (small gold dots in frame corners)
    const cornerR = 3;
    const corners = [
      [FRAME_X + 10, REEL_Y + 10],
      [FRAME_X + FRAME_W - 10, REEL_Y + 10],
      [FRAME_X + 10, REEL_Y + this.reelFrameH - 10],
      [FRAME_X + FRAME_W - 10, REEL_Y + this.reelFrameH - 10],
    ];
    for (const [cx, cy] of corners) {
      frame.circle(cx, cy, cornerR);
      frame.fill({ color: t.accent, alpha: 0.2 });
    }

    this.app.stage.addChild(frame);
  }

  // ── Reels (symbol sprites with masks) ──
  // Each reel: fixed wrapper (with mask) → scrollable content container → sprites.
  // The wrapper stays at the reel's position; only the inner container scrolls.

  _buildReels() {
    const { reels, rows } = this.game;
    const ix = FRAME_X + FRAME_BORDER + FRAME_PAD;
    const iy = REEL_Y + FRAME_BORDER + FRAME_PAD;

    this.reelContainers = [];
    this.reelSymbols = [];
    this.winGlows = [];

    for (let r = 0; r < reels; r++) {
      const rx = ix + r * (this.reelW + REEL_GAP);

      // Fixed wrapper positioned at the reel column
      const wrapper = new Container();
      wrapper.x = rx;
      wrapper.y = iy;
      this.app.stage.addChild(wrapper);

      // Mask in wrapper-local coords (0,0 → reelW, rows*cellH)
      const mask = new Graphics();
      mask.roundRect(0, 0, this.reelW, rows * this.cellH, 5);
      mask.fill(0xffffff);
      wrapper.addChild(mask);
      wrapper.mask = mask;

      // Scrollable content container (this is what GSAP animates)
      const ct = new Container();
      wrapper.addChild(ct);

      // Create sprite pool: PAD_COUNT + rows
      const totalSlots = PAD_COUNT + rows;
      const sprites = [];
      const glows = [];

      for (let i = 0; i < totalSlots; i++) {
        const sy = i * this.cellH;

        // Win glow (behind symbol, hidden by default)
        const glow = new Graphics();
        glow.roundRect(4, sy + 4, this.reelW - 8, this.cellH - 8, 6);
        glow.fill({ color: this.theme.accent, alpha: 0.25 });
        glow.visible = false;
        ct.addChild(glow);

        // Symbol sprite (texture + size set later via _setSymbolTexture)
        const sp = new Sprite();
        sp.anchor.set(0.5, 0.5);
        sp.x = this.reelW / 2;
        sp.y = sy + this.cellH / 2;
        sp.visible = false; // hidden until a texture is assigned
        ct.addChild(sp);

        sprites.push(sp);
        glows.push(glow);
      }

      this.reelContainers.push(ct);
      this.reelSymbols.push(sprites);
      this.winGlows.push(glows);
    }
  }

  _fillIdleReels() {
    const { reels, rows } = this.game;
    const symIds = Object.keys(GAME_SYMBOL_MAP[this.game.id] || {});
    if (!symIds.length) return;

    for (let r = 0; r < reels; r++) {
      for (let i = 0; i < PAD_COUNT + rows; i++) {
        const id = symIds[Math.floor(Math.random() * symIds.length)];
        const tex = getTexture(this.textures, this.game.id, id);
        this._setSymbolTexture(this.reelSymbols[r][i], tex);
      }
    }
  }

  _randomSymbolId() {
    const symIds = Object.keys(GAME_SYMBOL_MAP[this.game.id] || {});
    return symIds[Math.floor(Math.random() * symIds.length)];
  }

  // Sets texture on a reel sprite and sizes it correctly.
  // Must be used instead of direct sprite.texture assignment.
  _setSymbolTexture(sp, tex) {
    if (!tex) return;
    sp.texture = tex;
    sp.width = this.symSize;
    sp.height = this.symSize;
    sp.visible = true;
  }

  // ── Controls (bet chips, spin button, balance, auto chips) ──

  _buildControls() {
    const t = this.theme;
    const stage = this.app.stage;
    const y = this.ctrlY;
    const mob = this.isMobile;
    const ctrlH = mob ? 130 : 105;

    // Controls background — subtle dark area, no bordered panel
    const bg = new Graphics();
    bg.roundRect(FRAME_X, y, FRAME_W, ctrlH, 10);
    bg.fill({ color: 0x000000, alpha: 0.2 });
    // Thin separator line above controls
    bg.rect(FRAME_X + 20, y, FRAME_W - 40, 1);
    bg.fill({ color: t.frameBorder, alpha: 0.2 });
    stage.addChild(bg);

    // ── Left section: BET + AUTO ──
    const leftX = FRAME_X + 16;

    // BET label
    const betFontSize = mob ? 11 : 9;
    const betLabel = new Text({ text: "BET", style: uiStyle(betFontSize, 0x806040, "800") });
    betLabel.x = leftX;
    betLabel.y = y + 8;
    stage.addChild(betLabel);

    // Bet chips (circular casino style) — bigger on mobile
    this.betChips = [];
    const chipSize = mob ? 38 : 30;
    const chipGap = mob ? 8 : 6;
    const chipFontSize = mob ? 12 : 10;
    const chipCenterY = mob ? y + 38 : y + 32;
    this.game.betOptions.forEach((val, i) => {
      const chip = this._createCasinoChip(
        leftX + i * (chipSize + chipGap) + chipSize / 2,
        chipCenterY,
        chipSize / 2,
        String(val),
        i === 0,
        t,
        chipFontSize,
      );
      chip.container.on("pointerdown", () => {
        if (this._spinning) return;
        this._currentBet = val;
        this._updateBetChips();
        this.onBetChange?.(val);
      });
      stage.addChild(chip.container);
      this.betChips.push(chip);
    });

    // AUTO label
    const autoLabelY = mob ? y + 66 : y + 55;
    const autoLabel = new Text({ text: "AUTO", style: uiStyle(betFontSize, 0x806040, "800") });
    autoLabel.x = leftX;
    autoLabel.y = autoLabelY;
    stage.addChild(autoLabel);

    // Auto-spin chips (pill style) — bigger on mobile
    const autoOpts = [1, 5, 10, 100];
    const pillW = mob ? 56 : 44;
    const pillH = mob ? 30 : 24;
    const pillGap = mob ? 60 : 50;
    const pillFontSize = mob ? 13 : 11;
    const pillY = mob ? y + 85 : y + 70;
    this.autoChips = [];
    autoOpts.forEach((val, i) => {
      const label = val === 1 ? "1x" : val + "x";
      const chip = this._createPillChip(
        leftX + i * pillGap,
        pillY,
        pillW,
        pillH,
        label,
        val === 1,
        t,
        pillFontSize,
      );
      chip.container.on("pointerdown", () => {
        if (this._spinning) return;
        this._currentAutoCount = val;
        this._updateAutoChips();
        this.onAutoChange?.(val);
      });
      stage.addChild(chip.container);
      this.autoChips.push({ ...chip, value: val });
    });

    // ── Center: SPIN button ──
    this._buildSpinButton(y, t, stage);

    // ── Right section: BALANCE ──
    const rightX = W - FRAME_X - 16;
    const balLabelY = mob ? y + 30 : y + 22;
    const balValueY = mob ? y + 50 : y + 40;

    const balLabel = new Text({
      text: "BALANCE",
      style: uiStyle(mob ? 11 : 9, 0x806040, "800"),
    });
    balLabel.anchor.set(1, 0);
    balLabel.x = rightX;
    balLabel.y = balLabelY;
    stage.addChild(balLabel);

    this.balanceText = new Text({
      text: "0",
      style: headerStyle(mob ? 26 : 22, t.accent),
    });
    this.balanceText.anchor.set(1, 0);
    this.balanceText.x = rightX;
    this.balanceText.y = balValueY;
    stage.addChild(this.balanceText);
  }

  _buildSpinButton(ctrlY, t, stage) {
    const spinX = W / 2;
    const spinY = ctrlY + (this.isMobile ? 65 : 52);
    const spinR = 42;

    // All spin button visuals in a container positioned at center
    // so scaling pivots from the button's center.
    const spinCt = new Container();
    spinCt.x = spinX;
    spinCt.y = spinY;
    stage.addChild(spinCt);

    // Outer breathing glow (drawn at 0,0 = center)
    this.spinBtnGlow = new Graphics();
    this.spinBtnGlow.circle(0, 0, spinR + 8);
    this.spinBtnGlow.fill({ color: t.accent, alpha: 0.1 });
    spinCt.addChild(this.spinBtnGlow);

    // Rotating ring (visible during spin)
    this._spinRing = new Graphics();
    for (let a = 0; a < 4; a++) {
      const startAngle = (a * Math.PI) / 2;
      const endAngle = startAngle + Math.PI / 3;
      this._spinRing.arc(0, 0, spinR + 4, startAngle, endAngle);
      this._spinRing.stroke({ color: 0xffd700, width: 2.5, alpha: 0.7 });
    }
    this._spinRing.visible = false;
    spinCt.addChild(this._spinRing);

    // Main button — layered gradient look (drawn at 0,0 = center)
    const btnBg = new Graphics();
    // Outer gold ring
    btnBg.circle(0, 0, spinR);
    btnBg.fill(0xffd700);
    // Main face
    btnBg.circle(0, 0, spinR - 3);
    btnBg.fill(t.accent);
    // Inner shadow ring
    btnBg.circle(0, 0, spinR * 0.75);
    btnBg.stroke({ color: 0x000000, width: 1.5, alpha: 0.2 });
    // Center highlight
    btnBg.circle(0, -6, spinR * 0.38);
    btnBg.fill({ color: 0xffffff, alpha: 0.08 });
    spinCt.addChild(btnBg);

    // Spin text
    this.spinBtnText = new Text({
      text: "SPIN",
      style: headerStyle(20, 0x1a0f0a),
    });
    this.spinBtnText.anchor.set(0.5, 0.5);
    spinCt.addChild(this.spinBtnText);

    // Invisible hit area
    this.spinBtn = new Graphics();
    this.spinBtn.circle(0, 0, spinR);
    this.spinBtn.fill({ color: 0xffffff, alpha: 0.001 });
    this.spinBtn.eventMode = "static";
    this.spinBtn.cursor = "pointer";

    this.spinBtn.on("pointerover", () => {
      if (this._spinning) return;
      gsap.to(spinCt.scale, { x: 1.08, y: 1.08, duration: 0.15, ease: "back.out(2)" });
    });
    this.spinBtn.on("pointerout", () => {
      gsap.to(spinCt.scale, { x: 1, y: 1, duration: 0.2 });
    });
    this.spinBtn.on("pointerdown", () => {
      if (this._spinning) return;
      gsap.to(spinCt.scale, { x: 0.92, y: 0.92, duration: 0.06 });
    });
    this.spinBtn.on("pointerup", () => {
      gsap.to(spinCt.scale, { x: 1, y: 1, duration: 0.3, ease: "elastic.out(1.2, 0.4)" });
      if (!this._spinning) this.onSpin?.();
    });

    this._spinBtnBg = btnBg;
    this._spinCt = spinCt;
    spinCt.addChild(this.spinBtn);

    // Idle breathing glow
    this._startIdleGlow();
  }

  _startIdleGlow() {
    this._spinIdleTween = gsap.to(this.spinBtnGlow, {
      alpha: 0.35,
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
  }

  _stopIdleGlow() {
    if (this._spinIdleTween) {
      this._spinIdleTween.kill();
      this._spinIdleTween = null;
    }
  }

  // ── Casino-style circular chip ──
  // All drawing is local (0,0 = center). Container positioned at (cx, cy)
  // so pivot is naturally at center → scale works correctly.

  _createCasinoChip(cx, cy, r, label, active, theme, fontSize = 10) {
    const ct = new Container();
    ct.x = cx;
    ct.y = cy;

    const bg = new Graphics();
    ct.addChild(bg);

    const txt = new Text({
      text: label,
      style: uiStyle(fontSize, active ? 0x1a0f0a : 0x806040, "800"),
    });
    txt.anchor.set(0.5, 0.5);
    ct.addChild(txt);

    ct.eventMode = "static";
    ct.cursor = "pointer";

    // Hover effect (scales from center since pivot is at 0,0 = chip center)
    ct.on("pointerover", () => {
      gsap.to(ct.scale, { x: 1.12, y: 1.12, duration: 0.12 });
    });
    ct.on("pointerout", () => {
      gsap.to(ct.scale, { x: 1, y: 1, duration: 0.15 });
    });

    const chip = { container: ct, bg, txt, r, active };
    this._drawCasinoChip(chip, active, theme);
    return chip;
  }

  _drawCasinoChip(chip, active, theme) {
    const { bg, txt, r } = chip;
    bg.clear();

    if (active) {
      // Glow behind
      bg.circle(0, 0, r + 3);
      bg.fill({ color: theme.accent, alpha: 0.15 });
      // Outer ring
      bg.circle(0, 0, r);
      bg.fill(theme.accent);
      // Inner circle
      bg.circle(0, 0, r - 3);
      bg.fill({ color: 0x000000, alpha: 0.15 });
      bg.circle(0, 0, r - 3);
      bg.stroke({ color: 0xffd700, width: 1, alpha: 0.5 });
      // Top highlight
      bg.circle(0, -2, r * 0.45);
      bg.fill({ color: 0xffffff, alpha: 0.1 });

      txt.style.fill = 0x1a0f0a;
    } else {
      // Dark chip
      bg.circle(0, 0, r);
      bg.fill({ color: 0x1a1008, alpha: 0.9 });
      bg.circle(0, 0, r);
      bg.stroke({ color: 0x3a2a18, width: 1.5 });
      // Inner ring
      bg.circle(0, 0, r - 4);
      bg.stroke({ color: 0x2a1a10, width: 0.5 });

      txt.style.fill = 0x806040;
    }

    txt.x = 0;
    txt.y = 0;
    chip.active = active;
  }

  // ── Pill-style auto chip ──
  // Drawn from (-w/2, -h/2) so container center = chip center → correct scale pivot.

  _createPillChip(x, y, w, h, label, active, theme, fontSize = 11) {
    const ct = new Container();
    ct.x = x + w / 2;
    ct.y = y + h / 2;

    const bg = new Graphics();
    ct.addChild(bg);

    const txt = new Text({
      text: label,
      style: uiStyle(fontSize, active ? theme.accent : 0x806040, "700"),
    });
    txt.anchor.set(0.5, 0.5);
    ct.addChild(txt);

    ct.eventMode = "static";
    ct.cursor = "pointer";

    ct.on("pointerover", () => {
      gsap.to(ct.scale, { x: 1.08, y: 1.08, duration: 0.1 });
    });
    ct.on("pointerout", () => {
      gsap.to(ct.scale, { x: 1, y: 1, duration: 0.12 });
    });

    const chip = { container: ct, bg, txt, w, h, active };
    this._drawPillChip(chip, active, theme);
    return chip;
  }

  _drawPillChip(chip, active, theme) {
    const { bg, txt, w, h } = chip;
    const hw = w / 2;
    const hh = h / 2;
    const r = hh;
    bg.clear();

    if (active) {
      // Glow
      bg.roundRect(-hw - 2, -hh - 2, w + 4, h + 4, r + 2);
      bg.fill({ color: theme.accent, alpha: 0.1 });
      // Fill
      bg.roundRect(-hw, -hh, w, h, r);
      bg.fill({ color: theme.accent, alpha: 0.2 });
      bg.roundRect(-hw, -hh, w, h, r);
      bg.stroke({ color: theme.accent, width: 1.5 });
      // Top highlight
      bg.roundRect(-hw + 4, -hh + 1, w - 8, 1, 1);
      bg.fill({ color: 0xffffff, alpha: 0.12 });

      txt.style.fill = theme.accent;
    } else {
      bg.roundRect(-hw, -hh, w, h, r);
      bg.fill({ color: 0x000000, alpha: 0.3 });
      bg.roundRect(-hw, -hh, w, h, r);
      bg.stroke({ color: 0x3a2a18, width: 1 });

      txt.style.fill = 0x806040;
    }
    txt.x = 0;
    txt.y = 0;
    chip.active = active;
  }

  _updateBetChips() {
    this.betChips.forEach((chip, i) => {
      const active = this.game.betOptions[i] === this._currentBet;
      this._drawCasinoChip(chip, active, this.theme);
    });
  }

  _updateAutoChips() {
    const opts = [1, 5, 10, 100];
    this.autoChips.forEach((chip, i) => {
      const active = opts[i] === this._currentAutoCount;
      this._drawPillChip(chip, active, this.theme);
    });
  }

  // ── Auto-spin progress bar ──

  _buildAutoProgress() {
    const ct = new Container();
    ct.y = this.autoY;
    ct.visible = false;

    const bg = new Graphics();
    bg.roundRect(FRAME_X, 0, FRAME_W, 36, 8);
    bg.fill({ color: this.theme.accent, alpha: 0.07 });
    bg.roundRect(FRAME_X, 0, FRAME_W, 36, 8);
    bg.stroke({ color: this.theme.accent, width: 1, alpha: 0.2 });
    ct.addChild(bg);

    this.autoProgressText = new Text({
      text: "Spin 1 / 10",
      style: uiStyle(13, this.theme.accent, "600"),
    });
    this.autoProgressText.anchor.set(0.5, 0.5);
    this.autoProgressText.x = W / 2 - 35;
    this.autoProgressText.y = 18;
    ct.addChild(this.autoProgressText);

    // Stop button
    const stopCt = new Container();
    stopCt.x = W / 2 + 50;
    stopCt.y = 7;

    const stopBg = new Graphics();
    stopBg.roundRect(0, 0, 52, 24, 5);
    stopBg.stroke({ color: 0xf87171, width: 1.5 });
    stopCt.addChild(stopBg);

    const stopTxt = new Text({
      text: "STOP",
      style: uiStyle(11, 0xf87171, "700"),
    });
    stopTxt.anchor.set(0.5, 0.5);
    stopTxt.x = 26;
    stopTxt.y = 12;
    stopCt.addChild(stopTxt);

    stopCt.eventMode = "static";
    stopCt.cursor = "pointer";
    stopCt.on("pointerover", () => {
      stopBg.clear();
      stopBg.roundRect(0, 0, 52, 24, 5);
      stopBg.fill({ color: 0xf87171, alpha: 0.15 });
      stopBg.roundRect(0, 0, 52, 24, 5);
      stopBg.stroke({ color: 0xf87171, width: 1.5 });
    });
    stopCt.on("pointerout", () => {
      stopBg.clear();
      stopBg.roundRect(0, 0, 52, 24, 5);
      stopBg.stroke({ color: 0xf87171, width: 1.5 });
    });
    stopCt.on("pointerdown", () => this.onAutoStop?.());
    ct.addChild(stopCt);

    this.autoProgressCt = ct;
    this.app.stage.addChild(ct);
  }

  // ═══════════════════════════════════════════
  // PUBLIC API (called by Vue component)
  // ═══════════════════════════════════════════

  // ── Spin animation ──

  async animateSpin(resultGrid) {
    this._spinning = true;
    this.hideWins();
    this.setSpinButtonState(false);

    const { reels, rows } = this.game;

    // 1. Build strips: random padding + result for each reel
    for (let r = 0; r < reels; r++) {
      const sprites = this.reelSymbols[r];

      // Fill padding symbols with random textures
      for (let i = 0; i < PAD_COUNT; i++) {
        const symId = this._randomSymbolId();
        const tex = getTexture(this.textures, this.game.id, symId);
        this._setSymbolTexture(sprites[i], tex);
        sprites[i].alpha = 1;
      }

      // Fill result symbols
      for (let row = 0; row < rows; row++) {
        const symId = resultGrid[r][row];
        const tex = getTexture(this.textures, this.game.id, symId);
        this._setSymbolTexture(sprites[PAD_COUNT + row], tex);
        sprites[PAD_COUNT + row].alpha = 1;
      }
    }

    // 2. Snap reel containers to top (y = 0, showing padding)
    for (let r = 0; r < reels; r++) {
      this.reelContainers[r].y = 0;
    }

    // 3. Animate each reel to final position (staggered)
    const finalY = -(PAD_COUNT * this.cellH);
    const promises = [];

    for (let r = 0; r < reels; r++) {
      const duration = 1.0 + r * 0.35;
      const ct = this.reelContainers[r];

      const p = new Promise((resolve) => {
        gsap.to(ct, {
          y: finalY,
          duration,
          ease: "back.out(0.6)",
          onComplete: () => {
            // Brief "pop" on the result symbols when this reel stops
            for (let row = 0; row < rows; row++) {
              const sp = this.reelSymbols[r][PAD_COUNT + row];
              const bx = sp.scale.x;
              const by = sp.scale.y;
              gsap.fromTo(
                sp.scale,
                { x: bx * 1.12, y: by * 1.12 },
                { x: bx, y: by, duration: 0.15, ease: "power2.out" },
              );
            }
            resolve();
          },
        });
      });
      promises.push(p);
    }

    await Promise.all(promises);
    this._spinning = false;
  }

  // ── Win presentation ──

  // Colors for up to 8 win lines (cycled)
  static WIN_LINE_COLORS = [
    0xffd700, 0xff4444, 0x44ff88, 0x44aaff,
    0xff8844, 0xdd44ff, 0x44ffdd, 0xff44aa,
  ];

  // Get the screen-space center of a result symbol (relative to stage)
  _getSymbolCenter(reel, row) {
    const ix = FRAME_X + FRAME_BORDER + FRAME_PAD;
    const iy = REEL_Y + FRAME_BORDER + FRAME_PAD;
    const rx = ix + reel * (this.reelW + REEL_GAP);
    // After spin, container.y = -(PAD_COUNT * cellH), so result row 0 is at y = 0 visually
    const sy = iy + row * this.cellH + this.cellH / 2;
    const sx = rx + this.reelW / 2;
    return { x: sx, y: sy };
  }

  showWins(wins, totalWin) {
    if (!wins.length || totalWin <= 0) return;

    const { reels, rows } = this.game;

    // Build set of winning positions
    const winSet = new Set();
    for (const win of wins) {
      for (const [reel, row] of win.positions) {
        winSet.add(`${reel}-${row}`);
      }
    }

    // Dim non-winning symbols, highlight winning ones
    for (let r = 0; r < reels; r++) {
      for (let row = 0; row < rows; row++) {
        const idx = PAD_COUNT + row;
        const sp = this.reelSymbols[r][idx];
        const glow = this.winGlows[r][idx];
        const isWin = winSet.has(`${r}-${row}`);

        if (isWin) {
          // Pulsing scale (relative to current base)
          const bx = sp.scale.x;
          const by = sp.scale.y;
          gsap.to(sp.scale, {
            x: bx * 1.15,
            y: by * 1.15,
            duration: 0.5,
            yoyo: true,
            repeat: -1,
            ease: "power1.inOut",
          });
          // Show glow
          glow.visible = true;
          gsap.to(glow, {
            alpha: 1,
            duration: 0.5,
            yoyo: true,
            repeat: -1,
            ease: "power1.inOut",
          });
          glow.alpha = 0.3;
        } else {
          gsap.to(sp, { alpha: 0.3, duration: 0.3 });
        }
      }
    }

    // ── Draw win connection lines ──
    this._drawWinLines(wins);

    // Show win banner with animated counter
    this.winBanner.visible = true;
    const counter = { val: 0 };
    gsap.to(counter, {
      val: totalWin,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => {
        this.winText.text = `${Math.round(counter.val).toLocaleString()}  CHIPS`;
      },
    });

    // Banner pulse
    gsap.to(this.winBanner, {
      alpha: 0.7,
      duration: 0.8,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut",
    });
    this.winBanner.alpha = 1;
  }

  _drawWinLines(wins) {
    // Remove old lines
    if (this.winLines) {
      this.app.stage.removeChild(this.winLines);
      this.winLines.destroy({ children: true });
    }
    this.winLines = new Container();
    this.app.stage.addChild(this.winLines);

    const colors = SlotApp.WIN_LINE_COLORS;

    wins.forEach((win, wi) => {
      if (!win.positions || win.positions.length < 2) return;

      const color = colors[wi % colors.length];

      // Sort positions by reel index
      const sorted = [...win.positions].sort((a, b) => a[0] - b[0]);

      // For ways-to-win: group positions by reel, connect each reel-pair
      // Build reel→rows map
      const reelRows = new Map();
      for (const [reel, row] of sorted) {
        if (!reelRows.has(reel)) reelRows.set(reel, []);
        reelRows.get(reel).push(row);
      }
      const reelKeys = [...reelRows.keys()].sort((a, b) => a - b);

      // Draw lines reel-to-reel connecting matching positions
      for (let k = 0; k < reelKeys.length - 1; k++) {
        const r1 = reelKeys[k];
        const r2 = reelKeys[k + 1];
        const rows1 = reelRows.get(r1);
        const rows2 = reelRows.get(r2);

        for (const row1 of rows1) {
          for (const row2 of rows2) {
            const p1 = this._getSymbolCenter(r1, row1);
            const p2 = this._getSymbolCenter(r2, row2);

            // Glow line (thick, low alpha)
            const glow = new Graphics();
            glow.moveTo(p1.x, p1.y);
            glow.lineTo(p2.x, p2.y);
            glow.stroke({ color, width: 6, alpha: 0.2 });
            this.winLines.addChild(glow);

            // Core line
            const line = new Graphics();
            line.moveTo(p1.x, p1.y);
            line.lineTo(p2.x, p2.y);
            line.stroke({ color, width: 2.5, alpha: 0.8 });
            this.winLines.addChild(line);
          }
        }
      }

      // Draw dots at each winning position
      for (const [reel, row] of sorted) {
        const p = this._getSymbolCenter(reel, row);
        const dot = new Graphics();
        // Outer glow
        dot.circle(p.x, p.y, 6);
        dot.fill({ color, alpha: 0.25 });
        // Inner dot
        dot.circle(p.x, p.y, 3);
        dot.fill({ color, alpha: 0.9 });
        this.winLines.addChild(dot);
      }
    });

    // Animate lines in: fade + slight glow pulse
    this.winLines.alpha = 0;
    gsap.to(this.winLines, { alpha: 1, duration: 0.4, ease: "power2.out" });
    gsap.to(this.winLines, {
      alpha: 0.6,
      duration: 0.8,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: 0.4,
    });
  }

  hideWins() {
    const { reels, rows } = this.game;

    // Kill all win animations
    for (let r = 0; r < reels; r++) {
      for (let row = 0; row < rows; row++) {
        const idx = PAD_COUNT + row;
        const sp = this.reelSymbols[r][idx];
        const glow = this.winGlows[r][idx];

        gsap.killTweensOf(sp);
        gsap.killTweensOf(sp.scale);
        gsap.killTweensOf(glow);
        sp.alpha = 1;
        // Restore correct size (not scale=1 which ignores texture dimensions)
        sp.width = this.symSize;
        sp.height = this.symSize;
        glow.visible = false;
        glow.alpha = 0;
      }
    }

    // Remove win lines
    if (this.winLines) {
      gsap.killTweensOf(this.winLines);
      this.app.stage.removeChild(this.winLines);
      this.winLines.destroy({ children: true });
      this.winLines = null;
    }

    // Hide banner
    gsap.killTweensOf(this.winBanner);
    this.winBanner.visible = false;
    this.winBanner.alpha = 1;
    this.winText.text = "";
  }

  // ── UI updates ──

  setBalance(amount) {
    this.balanceText.text = Math.floor(amount).toLocaleString();
  }

  setBet(bet, betOptions) {
    this._currentBet = bet;
    if (betOptions) this.game.betOptions = betOptions;
    this._updateBetChips();
  }

  setAutoCount(count) {
    this._currentAutoCount = count;
    this._updateAutoChips();
    this._updateSpinLabel();
  }

  _updateSpinLabel() {
    const count = this._currentAutoCount;
    if (count > 1) {
      this.spinBtnText.text = "SPIN";
      this.spinBtnText.style.fontSize = 15;
      this.spinBtnText.y = -6;
      // Show count badge below spin text
      if (!this._spinCountText) {
        this._spinCountText = new Text({
          text: "",
          style: uiStyle(12, 0x1a0f0a, "800"),
        });
        this._spinCountText.anchor.set(0.5, 0.5);
        this._spinCt.addChild(this._spinCountText);
      }
      this._spinCountText.text = `${count}x`;
      this._spinCountText.y = 10;
      this._spinCountText.visible = true;
    } else {
      this.spinBtnText.text = "SPIN";
      this.spinBtnText.style.fontSize = 20;
      this.spinBtnText.y = 0;
      if (this._spinCountText) {
        this._spinCountText.visible = false;
      }
    }
  }

  setSpinButtonState(enabled) {
    this.spinBtn.eventMode = enabled ? "static" : "none";
    this.spinBtn.cursor = enabled ? "pointer" : "default";
    this._spinBtnBg.alpha = enabled ? 1 : 0.5;
    this.spinBtnText.alpha = enabled ? 1 : 0.5;

    if (!enabled) {
      // Spinning state
      this.spinBtnText.text = "\u2022\u2022\u2022";
      this.spinBtnText.style.fontSize = 20;
      this.spinBtnText.y = 0;
      if (this._spinCountText) this._spinCountText.visible = false;
      this._stopIdleGlow();

      // Show & spin the ring
      this._spinRing.visible = true;
      gsap.to(this._spinRing, {
        rotation: Math.PI * 2,
        duration: 1.2,
        repeat: -1,
        ease: "none",
      });

      // Pulse the glow
      gsap.to(this.spinBtnGlow, {
        alpha: 0.5,
        duration: 0.5,
        yoyo: true,
        repeat: -1,
        ease: "power1.inOut",
      });
    } else {
      // Idle state
      gsap.killTweensOf(this._spinRing);
      this._spinRing.visible = false;
      this._spinRing.rotation = 0;

      gsap.killTweensOf(this.spinBtnGlow);
      this.spinBtnGlow.alpha = 1;
      this._startIdleGlow();

      // Reset container scale in case hover left it scaled
      gsap.killTweensOf(this._spinCt.scale);
      this._spinCt.scale.set(1);

      this._updateSpinLabel();
    }
  }

  showAutoProgress(current, total) {
    this.autoProgressCt.visible = true;
    this.autoProgressText.text = `Spin ${current} / ${total}`;
  }

  hideAutoProgress() {
    this.autoProgressCt.visible = false;
  }

  // ── Cleanup ──

  destroy() {
    // Kill all GSAP tweens
    gsap.killTweensOf(this.spinBtnGlow);
    gsap.killTweensOf(this._spinRing);
    gsap.killTweensOf(this._spinCt?.scale);
    gsap.killTweensOf(this.winBanner);
    this._stopIdleGlow();

    if (this.winLines) {
      gsap.killTweensOf(this.winLines);
    }

    for (const ct of this.reelContainers) {
      gsap.killTweensOf(ct);
    }
    for (const reelSprites of this.reelSymbols) {
      for (const sp of reelSprites) {
        gsap.killTweensOf(sp);
        gsap.killTweensOf(sp.scale);
      }
    }
    for (const reelGlows of this.winGlows) {
      for (const g of reelGlows) {
        gsap.killTweensOf(g);
      }
    }

    for (const chip of this.betChips) {
      gsap.killTweensOf(chip.container.scale);
    }
    for (const chip of this.autoChips) {
      gsap.killTweensOf(chip.container.scale);
    }

    // Destroy PixiJS app (children yes, textures no — they're cached)
    if (this.app) {
      this.app.destroy(true, { children: true, texture: false });
      this.app = null;
    }
  }
}
