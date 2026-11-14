# 簡報模式與白板畫筆引擎實作規範

## 1. 投影片容器與畫布重疊架構

為了讓現場簡報者在展示投影片時能自由圈選、標記重點，採用「投影片圖片層 + HTML5 Canvas 透明覆蓋層」架構：

```html
<div class="slide-display-wrapper" id="slideDisplayWrapper">
  <!-- 底層：投影片圖片 -->
  <img id="currentSlideImg" src="slides_img/slide_01.png" alt="投影片內容" />
  
  <!-- 頂層：透明標記畫布 -->
  <canvas id="slideAnnotationCanvas"></canvas>
</div>
```

---

## 2. 畫布自適應同步尺寸 (Canvas Resizing)

每當投影片換頁、視窗縮放或全螢幕切換時，必須動態同步 Canvas 的寬高與縮放座標：

```javascript
function resizeCanvas() {
  const img = document.getElementById('currentSlideImg');
  const canvas = document.getElementById('slideAnnotationCanvas');
  if (!img || !canvas) return;
  
  // 以圖片渲染的實際尺寸為畫布像素標準
  const rect = img.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  
  redrawAllActions();
}
```

---

## 3. 繪圖動作堆疊與復原 (Undo Stack)

為了支援復原（Undo）與幾何預覽（直線、箭頭、矩形、圓形），採用 Action Stack 模式：
- 每一筆畫或幾何形狀視為一個物件：
  ```javascript
  {
    type: 'pen' | 'highlighter' | 'line' | 'arrow' | 'rect' | 'circle',
    color: '#ef4444',
    size: 4,
    points: [{x, y}, ...], // 用於自由筆劃
    start: {x, y}, end: {x, y} // 用於幾何形狀
  }
  ```
- 換頁時可選擇保存每頁獨立筆記，或提供清除畫布功能。
- 支援「📐 視窗最適」（`max-height: 82vh`、保持長寬比）與「⛶ 全螢幕」切換（`document.fullscreenElement`）。
