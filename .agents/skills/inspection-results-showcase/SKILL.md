---
name: inspection-results-showcase
description: >-
  Use this skill whenever the user asks to build, transform, or maintain a comprehensive
  inspection results showcase website (訪視成果網頁 / 輔導成果展示系統) from presentations (PPTX),
  photos, documents, or survey data. Implements a battle-tested 4+1 interactive architecture:
  Site Center (場域地圖與影音), Narrative Results (A成果網頁), Q&A Mode (B問答模式),
  Slide Presentation Mode with interactive canvas drawing (C簡報模式), and QR Code & Short URL
  with Lightbox Zoom (QR分享專區). Enforces elderly-friendly accessibility, font scaling,
  theme switching, Web Audio crystal background music, and zero-server GitHub Pages deployment.
---

# 訪視成果技能 (Inspection Results Showcase Skill)

本技能總結自「教育部南投縣樂齡學習數位示範體驗場域訪視輔導」完整實戰架構，提供將政府/非營利/教育場域之**簡報檔 (PPTX)、照片、影片、指標數據與訪視答客問**，一站式高規格轉化為**現代化互動成果展示系統**的標準作業流程 (SOP)。

---

## 核心設計理念與架構標準

成果展示系統旨在同時滿足**「現場訪視委員評鑑」**、**「主辦長官快速巡視」**與**「樂齡長者/社區大眾無障礙瀏覽」**三方需求，採用標準 **4+1 核心模組架構**：

```
訪視成果展示系統
├── 🏛️ 場域中心：地理位置、Google Maps、街景導引、交通、在地影音、新聞紀錄
├── 🌟 A. 成果網頁：敘事型成果展現、KPI成效卡片、四大面向指標、圖片輪播對比
├── 🎯 B. 問答模式：訪視審查 Q&A 手風琴摺疊卡、重點標記、一鍵跳轉簡報對應頁
├── 📽️ C. 簡報模式：全螢幕/視窗最適、高解析簡報切換、縮圖導航軸、螢幕白板手繪工具
└── 📱 QR 分享專區：公開展示二維條碼、極簡縮網址、一鍵複製剪貼簿、點圖燈箱放大檢視
```

---

## 實作標準作業流程 (5-Step Runbook)

### 步驟 1：投影片與多媒體素材自動化抽取
1. 提取 PPTX 投影片為高解析 PNG 圖檔（透過 `win32com` PowerPoint Export 或 `pypdfium2`）：
   - 輸出至 `slides_img/slide_01.png` ~ `slide_NN.png`。
   - 擷取每一頁的標題與備忘文字，生成 `slides_data.js` 供簡報導航與問答對應使用。
2. 提取簡報內嵌之高畫質實境活動照片至 `doc_media/`：
   - 執行輔助腳本 [scripts/extract_presentation_assets.py](./scripts/extract_presentation_assets.py)。
3. 合法嵌入地方新聞報導與 YouTube 官方宣導影音。

### 步驟 2：視覺風格與樂齡無障礙系統 (Accessibility)
1. **字體縮放（中 / 大 / 特大）**：
   - 必須透過根元素 `html[data-font="medium|large|xlarge"]` 動態縮放根字級（16px / 19px / 23px），讓全站所有使用 `rem` 的標題、段落、卡片均等放大。
2. **四色情境主題切換**：
   - `body[data-theme="light|dark|green|blue"]`，利用 CSS 變數定義高對比配色（預設綠色代表在地山林與生態、藍色代表科技與大河、淺色明亮清爽、深色高對比抗疲勞）。
3. **樂齡背景音樂合成系統 (Crystal Music)**：
   - 採用原生 Web Audio API 合成水晶鋼琴音效（參見 [scripts/crystal_synth_engine.js](./scripts/crystal_synth_engine.js)）。
   - 內建 4 首不同調性、速度、音階之水晶旋律（例如：清晨微風、山林漫步、陽光茶園、寧靜星空），並提供靜音開關。

### 步驟 3：四大功能分頁建構
1. **🏛️ 場域中心**：
   - 內嵌響應式 Google Maps 與全景照片。
   - 條列外展拓點分班（如長照站、活動中心、共學據點）。
   - 匯聚官方宣導影片與在地新聞報導。
2. **🌟 A. 成果網頁**：
   - 視覺化關鍵績效指標（如滿意度 4.94、課程小時達成率 87%、幫手人數 25 位）。
   - 四大面向卡片化呈現（空間設備、人力制度、課程教學、推廣策略）。
   - 每一面向皆配備「查看簡報 P.X ➔」快速導航鈕。
3. **🎯 B. 問答模式**：
   - 彙整委員最關注之核心提問（空間規範、幫手激勵、在地特色、永續機制）。
   - 摺疊式手風琴互動，預設展開第一道，點選平滑開合。
4. **📽️ C. 簡報模式（核心亮點）**：
   - 提供「📐 視窗最適」與「⛶ 全螢幕」雙展示模式。
   - 內建 HTML5 Canvas 螢幕畫筆工具列：
     - 自由畫筆（Pen）、螢光標記筆（Highlighter、半透明）
     - 基本幾何（直線、箭頭 Arrow、矩形 Rectangle、圓形 Circle）
     - 橡皮擦、復原（Undo）、清除畫布（Clear）
     - 4 色畫筆切換（紅、金黃、亮綠、湖藍）與 3 段粗細選擇。
   - 支援鍵盤左右方向鍵、空白鍵、PageUp/PageDown 切換。

### 步驟 4：QR Code、縮網址與點圖放大燈箱
1. 使用 [scripts/generate_qrcodes_api.py](./scripts/generate_qrcodes_api.py) 產製高解析度條碼：
   - 完整公開網址條碼 `qrcode.png`
   - 極簡縮網址條碼 `qrcode_tinyurl.png`（如 TinyURL / bit.ly）
2. 在 `📱 QR` 專區配置：
   - 一鍵複製完整網址與縮網址（自動呼叫 `navigator.clipboard` 並跳出綠色 Toast 提示）。
   - **點擊放大燈箱 (Lightbox Modal)**：
     - 條碼框附帶 `🔍 點擊放大條碼` 徽章與放大手勢。
     - 點擊後開啟 330×330px 放大條碼、深色毛玻璃背景，供長官與委員在會場直接用手機對螢幕掃描。
     - 支援 Esc、關閉鈕與點擊背景關閉。

### 步驟 5：零伺服器部署與維運
1. 將靜態資源提交至 GitHub 專案庫。
2. 開啟 GitHub Pages（Source: Deploy from a branch -> `main` / root）。
3. 確保無須密碼、免安裝 APP、手機平板與投影幕跨裝置皆可暢通瀏覽。

---

## 參考文件與腳本指南
- [架構設計詳細規格書](./references/framework_architecture.md)
- [無障礙與視覺主題規格](./references/accessibility_and_themes.md)
- [簡報白板標記引擎實作規範](./references/interactive_presentation_canvas.md)
