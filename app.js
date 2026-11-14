// ========================================================
// 南投縣樂齡學習數位示範體驗場域（魚池）- 核心應用邏輯
// 包含：四大分頁、字體選擇、主題布景、4首風格迥異水晶音樂合成器、簡報全螢幕最適化與螢幕畫筆
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
    isFitViewport: false,
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
      modeC: document.getElementById('view-modeC'),
      modeQR: document.getElementById('view-modeQR')
    },
    // 字體與布景
    fontBtns: document.querySelectorAll('.seg-btn[data-font-val]'),
    themeBtns: document.querySelectorAll('.theme-dot-btn[data-theme-val]'),
    // C 簡報模式
    deckContainer: document.getElementById('deckContainer'),
    viewportBox: document.getElementById('deckViewportBox'),
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
    btnExitFullscreen: document.getElementById('btnExitFullscreen'),
    btnFitScreen: document.getElementById('btnFitScreen'),
    // 畫筆
    toggleDrawingBtn: document.getElementById('toggleDrawingBtn'),
    drawingToolbar: document.getElementById('deckDrawingToolbar'),
    annotationCanvas: document.getElementById('annotationCanvas'),
    // A 成果網頁
    galleryGrid: document.getElementById('galleryGrid'),
    // B 問答模式
    qaListContainer: document.getElementById('qaListContainer'),
    qaDrillContainer: document.getElementById('qaDrillContainer'),
    qaSearchInput: document.getElementById('qaSearchInput'),
    catFilterBtns: document.querySelectorAll('.cat-filter-btn'),
    qaModeSwitchBtns: document.querySelectorAll('.qa-mode-btn'),
    // 閃卡
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
    // 水晶音樂
    musicPlayBtn: document.getElementById('musicPlayBtn'),
    musicTrackSelect: document.getElementById('musicTrackSelect'),
    musicStylePill: document.getElementById('musicStylePill'),
    musicMuteBtn: document.getElementById('musicMuteBtn')
  };

  // ==========================================
  // 1. 模式切換邏輯 (Center / A / B / C)
  // ==========================================
  function switchMode(modeId) {
    state.currentMode = modeId;

    elements.modeBtns.forEach(btn => {
      if (btn.dataset.mode === modeId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

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
    document.documentElement.dataset.font = size;
    document.body.dataset.font = size;
    localStorage.setItem('yuchi_pref_font', size);

    const fontBtns = document.querySelectorAll('.seg-btn[data-font-val]');
    fontBtns.forEach(btn => {
      if (btn.dataset.fontVal === size) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  const fontBtns = document.querySelectorAll('.seg-btn[data-font-val]');
  fontBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
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
  // 4. 水晶音樂合成器：4首風格迥異、鮮明可辨之演奏曲
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

      // 4 首風格迥異的水晶音樂（節奏、音階、音色與旋律皆獨立設計）
      this.tracks = [
        {
          name: "日月晨曦",
          style: "清晨高亢",
          bpm: 78,
          playMode: "arpeggio",
          filterFreq: 3600,
          harmonicRatio: 2.756,
          decay: 1.4,
          melody: [
            523.25, 659.25, 783.99, 1046.50, 880.00, 783.99, 659.25, 523.25,
            587.33, 659.25, 880.00, 1046.50, 1174.66, 1046.50, 880.00, 783.99
          ]
        },
        {
          name: "魚池茶香",
          style: "深山禪鐘",
          bpm: 46,
          playMode: "deep-zen",
          filterFreq: 1400,
          harmonicRatio: 2.01,
          decay: 3.6,
          melody: [
            293.66, 440.00, 349.23, 523.25, 440.00, 392.00, 349.23, 293.66,
            220.00, 329.63, 293.66, 440.00, 392.00, 349.23, 293.66, 220.00
          ]
        },
        {
          name: "樂齡微風",
          style: "三拍圓舞",
          bpm: 106,
          playMode: "waltz",
          filterFreq: 3000,
          harmonicRatio: 3.01,
          decay: 1.6,
          waltzBass: [196.00, 293.66, 261.63, 196.00],
          waltzChord: [
            [493.88, 587.33],
            [587.33, 783.99],
            [523.25, 659.25],
            [493.88, 587.33]
          ],
          melody: [783.99, 659.25, 587.33, 493.88, 523.25, 587.33, 783.99, 880.00]
        },
        {
          name: "幸福陪伴",
          style: "卡農和弦",
          bpm: 58,
          playMode: "canon",
          filterFreq: 2600,
          harmonicRatio: 2.5,
          decay: 2.2,
          chords: [
            [261.63, 329.63, 392.00, 523.25], // C 大調
            [196.00, 293.66, 392.00, 493.88], // G 大調
            [220.00, 261.63, 329.63, 440.00], // Am 小調
            [164.81, 246.94, 329.63, 392.00], // Em 小調
            [174.61, 261.63, 349.23, 440.00], // F 大調
            [261.63, 329.63, 392.00, 523.25], // C 大調
            [174.61, 261.63, 349.23, 440.00], // F 大調
            [196.00, 293.66, 392.00, 493.88]  // G 大調
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

    playTone(freq, timeOffset = 0, duration = 2.0, gainScale = 1.0) {
      if (this.isMuted || !this.ctx) return;
      const track = this.tracks[this.currentTrack];
      const now = this.ctx.currentTime + timeOffset;

      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * track.harmonicRatio, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(track.filterFreq, now);

      const gain2 = this.ctx.createGain();
      gain2.gain.setValueAtTime(0.22, now);
      osc2.connect(gain2);

      const masterGain = this.ctx.createGain();
      const peakVol = this.volume * gainScale;
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(peakVol, now + 0.015);
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
      this.scheduleLoop();
    }

    stop() {
      this.isPlaying = false;
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }

    scheduleLoop() {
      if (!this.isPlaying) return;
      const track = this.tracks[this.currentTrack];

      if (track.playMode === 'arpeggio') {
        // 曲目 1：日月晨曦（高亢流暢晶鈴）
        const freq = track.melody[this.step % track.melody.length];
        this.playTone(freq, 0, track.decay, 1.0);
        this.step++;
        const interval = (60 / track.bpm) * 1000 * 0.55;
        this.timer = setTimeout(() => this.scheduleLoop(), interval);

      } else if (track.playMode === 'deep-zen') {
        // 曲目 2：魚池茶香（深沉禪音、呼吸般緩慢悠長）
        const freq = track.melody[this.step % track.melody.length];
        this.playTone(freq, 0, track.decay, 1.25);
        this.step++;
        const interval = (60 / track.bpm) * 1000 * 1.5;
        this.timer = setTimeout(() => this.scheduleLoop(), interval);

      } else if (track.playMode === 'waltz') {
        // 曲目 3：樂齡微風（標準三拍子圓舞曲：蹦-恰-恰）
        const measureIdx = Math.floor(this.step / 3) % track.waltzBass.length;
        const beatInMeasure = this.step % 3;

        if (beatInMeasure === 0) {
          // 第 1 拍：低音鐘鳴 + 高音主旋律
          const bass = track.waltzBass[measureIdx];
          const mel = track.melody[measureIdx % track.melody.length];
          this.playTone(bass, 0, 1.8, 1.2);
          this.playTone(mel, 0.05, 1.5, 0.9);
        } else {
          // 第 2、3 拍：輕柔雙音伴奏 (恰、恰)
          const chord = track.waltzChord[measureIdx];
          this.playTone(chord[0], 0, 0.9, 0.5);
          this.playTone(chord[1], 0.02, 0.9, 0.5);
        }

        this.step++;
        const interval = (60 / track.bpm) * 1000;
        this.timer = setTimeout(() => this.scheduleLoop(), interval);

      } else if (track.playMode === 'canon') {
        // 曲目 4：幸福陪伴（古典卡農和弦琶音）
        const chord = track.chords[this.step % track.chords.length];
        chord.forEach((freq, idx) => {
          this.playTone(freq, idx * 0.18, track.decay, 0.85);
        });
        this.step++;
        const interval = (60 / track.bpm) * 1000 * 1.6;
        this.timer = setTimeout(() => this.scheduleLoop(), interval);
      }
    }

    setTrack(index) {
      this.currentTrack = index;
      this.step = 0;
      if (elements.musicStylePill) {
        elements.musicStylePill.textContent = this.tracks[index].style;
      }
      if (this.isPlaying) {
        if (this.timer) clearTimeout(this.timer);
        this.scheduleLoop();
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      return this.isMuted;
    }
  }

  const crystalMusic = new CrystalSynthesizer();

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

  if (elements.musicTrackSelect) {
    elements.musicTrackSelect.addEventListener('change', (e) => {
      const idx = parseInt(e.target.value, 10);
      crystalMusic.setTrack(idx);
    });
  }

  if (elements.musicMuteBtn) {
    elements.musicMuteBtn.addEventListener('click', () => {
      const muted = crystalMusic.toggleMute();
      elements.musicMuteBtn.innerHTML = muted ? '🔇' : '🔊';
      elements.musicMuteBtn.title = muted ? '解除靜音' : '靜音';
    });
  }

  // ==========================================
  // 5. 簡報模式核心邏輯與全螢幕最適化
  // ==========================================
  function renderSlide(index) {
    if (index < 1) index = 1;
    if (index > state.totalSlides) index = state.totalSlides;
    state.currentSlideIndex = index;

    const slideData = window.SLIDES_DATA[index - 1];
    if (!slideData) return;

    clearAnnotationCanvas();

    elements.deckSlideImg.src = slideData.image;
    elements.deckSlideImg.alt = slideData.title;

    elements.deckSlideBadge.textContent = `${index} / ${state.totalSlides}`;
    elements.deckCategoryBadge.textContent = slideData.category;
    elements.deckSlideTitle.textContent = slideData.title;

    const fsSlideCounter = document.getElementById('fsSlideCounter');
    if (fsSlideCounter) {
      fsSlideCounter.textContent = `${index} / ${state.totalSlides}`;
    }

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

  // 視窗最適化開關（免滾動完整看到全部投影片畫面）
  if (elements.btnFitScreen) {
    elements.btnFitScreen.addEventListener('click', () => {
      state.isFitViewport = !state.isFitViewport;
      if (state.isFitViewport) {
        elements.deckContainer.classList.add('fit-viewport');
        elements.btnFitScreen.classList.add('active');
        elements.btnFitScreen.innerHTML = '📐 標準寬幅';
      } else {
        elements.deckContainer.classList.remove('fit-viewport');
        elements.btnFitScreen.classList.remove('active');
        elements.btnFitScreen.innerHTML = '📐 視窗最適';
      }
      setTimeout(resizeAnnotationCanvas, 200);
    });
  }

  if (elements.toggleNotesBtn) {
    elements.toggleNotesBtn.addEventListener('click', () => {
      elements.deckNotesPanel.classList.toggle('active');
      elements.toggleNotesBtn.classList.toggle('active');
      setTimeout(resizeAnnotationCanvas, 200);
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

  // 全螢幕放映
  function enterFullscreen() {
    if (!document.fullscreenElement) {
      if (elements.viewportBox.requestFullscreen) {
        elements.viewportBox.requestFullscreen();
      } else if (elements.viewportBox.webkitRequestFullscreen) {
        elements.viewportBox.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  if (elements.deckFullscreenBtn) {
    elements.deckFullscreenBtn.addEventListener('click', enterFullscreen);
  }
  if (elements.btnExitFullscreen) {
    elements.btnExitFullscreen.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
    });
  }

  function handleFullscreenStateChange() {
    const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    if (isFs) {
      elements.viewportBox.classList.add('is-fullscreen');
      elements.drawingToolbar.style.display = 'flex';
      drawState.isActive = true;
      canvas.classList.add('active');
      const fsTogglePenBtn = document.getElementById('fsTogglePenBtn');
      if (fsTogglePenBtn) fsTogglePenBtn.classList.add('active');
      const fsSlideCounter = document.getElementById('fsSlideCounter');
      if (fsSlideCounter) fsSlideCounter.textContent = `${state.currentSlideIndex} / ${state.totalSlides}`;
    } else {
      elements.viewportBox.classList.remove('is-fullscreen');
      if (!elements.toggleDrawingBtn.classList.contains('active')) {
        elements.drawingToolbar.style.display = 'none';
        drawState.isActive = false;
        canvas.classList.remove('active');
      }
    }
    setTimeout(resizeAnnotationCanvas, 250);
  }

  document.addEventListener('fullscreenchange', handleFullscreenStateChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenStateChange);

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
        enterFullscreen();
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
    currentTool: 'pen',
    color: '#ef4444',
    widthLevel: 1,
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

  document.querySelectorAll('.draw-tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.draw-tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      drawState.currentTool = btn.dataset.tool;
    });
  });

  document.querySelectorAll('.draw-color-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.draw-color-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      drawState.color = chip.dataset.color;
    });
  });

  const btnStrokeWidth = document.getElementById('btnStrokeWidth');
  if (btnStrokeWidth) {
    btnStrokeWidth.addEventListener('click', () => {
      drawState.widthLevel = (drawState.widthLevel + 1) % 3;
      const labels = ['細', '中', '粗'];
      btnStrokeWidth.innerHTML = `<span class="tool-icon">〰️</span><span class="tool-text">${labels[drawState.widthLevel]}</span>`;
      btnStrokeWidth.title = `筆觸粗細: ${labels[drawState.widthLevel]}`;
    });
  }

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

  // 全螢幕底部工具列專屬換頁與功能控制
  const fsPrevBtn = document.getElementById('fsPrevBtn');
  if (fsPrevBtn) fsPrevBtn.addEventListener('click', prevSlide);

  const fsNextBtn = document.getElementById('fsNextBtn');
  if (fsNextBtn) fsNextBtn.addEventListener('click', nextSlide);

  const fsExitFullscreenBtn = document.getElementById('fsExitFullscreenBtn');
  if (fsExitFullscreenBtn) {
    fsExitFullscreenBtn.addEventListener('click', () => {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } else {
        elements.viewportBox.classList.remove('is-fullscreen');
      }
    });
  }

  const fsTogglePenBtn = document.getElementById('fsTogglePenBtn');
  if (fsTogglePenBtn) {
    fsTogglePenBtn.addEventListener('click', () => {
      drawState.isActive = !drawState.isActive;
      if (drawState.isActive) {
        fsTogglePenBtn.classList.add('active');
        canvas.classList.add('active');
      } else {
        fsTogglePenBtn.classList.remove('active');
        canvas.classList.remove('active');
      }
    });
  }

  // 全螢幕工具列收合開關 (防遮簡報)
  const fsMinimizeBtn = document.getElementById('fsMinimizeBtn');
  if (fsMinimizeBtn) {
    fsMinimizeBtn.addEventListener('click', () => {
      if (!elements.drawingToolbar) return;
      elements.drawingToolbar.classList.toggle('is-minimized');
      const isMin = elements.drawingToolbar.classList.contains('is-minimized');
      fsMinimizeBtn.title = isMin ? '展開畫筆工具列' : '收合畫筆工具列 (避免遮住簡報)';
      const icon = document.getElementById('fsMinimizeIcon');
      if (icon) icon.textContent = isMin ? '✏️' : '🔽';
    });
  }

  // 防止點擊工具列按鈕時在背後畫布上誤劃線
  if (elements.drawingToolbar) {
    elements.drawingToolbar.addEventListener('mousedown', (e) => e.stopPropagation());
    elements.drawingToolbar.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: false });
  }

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
  // 9. QR 複製網址與二維條碼點擊放大燈箱 (Lightbox Modal)
  // ==========================================
  function showCopyToast(msg) {
    const toast = document.getElementById('copyToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  const btnCopyFullUrl = document.getElementById('btnCopyFullUrl');
  if (btnCopyFullUrl) {
    btnCopyFullUrl.addEventListener('click', () => {
      const url = 'https://yaoshuchin.github.io/1151114-yuchi-elderly-digital/';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          showCopyToast('✅ 完整公開網址已複製到剪貼簿！');
        }).catch(() => {
          prompt('請手動複製網址：', url);
        });
      } else {
        prompt('請手動複製網址：', url);
      }
    });
  }

  const btnCopyShortUrl = document.getElementById('btnCopyShortUrl');
  if (btnCopyShortUrl) {
    btnCopyShortUrl.addEventListener('click', () => {
      const shortUrl = 'https://tinyurl.com/22qbsl3w';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shortUrl).then(() => {
          showCopyToast('✅ 極簡縮網址已複製到剪貼簿！');
        }).catch(() => {
          prompt('請手動複製縮網址：', shortUrl);
        });
      } else {
        prompt('請手動複製縮網址：', shortUrl);
      }
    });
  }

  // --- 二維條碼點圖放大燈箱邏輯 ---
  const qrLightboxModal = document.getElementById('qrLightboxModal');
  const qrLightboxImg = document.getElementById('qrLightboxImg');
  const qrLightboxTitle = document.getElementById('qrLightboxTitle');
  const qrLightboxSub = document.getElementById('qrLightboxSub');
  const qrLightboxUrlBox = document.getElementById('qrLightboxUrlBox');
  const qrLightboxDownload = document.getElementById('qrLightboxDownload');
  const qrLightboxClose = document.getElementById('qrLightboxClose');
  const qrLightboxCloseBtn = document.getElementById('qrLightboxCloseBtn');
  const qrLightboxBackdrop = document.getElementById('qrLightboxBackdrop');
  const qrLightboxCopyUrl = document.getElementById('qrLightboxCopyUrl');

  let currentModalUrl = 'https://yaoshuchin.github.io/1151114-yuchi-elderly-digital/';

  function openQrLightbox(type) {
    if (!qrLightboxModal || !qrLightboxImg) return;
    if (type === 'tiny') {
      currentModalUrl = 'https://tinyurl.com/22qbsl3w';
      qrLightboxImg.src = 'qrcode_tinyurl.png';
      if (qrLightboxTitle) qrLightboxTitle.textContent = '極簡縮網址條碼放大';
      if (qrLightboxSub) qrLightboxSub.textContent = '推薦快速口頭宣導・手機相機對準條碼立即直達';
      if (qrLightboxUrlBox) qrLightboxUrlBox.textContent = currentModalUrl;
      if (qrLightboxDownload) {
        qrLightboxDownload.href = 'qrcode_tinyurl.png';
        qrLightboxDownload.download = '魚池數位中心_縮網址_QRCode_高清放大.png';
      }
    } else {
      currentModalUrl = 'https://yaoshuchin.github.io/1151114-yuchi-elderly-digital/';
      qrLightboxImg.src = 'qrcode.png';
      if (qrLightboxTitle) qrLightboxTitle.textContent = '官方完整網址條碼放大';
      if (qrLightboxSub) qrLightboxSub.textContent = '南投縣樂齡學習數位示範體驗場域（魚池）公開成果展示';
      if (qrLightboxUrlBox) qrLightboxUrlBox.textContent = currentModalUrl;
      if (qrLightboxDownload) {
        qrLightboxDownload.href = 'qrcode.png';
        qrLightboxDownload.download = '魚池數位中心_官方網頁_QRCode_高清放大.png';
      }
    }
    qrLightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeQrLightbox() {
    if (!qrLightboxModal) return;
    qrLightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  const qrFrameMain = document.getElementById('qrFrameMain');
  if (qrFrameMain) {
    qrFrameMain.addEventListener('click', () => openQrLightbox('main'));
  }
  const qrImgMain = document.getElementById('qrImgMain');
  if (qrImgMain && !qrFrameMain) {
    qrImgMain.addEventListener('click', () => openQrLightbox('main'));
  }

  const qrFrameTiny = document.getElementById('qrFrameTiny');
  if (qrFrameTiny) {
    qrFrameTiny.addEventListener('click', () => openQrLightbox('tiny'));
  }
  const qrImgTiny = document.getElementById('qrImgTiny');
  if (qrImgTiny && !qrFrameTiny) {
    qrImgTiny.addEventListener('click', () => openQrLightbox('tiny'));
  }

  if (qrLightboxClose) qrLightboxClose.addEventListener('click', closeQrLightbox);
  if (qrLightboxCloseBtn) qrLightboxCloseBtn.addEventListener('click', closeQrLightbox);
  if (qrLightboxBackdrop) qrLightboxBackdrop.addEventListener('click', closeQrLightbox);

  if (qrLightboxCopyUrl) {
    qrLightboxCopyUrl.addEventListener('click', () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(currentModalUrl).then(() => {
          showCopyToast('✅ 網址已成功複製到剪貼簿！');
        }).catch(() => {
          prompt('請手動複製網址：', currentModalUrl);
        });
      } else {
        prompt('請手動複製網址：', currentModalUrl);
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && qrLightboxModal && qrLightboxModal.classList.contains('active')) {
      closeQrLightbox();
    }
  });

  // ==========================================
  // 10. 初始化啟動
  // ==========================================
  buildThumbnailTrack();
  buildModeAGallery();
  renderQaList();
  renderSlide(1);

  const hash = window.location.hash.replace('#', '');
  if (hash === 'modeA' || hash === 'modeB' || hash === 'modeC' || hash === 'modeCenter' || hash === 'modeQR') {
    switchMode(hash);
  }
});
