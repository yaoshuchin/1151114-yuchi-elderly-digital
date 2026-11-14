// ========================================================
// 南投縣樂齡學習數位示範體驗場域（魚池）- 核心應用邏輯
// 包含：四大分頁、字體選擇、主題布景、水晶音樂合成器、簡報螢幕畫筆幾何標記
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  // 核心狀態管理
  const state = {
    currentMode: 'modeCenter',  // 'modeCenter' | 'modeA' | 'modeB' | 'modeC'
    qaSubMode: 'list',          // 'list' | 'drill'
    currentSlideIndex: 1,       // 1 ~ 25
    totalSlides: window.SLIDES_DATA ? window.SLIDES_DATA.length : 25,
    autoPlayTimer: null,
    isAutoPlaying: false,
    fontSize: localStorage.getItem('yuchi_pref_font') || 'md',      // 'md' | 'lg' | 'xl'
    theme: localStorage.getItem('yuchi_pref_theme') || 'light',     // 'light' | 'dark' | 'green' | 'blue'
    activeQaCategory: 'all',
    qaSearchQuery: '',
    currentDrillIndex: 0,
    isDrillRevealed: false
  };

  // DOM 元素快取
  const elements = {
    modeBtns: document.querySelectorAll('.mode-tab-btn'),
    views: {
      modeCenter: document.getElementById('view-modeCenter'),
      modeA: document.getElementById('view-modeA'),
      modeB: document.getElementById('view-modeB'),
      modeC: document.getElementById('view-modeC')
    },
    // 字體與布景按鈕
    fontBtns: document.querySelectorAll('.seg-btn[data-font-val]'),
    themeBtns: document.querySelectorAll('.theme-dot-btn[data-theme-val]'),
    // C 簡報模式元素
    deckSlideImg: document.getElementById('deckSlideImg'),
    deckSlideBadge: document.getElementById('deckSlideBadge'),
    deckCategoryBadge: document.getElementById('deckCategoryBadge'),
    deckSlideTitle: document.getElementById('deckSlideTitle'),
    deckPrevBtn: document.getElementById('deckPrevBtn'),
    deckNextBtn: document.getElementById('deckNextBtn'),
    deckJumpInput: document.getElementById('deckJumpInput'),
    deckTotalSlidesSpan: document.getElementById('deckTotalSlidesSpan'),
    deckNotesPanel: document.getElementById('deckNotesPanel'),
    deckNotesContent: document.getElementById('deckNotesContent'),
    toggleNotesBtn: document.getElementById('toggleNotesBtn'),
    toggleThumbsBtn: document.getElementById('toggleThumbsBtn'),
    thumbnailDrawer: document.getElementById('thumbnailDrawer'),
    thumbnailTrack: document.getElementById('thumbnailTrack'),
    autoPlayBtn: document.getElementById('autoPlayBtn'),
    deckFullscreenBtn: document.getElementById('deckFullscreenBtn'),
    viewportBox: document.getElementById('deckViewportBox'),
    // 畫筆元素
    toggleDrawingBtn: document.getElementById('toggleDrawingBtn'),
    drawingToolbar: document.getElementById('deckDrawingToolbar'),
    annotationCanvas: document.getElementById('annotationCanvas'),
    // A 成果網頁元素
    galleryGrid: document.getElementById('galleryGrid'),
    // B 問答模式元素
    qaListContainer: document.getElementById('qaListContainer'),
    qaDrillContainer: document.getElementById('qaDrillContainer'),
    qaSearchInput: document.getElementById('qaSearchInput'),
    catFilterBtns: document.querySelectorAll('.cat-filter-btn'),
    qaModeSwitchBtns: document.querySelectorAll('.qa-mode-btn'),
    // 閃卡元素
    drillBadge: document.getElementById('drillBadge'),
    drillCounter: document.getElementById('drillCounter'),
    drillQuestion: document.getElementById('drillQuestion'),
    drillProgressFill: document.getElementById('drillProgressFill'),
    drillRevealBox: document.getElementById('drillRevealBox'),
    drillAnswerText: document.getElementById('drillAnswerText'),
    drillPointsUl: document.getElementById('drillPointsUl'),
    drillRelatedSlides: document.getElementById('drillRelatedSlides'),
    btnRevealAnswer: document.getElementById('btnRevealAnswer'),
    btnDrillPrev: document.getElementById('btnDrillPrev'),
    btnDrillNext: document.getElementById('btnDrillNext'),
    // 水晶音樂元素
    musicPlayBtn: document.getElementById('musicPlayBtn'),
    musicTrackSelect: document.getElementById('musicTrackSelect'),
    musicMuteBtn: document.getElementById('musicMuteBtn')
  };

  // ==========================================
  // 1. 模式切換邏輯 (Center / A / B / C)
  // ==========================================
  function switchMode(modeId) {
    state.currentMode = modeId;

    // 更新導覽列按鈕 active
    elements.modeBtns.forEach(btn => {
      if (btn.dataset.mode === modeId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 切換視圖顯隱
    Object.keys(elements.views).forEach(key => {
      if (elements.views[key]) {
        if (key === modeId) {
          elements.views[key].classList.add('active');
        } else {
          elements.views[key].classList.remove('active');
        }
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 若切換到 C 簡報模式，更新該頁並適應畫布
    if (modeId === 'modeC') {
      renderSlide(state.currentSlideIndex);
      setTimeout(resizeAnnotationCanvas, 200);
    }
  }
  window.switchMode = switchMode;

  elements.modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchMode(btn.dataset.mode);
    });
  });

  const brandLogo = document.getElementById('brandLogoNav');
  if (brandLogo) {
    brandLogo.addEventListener('click', () => switchMode('modeCenter'));
  }

  // ==========================================
  // 2. 字體大小設定 (中、大、特大)
  // ==========================================
  function setFontSize(size) {
    state.fontSize = size;
    document.body.dataset.font = size;
    localStorage.setItem('yuchi_pref_font', size);

    elements.fontBtns.forEach(btn => {
      if (btn.dataset.fontVal === size) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  elements.fontBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setFontSize(btn.dataset.fontVal);
    });
  });
  setFontSize(state.fontSize);

  // ==========================================
  // 3. 布景主題設定 (淺、深、綠、藍)
  // ==========================================
  function setTheme(themeName) {
    state.theme = themeName;
    document.body.dataset.theme = themeName;
    localStorage.setItem('yuchi_pref_theme', themeName);

    elements.themeBtns.forEach(btn => {
      if (btn.dataset.themeVal === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  elements.themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setTheme(btn.dataset.themeVal);
    });
  });
  setTheme(state.theme);

  // ==========================================
  // 4. 水晶音樂合成器 (Web Audio API - 4首可選+靜音)
  // ==========================================
  class CrystalSynthesizer {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.isMuted = false;
      this.volume = 0.28;
      this.currentTrack = 0;
      this.timer = null;
      this.step = 0;

      // 4 首空靈水晶音樂曲目音階與音符陣列
      this.tracks = [
        {
          name: "日月晨曦",
          bpm: 66,
          scale: [
            [261.63, 392.00, 523.25], // C4, G4, C5
            [329.63, 440.00, 659.25], // E4, A4, E5
            [392.00, 523.25, 783.99], // G4, C5, G5
            [440.00, 659.25, 880.00], // A4, E5, A5
            [523.25, 783.99, 1046.50],// C5, G5, C6
            [440.00, 659.25, 880.00],
            [392.00, 523.25, 659.25],
            [329.63, 392.00, 523.25]
          ]
        },
        {
          name: "魚池茶香",
          bpm: 60,
          scale: [
            [293.66, 440.00, 587.33], // D4, A4, D5
            [349.23, 523.25, 698.46], // F4, C5, F5
            [392.00, 587.33, 783.99], // G4, D5, G5
            [440.00, 659.25, 880.00], // A4, E5, A5
            [523.25, 698.46, 1046.50],// C5, F5, C6
            [440.00, 587.33, 880.00],
            [349.23, 440.00, 698.46],
            [293.66, 392.00, 587.33]
          ]
        },
        {
          name: "樂齡微風",
          bpm: 64,
          scale: [
            [392.00, 493.88, 783.99], // G4, B4, G5
            [440.00, 587.33, 880.00], // A4, D5, A5
            [493.88, 659.25, 987.77], // B4, E5, B5
            [587.33, 783.99, 1174.66],// D5, G5, D6
            [659.25, 880.00, 1318.51],// E5, A5, E6
            [493.88, 659.25, 987.77],
            [440.00, 587.33, 783.99],
            [392.00, 493.88, 587.33]
          ]
        },
        {
          name: "幸福陪伴",
          bpm: 58,
          scale: [
            [349.23, 440.00, 698.46], // F4, A4, F5
            [392.00, 523.25, 783.99], // G4, C5, G5
            [440.00, 587.33, 880.00], // A4, D5, A5
            [523.25, 659.25, 1046.50],// C5, E5, C6
            [587.33, 783.99, 1174.66],// D5, G5, D6
            [523.25, 659.25, 880.00],
            [440.00, 523.25, 698.46],
            [349.23, 440.00, 523.25]
          ]
        }
      ];
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playCrystalBell(freq, timeOffset = 0, duration = 2.4) {
      if (this.isMuted || !this.ctx) return;

      const now = this.ctx.currentTime + timeOffset;

      // 主音振盪器 (Sine)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      // 空靈泛音振盪器 (Sine at inharmonic freq 2.76x)
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.756, now);

      // 低通濾波器營造溫潤感
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now);

      // 泛音增益
      const gain2 = this.ctx.createGain();
      gain2.gain.setValueAtTime(0.25, now);
      osc2.connect(gain2);

      // 總包絡線增益 (Envelope)
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.02);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(filter);
      gain2.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    }

    start() {
      this.init();
      this.isPlaying = true;
      this.step = 0;
      this.scheduleNext();
    }

    stop() {
      this.isPlaying = false;
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }

    scheduleNext() {
      if (!this.isPlaying) return;

      const track = this.tracks[this.currentTrack];
      const chord = track.scale[this.step % track.scale.length];

      // 琶音演奏水晶音
      chord.forEach((freq, idx) => {
        this.playCrystalBell(freq, idx * 0.16, 2.5);
      });

      this.step++;
      const intervalMs = (60 / track.bpm) * 1000 * 1.5;
      this.timer = setTimeout(() => this.scheduleNext(), intervalMs);
    }

    setTrack(index) {
      this.currentTrack = index;
      this.step = 0;
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      return this.isMuted;
    }
  }

  const crystalMusic = new CrystalSynthesizer();

  // 音樂播放/暫停事件
  if (elements.musicPlayBtn) {
    elements.musicPlayBtn.addEventListener('click', () => {
      if (!crystalMusic.isPlaying) {
        crystalMusic.start();
        elements.musicPlayBtn.innerHTML = '⏸';
        elements.musicPlayBtn.classList.add('playing');
        elements.musicPlayBtn.title = '暫停水晶音樂';
      } else {
        crystalMusic.stop();
        elements.musicPlayBtn.innerHTML = '▶';
        elements.musicPlayBtn.classList.remove('playing');
        elements.musicPlayBtn.title = '播放水晶音樂';
      }
    });
  }

  // 切換曲目
  if (elements.musicTrackSelect) {
    elements.musicTrackSelect.addEventListener('change', (e) => {
      const idx = parseInt(e.target.value, 10);
      crystalMusic.setTrack(idx);
    });
  }

  // 靜音切換
  if (elements.musicMuteBtn) {
    elements.musicMuteBtn.addEventListener('click', () => {
      const muted = crystalMusic.toggleMute();
      elements.musicMuteBtn.innerHTML = muted ? '🔇' : '🔊';
      elements.musicMuteBtn.title = muted ? '解除靜音' : '靜音';
    });
  }

  // ==========================================
  // 5. 簡報模式核心邏輯
  // ==========================================
  function renderSlide(index) {
    if (index < 1) index = 1;
    if (index > state.totalSlides) index = state.totalSlides;
    state.currentSlideIndex = index;

    const slideData = window.SLIDES_DATA[index - 1];
    if (!slideData) return;

    // 換頁時自動清除畫筆標記，讓新投影片清晰展示
    clearAnnotationCanvas();

    elements.deckSlideImg.src = slideData.image;
    elements.deckSlideImg.alt = slideData.title;

    elements.deckSlideBadge.textContent = `${index} / ${state.totalSlides}`;
    elements.deckCategoryBadge.textContent = slideData.category;
    elements.deckSlideTitle.textContent = slideData.title;

    if (elements.deckJumpInput) {
      elements.deckJumpInput.value = index;
    }

    if (slideData.notes) {
      elements.deckNotesContent.innerHTML = slideData.notes;
    } else {
      const outline = slideData.texts.length > 0 
        ? slideData.texts.join('\n• ') 
        : '（此頁為視覺展示投影片）';
      elements.deckNotesContent.innerHTML = `<strong>【本頁提報重點】</strong>\n• ${outline}`;
    }

    // 縮圖更新
    const thumbItems = elements.thumbnailTrack.querySelectorAll('.thumb-item');
    thumbItems.forEach((item, idx) => {
      if (idx + 1 === index) {
        item.classList.add('active');
        item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });
  }

  function nextSlide() {
    if (state.currentSlideIndex < state.totalSlides) {
      renderSlide(state.currentSlideIndex + 1);
    } else if (state.isAutoPlaying) {
      renderSlide(1);
    }
  }

  function prevSlide() {
    if (state.currentSlideIndex > 1) {
      renderSlide(state.currentSlideIndex - 1);
    }
  }

  if (elements.deckNextBtn) elements.deckNextBtn.addEventListener('click', nextSlide);
  if (elements.deckPrevBtn) elements.deckPrevBtn.addEventListener('click', prevSlide);

  const prevArrow = document.getElementById('arrowPrev');
  const nextArrow = document.getElementById('arrowNext');
  if (prevArrow) prevArrow.addEventListener('click', prevSlide);
  if (nextArrow) nextArrow.addEventListener('click', nextSlide);

  if (elements.deckJumpInput) {
    elements.deckJumpInput.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) renderSlide(val);
    });
  }

  if (elements.toggleNotesBtn) {
    elements.toggleNotesBtn.addEventListener('click', () => {
      elements.deckNotesPanel.classList.toggle('active');
      elements.toggleNotesBtn.classList.toggle('active');
    });
  }

  if (elements.toggleThumbsBtn) {
    elements.toggleThumbsBtn.addEventListener('click', () => {
      elements.thumbnailDrawer.classList.toggle('active');
      elements.toggleThumbsBtn.classList.toggle('active');
    });
  }

  if (elements.autoPlayBtn) {
    elements.autoPlayBtn.addEventListener('click', () => {
      state.isAutoPlaying = !state.isAutoPlaying;
      if (state.isAutoPlaying) {
        elements.autoPlayBtn.innerHTML = '⏸ 停止播放';
        elements.autoPlayBtn.classList.add('active');
        state.autoPlayTimer = setInterval(nextSlide, 4500);
      } else {
        elements.autoPlayBtn.innerHTML = '▶ 自動輪播';
        elements.autoPlayBtn.classList.remove('active');
        clearInterval(state.autoPlayTimer);
      }
    });
  }

  if (elements.deckFullscreenBtn) {
    elements.deckFullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        elements.viewportBox.requestFullscreen().catch(err => {
          console.warn('Fullscreen error:', err);
        });
      } else {
        document.exitFullscreen();
      }
      setTimeout(resizeAnnotationCanvas, 300);
    });
  }

  window.addEventListener('keydown', (e) => {
    if (state.currentMode === 'modeC' && document.activeElement.tagName !== 'INPUT') {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (elements.deckFullscreenBtn) elements.deckFullscreenBtn.click();
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (elements.toggleNotesBtn) elements.toggleNotesBtn.click();
      }
    }
  });

  function buildThumbnailTrack() {
    if (!elements.thumbnailTrack || !window.SLIDES_DATA) return;
    elements.thumbnailTrack.innerHTML = '';
    window.SLIDES_DATA.forEach(slide => {
      const item = document.createElement('div');
      item.className = 'thumb-item';
      item.dataset.slideNum = slide.slide_num;
      item.innerHTML = `
        <img src="${slide.image}" alt="投影片 ${slide.slide_num}" loading="lazy" />
        <div class="thumb-num">第 ${slide.slide_num} 頁</div>
      `;
      item.addEventListener('click', () => {
        renderSlide(slide.slide_num);
      });
      elements.thumbnailTrack.appendChild(item);
    });
  }

  window.jumpToSlide = function(slideNum) {
    switchMode('modeC');
    renderSlide(slideNum);
  };

  // ==========================================
  // 6. 簡報螢幕畫筆、螢光標記與幾何圖形 (Annotation Engine)
  // ==========================================
  const drawState = {
    isActive: false,
    currentTool: 'pen', // 'pen' | 'highlighter' | 'line' | 'arrow' | 'rect' | 'circle' | 'eraser'
    color: '#ef4444',
    widthLevel: 1,      // 0: thin, 1: mid, 2: thick
    widths: {
      pen: [3, 6, 12],
      highlighter: [14, 24, 38],
      line: [3, 6, 12],
      arrow: [3, 6, 12],
      rect: [3, 6, 12],
      circle: [3, 6, 12],
      eraser: [20, 36, 54]
    },
    isMouseDown: false,
    startX: 0,
    startY: 0,
    undoStack: [],
    snapshot: null
  };

  const canvas = elements.annotationCanvas;
  const ctx = canvas ? canvas.getContext('2d') : null;

  function resizeAnnotationCanvas() {
    if (!canvas || !elements.viewportBox) return;
    const rect = elements.viewportBox.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      // 保持繪製內容
      const tempImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (tempImg && tempImg.width > 0) {
        ctx.putImageData(tempImg, 0, 0);
      }
    }
  }
  window.addEventListener('resize', resizeAnnotationCanvas);

  function clearAnnotationCanvas() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawState.undoStack = [];
  }

  function saveUndoState() {
    if (!ctx || !canvas) return;
    if (drawState.undoStack.length >= 15) {
      drawState.undoStack.shift();
    }
    drawState.undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  }

  function handleUndo() {
    if (!ctx || !canvas || drawState.undoStack.length === 0) return;
    const prev = drawState.undoStack.pop();
    ctx.putImageData(prev, 0, 0);
  }

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  // 繪製幾何箭頭輔助函數
  function drawArrow(context, fromx, fromy, tox, toy) {
    const headlen = 16;
    const angle = Math.atan2(toy - fromy, tox - fromx);
    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    context.stroke();
  }

  if (canvas && ctx) {
    const onStart = (e) => {
      if (!drawState.isActive) return;
      e.preventDefault();
      drawState.isMouseDown = true;
      saveUndoState();

      const { x, y } = getCanvasCoords(e);
      drawState.startX = x;
      drawState.startY = y;

      drawState.snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (drawState.currentTool === 'pen' || drawState.currentTool === 'highlighter' || drawState.currentTool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    };

    const onMove = (e) => {
      if (!drawState.isActive || !drawState.isMouseDown) return;
      e.preventDefault();
      const { x, y } = getCanvasCoords(e);

      const tool = drawState.currentTool;
      const width = drawState.widths[tool][drawState.widthLevel];

      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (tool === 'pen') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = drawState.color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (tool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = drawState.color;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = width;
        ctx.lineCap = 'square';
        ctx.lineJoin = 'bevel';
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      } else {
        // 幾何圖形 (復原初始畫面並預覽即時圖形)
        ctx.putImageData(drawState.snapshot, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = drawState.color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (tool === 'line') {
          ctx.beginPath();
          ctx.moveTo(drawState.startX, drawState.startY);
          ctx.lineTo(x, y);
          ctx.stroke();
        } else if (tool === 'arrow') {
          drawArrow(ctx, drawState.startX, drawState.startY, x, y);
        } else if (tool === 'rect') {
          ctx.strokeRect(drawState.startX, drawState.startY, x - drawState.startX, y - drawState.startY);
        } else if (tool === 'circle') {
          const rx = Math.abs(x - drawState.startX) / 2;
          const ry = Math.abs(y - drawState.startY) / 2;
          const cx = Math.min(drawState.startX, x) + rx;
          const cy = Math.min(drawState.startY, y) + ry;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
    };

    const onEnd = (e) => {
      if (!drawState.isMouseDown) return;
      drawState.isMouseDown = false;
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
    };

    canvas.addEventListener('mousedown', onStart);
    canvas.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    canvas.addEventListener('touchstart', onStart, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  // 畫筆開關鈕
  if (elements.toggleDrawingBtn) {
    elements.toggleDrawingBtn.addEventListener('click', () => {
      drawState.isActive = !drawState.isActive;
      if (drawState.isActive) {
        elements.toggleDrawingBtn.innerHTML = '✏️ 關閉畫筆';
        elements.toggleDrawingBtn.classList.add('active');
        elements.drawingToolbar.style.display = 'flex';
        canvas.classList.add('active');
        resizeAnnotationCanvas();
      } else {
        elements.toggleDrawingBtn.innerHTML = '✏️ 螢幕畫筆';
        elements.toggleDrawingBtn.classList.remove('active');
        elements.drawingToolbar.style.display = 'none';
        canvas.classList.remove('active');
      }
    });
  }

  // 畫筆工具切換 (pen, highlighter, line, arrow, rect, circle)
  document.querySelectorAll('.draw-tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.draw-tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      drawState.currentTool = btn.dataset.tool;
    });
  });

  // 顏色切換
  document.querySelectorAll('.draw-color-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.draw-color-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      drawState.color = chip.dataset.color;
    });
  });

  // 粗細切換
  const btnStrokeWidth = document.getElementById('btnStrokeWidth');
  if (btnStrokeWidth) {
    btnStrokeWidth.addEventListener('click', () => {
      drawState.widthLevel = (drawState.widthLevel + 1) % 3;
      const labels = ['細', '中', '粗'];
      btnStrokeWidth.textContent = `粗細: ${labels[drawState.widthLevel]}`;
    });
  }

  // 橡皮擦、復原、清空
  const btnDrawEraser = document.getElementById('btnDrawEraser');
  if (btnDrawEraser) {
    btnDrawEraser.addEventListener('click', () => {
      document.querySelectorAll('.draw-tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
      btnDrawEraser.classList.toggle('active');
      drawState.currentTool = btnDrawEraser.classList.contains('active') ? 'eraser' : 'pen';
    });
  }

  const btnDrawUndo = document.getElementById('btnDrawUndo');
  if (btnDrawUndo) btnDrawUndo.addEventListener('click', handleUndo);

  const btnDrawClear = document.getElementById('btnDrawClear');
  if (btnDrawClear) btnDrawClear.addEventListener('click', clearAnnotationCanvas);

  // ==========================================
  // 7. A 成果網頁展示藝廊
  // ==========================================
  function buildModeAGallery() {
    if (!elements.galleryGrid || !window.SLIDES_DATA) return;
    elements.galleryGrid.innerHTML = '';

    window.SLIDES_DATA.forEach(slide => {
      const card = document.createElement('div');
      card.className = 'gallery-item';
      card.innerHTML = `
        <img src="${slide.image}" alt="${slide.title}" loading="lazy" />
        <div class="gallery-caption">
          <span>P.${slide.slide_num} ${slide.title}</span>
          <span style="color: var(--primary); font-size: 0.75rem;">查看簡報 ➔</span>
        </div>
      `;
      card.addEventListener('click', () => {
        window.jumpToSlide(slide.slide_num);
      });
      elements.galleryGrid.appendChild(card);
    });
  }

  document.querySelectorAll('.jump-slide-btn[data-slide]').forEach(btn => {
    btn.addEventListener('click', () => {
      const slideNum = parseInt(btn.dataset.slide, 10);
      if (!isNaN(slideNum)) {
        window.jumpToSlide(slideNum);
      }
    });
  });

  // ==========================================
  // 8. B 問答模式 (Q&A List & Drill Mode)
  // ==========================================
  function renderQaList() {
    if (!elements.qaListContainer || !window.QA_DATA) return;
    elements.qaListContainer.innerHTML = '';

    const filtered = window.QA_DATA.filter(qa => {
      const matchesCat = state.activeQaCategory === 'all' || qa.category === state.activeQaCategory;
      const matchesSearch = !state.qaSearchQuery || 
        qa.question.includes(state.qaSearchQuery) || 
        qa.answer.includes(state.qaSearchQuery) || 
        qa.badge.includes(state.qaSearchQuery);
      return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
      elements.qaListContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
          <div>查無符合條件之問答題目，請嘗試更換分類或關鍵字</div>
        </div>
      `;
      return;
    }

    filtered.forEach((qa, idx) => {
      const card = document.createElement('div');
      card.className = 'qa-item-card';
      if (idx === 0) card.classList.add('open');

      const relatedPills = qa.related_slides.map(s => 
        `<button class="slide-link-pill" onclick="window.jumpToSlide(${s})">投影片 P.${s}</button>`
      ).join(' ');

      const pointsHtml = qa.points.map(pt => `<li>${pt}</li>`).join('');

      card.innerHTML = `
        <div class="qa-item-question-row">
          <div class="qa-q-left">
            <span class="q-badge ${qa.badge === '高頻必考' ? 'hot' : ''}">${qa.badge}</span>
            <div class="qa-question-title">Q${qa.id}. ${qa.question}</div>
          </div>
          <div class="qa-toggle-icon">▼</div>
        </div>
        <div class="qa-item-answer-pane">
          <div class="answer-lead">${qa.answer}</div>
          <div class="answer-points-box">
            <h4>💡 提報回答核心要點：</h4>
            <ul>${pointsHtml}</ul>
          </div>
          <div class="qa-meta-footer">
            <span>分類：<strong>${qa.category}</strong></span>
            <div class="related-slide-tags">
              <span>佐證簡報頁：</span>
              ${relatedPills}
            </div>
          </div>
        </div>
      `;

      const qRow = card.querySelector('.qa-item-question-row');
      qRow.addEventListener('click', () => {
        card.classList.toggle('open');
      });

      elements.qaListContainer.appendChild(card);
    });
  }

  function renderDrillCard() {
    if (!window.QA_DATA || window.QA_DATA.length === 0) return;
    const qa = window.QA_DATA[state.currentDrillIndex];
    if (!qa) return;

    state.isDrillRevealed = false;
    elements.drillRevealBox.classList.remove('revealed');
    elements.btnRevealAnswer.textContent = '👀 揭曉作答要點與佐證';

    elements.drillBadge.textContent = `${qa.category}・${qa.badge}`;
    elements.drillCounter.textContent = `${state.currentDrillIndex + 1} / ${window.QA_DATA.length}`;
    elements.drillQuestion.textContent = `Q${qa.id}. ${qa.question}`;

    const progressPct = ((state.currentDrillIndex + 1) / window.QA_DATA.length) * 100;
    elements.drillProgressFill.style.width = `${progressPct}%`;

    elements.drillAnswerText.textContent = qa.answer;
    elements.drillPointsUl.innerHTML = qa.points.map(p => `<li>${p}</li>`).join('');
    elements.drillRelatedSlides.innerHTML = qa.related_slides.map(s => 
      `<button class="slide-link-pill" onclick="window.jumpToSlide(${s})">查看簡報 P.${s}</button>`
    ).join(' ');
  }

  if (elements.btnRevealAnswer) {
    elements.btnRevealAnswer.addEventListener('click', () => {
      state.isDrillRevealed = !state.isDrillRevealed;
      if (state.isDrillRevealed) {
        elements.drillRevealBox.classList.add('revealed');
        elements.btnRevealAnswer.textContent = '🔒 隱藏作答要點';
      } else {
        elements.drillRevealBox.classList.remove('revealed');
        elements.btnRevealAnswer.textContent = '👀 揭曉作答要點與佐證';
      }
    });
  }

  if (elements.btnDrillNext) {
    elements.btnDrillNext.addEventListener('click', () => {
      if (state.currentDrillIndex < window.QA_DATA.length - 1) {
        state.currentDrillIndex++;
        renderDrillCard();
      }
    });
  }

  if (elements.btnDrillPrev) {
    elements.btnDrillPrev.addEventListener('click', () => {
      if (state.currentDrillIndex > 0) {
        state.currentDrillIndex--;
        renderDrillCard();
      }
    });
  }

  elements.qaModeSwitchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.qaModeSwitchBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const subMode = btn.dataset.submode;
      state.qaSubMode = subMode;

      if (subMode === 'drill') {
        elements.qaListContainer.style.display = 'none';
        elements.qaDrillContainer.classList.add('active');
        renderDrillCard();
      } else {
        elements.qaListContainer.style.display = 'flex';
        elements.qaDrillContainer.classList.remove('active');
        renderQaList();
      }
    });
  });

  elements.catFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.catFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeQaCategory = btn.dataset.cat;
      renderQaList();
    });
  });

  if (elements.qaSearchInput) {
    elements.qaSearchInput.addEventListener('input', (e) => {
      state.qaSearchQuery = e.target.value.trim();
      renderQaList();
    });
  }

  // ==========================================
  // 初始化渲染
  // ==========================================
  buildThumbnailTrack();
  buildModeAGallery();
  renderQaList();
  renderSlide(1);

  // 門禁密碼檢查 (密碼: 049)
  checkAuthOnLoad();
  const lockBtn = document.getElementById('lockNavBtn');
  if (lockBtn) {
    lockBtn.addEventListener('click', window.lockSystem);
  }

  // 支援 URL Hash 路由 (如 #modeCenter, #modeA, #modeB, #modeC)
  const hash = window.location.hash.replace('#', '');
  if (hash === 'modeA' || hash === 'modeB' || hash === 'modeC' || hash === 'modeCenter') {
    switchMode(hash);
  }
});

// ==========================================
// 門禁密碼驗證邏輯 (密碼: 049)
// ==========================================
const CORRECT_PASSWORD = '049';
const AUTH_STORAGE_KEY = 'yuchi_digital_eval_auth';

function checkAuthOnLoad() {
  const overlay = document.getElementById('auth-overlay');
  if (!overlay) return;
  const isAuth = sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  if (isAuth) {
    overlay.classList.add('unlocked');
  } else {
    overlay.classList.remove('unlocked');
    const input = document.getElementById('authPasswordInput');
    if (input) setTimeout(() => input.focus(), 300);
  }
}

window.handleAuthSubmit = function(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('authPasswordInput');
  const overlay = document.getElementById('auth-overlay');
  const authBox = document.getElementById('authBox');
  const errorMsg = document.getElementById('authErrorMsg');

  if (!input) return;
  const val = input.value.trim();

  if (val === CORRECT_PASSWORD) {
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
    if (errorMsg) errorMsg.classList.remove('visible');
    if (overlay) overlay.classList.add('unlocked');
  } else {
    if (errorMsg) errorMsg.classList.add('visible');
    if (authBox) {
      authBox.classList.remove('shake-animation');
      void authBox.offsetWidth; // trigger reflow
      authBox.classList.add('shake-animation');
    }
    input.value = '';
    input.focus();
  }
};

window.lockSystem = function() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  const overlay = document.getElementById('auth-overlay');
  const input = document.getElementById('authPasswordInput');
  const errorMsg = document.getElementById('authErrorMsg');
  if (errorMsg) errorMsg.classList.remove('visible');
  if (overlay) overlay.classList.remove('unlocked');
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 300);
  }
};
