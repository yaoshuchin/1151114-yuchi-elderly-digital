# 無障礙設計與多主題切換規格 (Accessibility & Themes)

## 1. 根字級縮放原則 (Root Font-Size Scaling)

### 陷阱與解決方案
**常見錯誤**：若在 CSS 中直接寫 `body { font-size: 19px; }`，所有使用 `rem` 單位（如 `padding: 1.5rem; font-size: 1.25rem;`）的子元素不會跟著放大，導致版面比例失衡。

**標準解法**：控制 `html` 根元素的 `font-size`：
```css
/* 預設中字體 */
html,
html[data-font="medium"] {
  font-size: 16px;
}

/* 大字體 (長者閱讀推薦) */
html[data-font="large"] {
  font-size: 19px;
}

/* 特大字體 (遠距投影/超高齡輔助) */
html[data-font="xlarge"] {
  font-size: 23px;
}
```

搭配 JavaScript 同步：
```javascript
function setFontSize(size) {
  document.documentElement.setAttribute('data-font', size);
  localStorage.setItem('app-font-size', size);
}
```

---

## 2. 四色布景主題架構

透過 CSS 變數定義四組色系：
```css
:root,
body[data-theme="light"] {
  --primary: #0f766e;
  --primary-dark: #115e59;
  --primary-light: #ccfbf1;
  --secondary: #0284c7;
  --bg-body: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
}

body[data-theme="dark"] {
  --bg-body: #0f172a;
  --bg-card: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: #334155;
  --primary: #14b8a6;
  --primary-light: #134e4a;
}

body[data-theme="green"] {
  --primary: #15803d;
  --primary-dark: #166534;
  --primary-light: #dcfce7;
  --bg-body: #f0fdf4;
  --bg-card: #ffffff;
  --text-main: #14532d;
  --text-muted: #166534;
  --border-color: #bbf7d0;
}

body[data-theme="blue"] {
  --primary: #1d4ed8;
  --primary-dark: #1e40af;
  --primary-light: #dbeafe;
  --bg-body: #eff6ff;
  --bg-card: #ffffff;
  --text-main: #1e3a8a;
  --text-muted: #1d4ed8;
  --border-color: #bfdbfe;
}
```

---

## 3. 無障礙點擊熱區與對比度要求
1. **按鈕最小高度**：所有互動按鈕高度需在 44px 以上，方便長輩手指點觸。
2. **對比度標準**：文字與背景色需符合 WCAG 2.1 AA 級標準（4.5:1 以上）。
3. **QR 碼放大燈箱**：確保圖片背景一律為純白底色，避免暗色模式反轉導致手機相機無法解碼條碼。
