# 簡報播放器與白板手繪引擎規範 (Presentation Deck & Canvas Engine)

## 1. 投影片容器與畫布重疊架構
採用「投影片底層圖片 + HTML5 Canvas 透明覆蓋層」架構：

```html
<div class="deck-viewport-box" id="deckViewportBox">
  <!-- 底層：1080P 投影片圖片 (object-fit: contain 保證等比無裁切) -->
  <img id="deckSlideImg" src="slides_img/slide_01.png" alt="投影片內容" class="deck-slide-img" />
  
  <!-- 頂層：透明手繪與標記畫布 -->
  <canvas id="annotationCanvas" class="annotation-canvas"></canvas>
  
  <!-- 正下方微型畫筆工具列 -->
  <div class="deck-drawing-toolbar" id="deckDrawingToolbar">
    ...
  </div>
</div>
```

---

## 2. 全螢幕正下方微型工具列 (Ultra-compact Bottom Toolbar)

### 2.1 微型化設計原則
- **尺寸極限緊湊**：按鈕高度僅 `22px`，圓點色塊僅 `10px`，隱藏冗長文字標籤，全面改採精緻 Emoji 圖示，整體體積縮減 60% 以上。
- **貼齊螢幕最底緣**：定位於 `bottom: 0.35rem`（約 5px），絕不侵入投影片的主要內容與數據區域。
- **半透明防遮蔽與懸停亮起**：
  - 平時演講專注時呈 **半透明（`opacity: 0.38`）**，底下的投影片文字一眼看透；
  - 滑鼠移入工具列上方時，瞬間平滑轉為 **`opacity: 1` 鮮明亮起**。

```css
:fullscreen .deck-drawing-toolbar,
.deck-viewport-box.is-fullscreen .deck-drawing-toolbar {
  display: flex !important;
  position: fixed !important;
  bottom: 0.35rem !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  z-index: 1000000 !important;
  background: rgba(15, 23, 42, 0.78) !important;
  backdrop-filter: blur(10px) !important;
  padding: 0.15rem 0.45rem !important;
  border-radius: 999px !important;
  opacity: 0.38;
  gap: 0.2rem !important;
}

:fullscreen .deck-drawing-toolbar:hover,
.deck-viewport-box.is-fullscreen .deck-drawing-toolbar:hover {
  opacity: 1 !important;
}
```

---

## 3. 多重便捷關閉畫筆模式（實體按鈕 + 鍵盤快捷鍵）

為了避免畫筆工具列遮擋簡報，提供多種秒級關閉與開啟手段：

1. **實體按鈕關閉**：
   - 工具列內配置紅底 **`[✕ 關閉]`** 按鈕，點擊後工具列與畫布立即隱藏，游標恢復為一般箭頭。
2. **鍵盤快捷鍵關閉（比照專業簡報器）**：
   - 按 **`Esc` 鍵**：優先**關閉畫筆模式**（若畫筆已關閉，再按一次 `Esc` 退出全螢幕）。
   - 按 **`D` 鍵**（Draw）或 **`P` 鍵**（Pen）：隨時一鍵**開關/切換畫筆模式**。
3. **微型喚醒膠囊**：
   - 當畫筆模式關閉後，螢幕底緣僅保留極度透明且微小的 **`[✏️ 畫筆]`** 喚醒鈕，隨時一鍵重新開啟。

---

## 4. 畫布自適應同步尺寸 (Canvas Resizing)
每當投影片換頁、視窗縮放或進入/退出全螢幕時，必須動態同步 Canvas 的寬高：

```javascript
function resizeAnnotationCanvas() {
  const img = document.getElementById('deckSlideImg');
  const canvas = document.getElementById('annotationCanvas');
  const viewport = document.getElementById('deckViewportBox');
  if (!img || !canvas || !viewport) return;
  
  const rect = viewport.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}
```

---

## 5. 繪圖動作堆疊與復原 (Undo Stack)
- 支援自由手寫筆（Pen）、半透明螢光筆（Highlighter）、直線（Line）、指向箭頭（Arrow）、矩形（Rect）、圓形（Circle）。
- 支援紅、黃、綠、藍、白 5 種常用標記色與 3 段粗細。
- 支援局部橡皮擦、復原上一筆（Undo Stack）與一鍵清空畫布。
- 支援「📐 視窗最適」（`max-height: calc(100vh - 230px)`）與「⛶ 全螢幕」切換。
