// ========================================================
// 南投縣樂齡學習數位示範體驗場域（魚池）- 核心應用邏輯
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  // 核心狀態
  const state = {
    currentMode: 'modeA',       // 'modeA' | 'modeB' | 'modeC'
    qaSubMode: 'list',          // 'list' | 'drill'
    currentSlideIndex: 1,       // 1 ~ 25
    totalSlides: window.SLIDES_DATA ? window.SLIDES_DATA.length : 25,
    autoPlayTimer: null,
    isAutoPlaying: false,
    fontSizeLevel: 0,           // 0: normal, 1: lg, 2: xl
    activeQaCategory: 'all',
    qaSearchQuery: '',
    currentDrillIndex: 0,
    isDrillRevealed: false
  };

  // DOM 元素快取
  const elements = {
    modeBtns: document.querySelectorAll('.mode-tab-btn'),
    views: {
      modeA: document.getElementById('view-modeA'),
      modeB: document.getElementById('view-modeB'),
      modeC: document.getElementById('view-modeC')
    },
    // 字級按鈕
    fontToggleBtn: document.getElementById('fontToggleBtn'),
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
    btnDrillNext: document.getElementById('btnDrillNext')
  };

  // ==========================================
  // 模式切換邏輯 (A / B / C)
  // ==========================================
  function switchMode(modeId) {
    state.currentMode = modeId;

    // 更新導覽列按鈕
    elements.modeBtns.forEach(btn => {
      if (btn.dataset.mode === modeId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 切換視圖顯隱
    Object.keys(elements.views).forEach(key => {
      if (key === modeId) {
        elements.views[key].classList.add('active');
      } else {
        elements.views[key].classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 若切換到 C 簡報模式，更新該頁面
    if (modeId === 'modeC') {
      renderSlide(state.currentSlideIndex);
    }
  }

  // 註冊頂部導覽切換點擊
  elements.modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchMode(btn.dataset.mode);
    });
  });

  // 點擊 Logo 回到 A 成果網頁
  const brandLogo = document.getElementById('brandLogoNav');
  if (brandLogo) {
    brandLogo.addEventListener('click', () => switchMode('modeA'));
  }

  // ==========================================
  // 友善樂齡字級切換
  // ==========================================
  if (elements.fontToggleBtn) {
    elements.fontToggleBtn.addEventListener('click', () => {
      state.fontSizeLevel = (state.fontSizeLevel + 1) % 3;
      document.body.classList.remove('font-lg', 'font-xl');
      if (state.fontSizeLevel === 1) {
        document.body.classList.add('font-lg');
        elements.fontToggleBtn.innerHTML = '🔍 字體：大';
      } else if (state.fontSizeLevel === 2) {
        document.body.classList.add('font-xl');
        elements.fontToggleBtn.innerHTML = '🔍 字體：特大';
      } else {
        elements.fontToggleBtn.innerHTML = '🔍 字體：標準';
      }
    });
  }

  // ==========================================
  // C. 簡報模式核心邏輯
  // ==========================================
  function renderSlide(index) {
    if (index < 1) index = 1;
    if (index > state.totalSlides) index = state.totalSlides;
    state.currentSlideIndex = index;

    const slideData = window.SLIDES_DATA[index - 1];
    if (!slideData) return;

    // 投影片影像
    elements.deckSlideImg.src = slideData.image;
    elements.deckSlideImg.alt = slideData.title;

    // 資訊徽章
    elements.deckSlideBadge.textContent = `${index} / ${state.totalSlides}`;
    elements.deckCategoryBadge.textContent = slideData.category;
    elements.deckSlideTitle.textContent = slideData.title;

    // 跳頁輸入框
    if (elements.deckJumpInput) {
      elements.deckJumpInput.value = index;
    }

    // 講稿筆記內容
    if (slideData.notes) {
      elements.deckNotesContent.innerHTML = slideData.notes;
    } else {
      // 若無獨立備忘錄，顯示文字大綱重點
      const outline = slideData.texts.length > 0 
        ? slideData.texts.join('\n• ') 
        : '（此頁為視覺展示投影片）';
      elements.deckNotesContent.innerHTML = `<strong>【本頁提報重點】</strong>\n• ${outline}`;
    }

    // 更新縮圖選中樣式
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
      renderSlide(1); // 自動循環
    }
  }

  function prevSlide() {
    if (state.currentSlideIndex > 1) {
      renderSlide(state.currentSlideIndex - 1);
    }
  }

  // 註冊簡報按鈕事件
  if (elements.deckNextBtn) elements.deckNextBtn.addEventListener('click', nextSlide);
  if (elements.deckPrevBtn) elements.deckPrevBtn.addEventListener('click', prevSlide);

  const prevArrow = document.getElementById('arrowPrev');
  const nextArrow = document.getElementById('arrowNext');
  if (prevArrow) prevArrow.addEventListener('click', prevSlide);
  if (nextArrow) nextArrow.addEventListener('click', nextSlide);

  // 跳頁輸入框
  if (elements.deckJumpInput) {
    elements.deckJumpInput.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) renderSlide(val);
    });
  }

  // 講稿開關
  if (elements.toggleNotesBtn) {
    elements.toggleNotesBtn.addEventListener('click', () => {
      elements.deckNotesPanel.classList.toggle('active');
      elements.toggleNotesBtn.classList.toggle('active');
    });
  }

  // 縮圖抽屜開關
  if (elements.toggleThumbsBtn) {
    elements.toggleThumbsBtn.addEventListener('click', () => {
      elements.thumbnailDrawer.classList.toggle('active');
      elements.toggleThumbsBtn.classList.toggle('active');
    });
  }

  // 自動播放開關
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

  // 全螢幕切換
  if (elements.deckFullscreenBtn) {
    elements.deckFullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        elements.viewportBox.requestFullscreen().catch(err => {
          console.warn('Fullscreen error:', err);
        });
      } else {
        document.exitFullscreen();
      }
    });
  }

  // 鍵盤導覽監聽
  window.addEventListener('keydown', (e) => {
    // 僅在簡報模式且無輸入框焦點時觸發
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

  // 產生簡報模式下方縮圖軌道
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

  // 公開跳轉簡報函數（從 A 成果 或 B 問答 點擊跳頁）
  window.jumpToSlide = function(slideNum) {
    switchMode('modeC');
    renderSlide(slideNum);
  };

  // ==========================================
  // A. 成果網頁 (Gallery & Quick Jump)
  // ==========================================
  function buildModeAGallery() {
    if (!elements.galleryGrid || !window.SLIDES_DATA) return;
    elements.galleryGrid.innerHTML = '';

    // 選取代表性的成果頁面展示在 A 區塊
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

  // 註冊 A 區塊各大面向卡片的跳轉按鈕
  document.querySelectorAll('.jump-slide-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const slideNum = parseInt(btn.dataset.slide, 10);
      if (!isNaN(slideNum)) {
        window.jumpToSlide(slideNum);
      }
    });
  });

  // ==========================================
  // B. 問答模式 (Q&A List & Drill Mode)
  // ==========================================
  function renderQaList() {
    if (!elements.qaListContainer || !window.QA_DATA) return;
    elements.qaListContainer.innerHTML = '';

    // 篩選題目
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
        <div style="text-align: center; padding: 3rem; color: var(--text-muted); background: #fff; border-radius: var(--radius-lg);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
          <div>查無符合條件之問答題目，請嘗試更換分類或關鍵字</div>
        </div>
      `;
      return;
    }

    filtered.forEach((qa, idx) => {
      const card = document.createElement('div');
      card.className = 'qa-item-card';
      if (idx === 0) card.classList.add('open'); // 預設展開第一題

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

      // 展開/收合點擊
      const qRow = card.querySelector('.qa-item-question-row');
      qRow.addEventListener('click', () => {
        card.classList.toggle('open');
      });

      elements.qaListContainer.appendChild(card);
    });
  }

  // 模擬考閃卡邏輯
  function renderDrillCard() {
    if (!window.QA_DATA || window.QA_DATA.length === 0) return;
    const qa = window.QA_DATA[state.currentDrillIndex];
    if (!qa) return;

    state.isDrillRevealed = false;
    elements.drillRevealBox.classList.remove('revealed');
    elements.btnRevealAnswer.textContent = '👀 揭曉作答要點與佐證';

    // 更新進度與標籤
    elements.drillBadge.textContent = `${qa.category}・${qa.badge}`;
    elements.drillCounter.textContent = `${state.currentDrillIndex + 1} / ${window.QA_DATA.length}`;
    elements.drillQuestion.textContent = `Q${qa.id}. ${qa.question}`;

    const progressPct = ((state.currentDrillIndex + 1) / window.QA_DATA.length) * 100;
    elements.drillProgressFill.style.width = `${progressPct}%`;

    // 填寫回答內容
    elements.drillAnswerText.textContent = qa.answer;
    elements.drillPointsUl.innerHTML = qa.points.map(p => `<li>${p}</li>`).join('');
    elements.drillRelatedSlides.innerHTML = qa.related_slides.map(s => 
      `<button class="slide-link-pill" onclick="window.jumpToSlide(${s})">查看簡報 P.${s}</button>`
    ).join(' ');
  }

  // 揭曉答案點擊
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

  // 問答子模式切換 (列表 vs 閃卡演練)
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

  // 分類篩選標籤
  elements.catFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.catFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeQaCategory = btn.dataset.cat;
      renderQaList();
    });
  });

  // 搜尋框即時監聽
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

  // 支援 URL Hash 路由 (如 #modeB, #modeC)
  const hash = window.location.hash.replace('#', '');
  if (hash === 'modeB' || hash === 'modeC' || hash === 'modeA') {
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
