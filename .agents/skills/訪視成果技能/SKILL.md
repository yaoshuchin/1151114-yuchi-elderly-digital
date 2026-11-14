---
name: 訪視成果技能
description: >-
  通用型簡報網頁化與訪視成果展示系統技能 (Universal Inspection & Presentation Showcase Skill)。
  適用於將任何 PPTX 簡報、訪視評鑑資料、專案結案報告、活動相片與問答考題，快速轉化為標準
  4+1 互動架構之現代化響應式單頁成果展示網頁 (SPA)。內建素材自動化萃取、樂齡無障礙字級縮放、
  四色布景、Web Audio 純前端水晶音樂、全螢幕微型正下方畫筆白板工具列、QR 碼燈箱放大與 GitHub Pages 零伺服器部署。
---

# 通用訪視成果技能 (Universal Inspection & Presentation Showcase Skill)

本技能提供一套**通用、標準化、即插即用**的「簡報網頁化與成果展示系統」建構作業流程 (SOP)。無論是政府評鑑、教育輔導、社造結案、企業提案或學術研究，只要手邊有 **PPTX 簡報檔**、**照片** 與 **答客問資料**，皆可套用本技能在數十分鐘內轉化為高規格互動展示網站。

---

## 🏛️ 一、「4+1」標準通用架構

任何簡報或專案成果皆可映射至此標準架構：

```
通用成果展示系統 (Universal Showcase System)
│
├── 🏛️ 1. 場域/專案中心 (Project Hub)
│   ├── 地理空間與定位導覽 (可配置 Google Maps、地址、交通路線)
│   ├── 專案背景、主辦/執行單位與推動宗旨
│   ├── 外展據點/服務拓點分佈網格 (可配置 N 處據點)
│   └── 多媒體宣導紀錄 (支援 YouTube 官方影音嵌入與在地新聞卡片)
│
├── 🌟 2. A. 成果網頁 (Narrative Results & KPIs)
│   ├── 核心 KPI 數字儀表板 (如達成率、滿意度、培育人數、量化績效)
│   ├── 四大關鍵面向深度卡片 (可依簡報章節自由定義 3~6 個面向)
│   ├── 智慧雙向連動鈕：每個面向卡片均配備「查看簡報 P.X ➔」一鍵直達對應頁
│   └── 實體活動照片對照輪播相簿 (提取自 PPTX 內嵌高畫質圖片)
│
├── 🎯 3. B. 問答模式 (Q&A / FAQ Mode)
│   ├── 委員常問考題或常見疑問 (FAQ 手風琴平滑折疊卡片)
│   ├── 核心答覆關鍵詞高亮醒目標記 (綠底/螢光底重點速覽)
│   └── 每一題皆附帶「查看簡報對應頁 ➔」秒速切換投影片
│
├── 📽️ 4. C. 簡報模式 (Slide Presentation Deck)
│   ├── N 頁高解析度 1080P 投影片巡演 (免失真、免滾動自適應)
│   ├── 雙展示模式：📐 視窗最適 (Fit Viewport) / ⛶ 全螢幕沉浸投影
│   ├── 全螢幕正下方微型畫筆工具列 (Ultra-compact Bottom Docked Toolbar)：
│   │   ├── 尺寸極致微型：按鈕高度 22px，貼齊螢幕最底緣 5px，絕不遮擋投影片內容
│   │   ├── 平時半透明 (opacity: 0.38)，滑鼠懸停時自動亮起 (opacity: 1)
│   │   ├── 實體按鈕關閉：配置紅底 [✕ 關閉] 按鈕，關閉後留有微型 [✏️ 畫筆] 喚醒鈕
│   │   └── 鍵盤快捷鍵關閉：支援按 Esc 鍵、D 鍵 (Draw) 或 P 鍵 (Pen) 瞬間開關畫筆
│   ├── HTML5 Canvas 螢幕白板標記工具：
│   │   ├── 筆刷：自由手寫筆 (Pen)、半透明螢光標記筆 (Highlighter)
│   │   ├── 幾何：直線 (Line)、指向箭頭 (Arrow)、矩形框 (Rect)、圓形 (Circle)
│   │   ├── 色彩與粗細：5 色常用標記調色盤、3 段粗細切換
│   │   └── 操作：局部橡皮擦、復原上一筆 (Undo Stack)、一鍵清空畫布
│   └── 導航輔助：底部縮圖滑軌抽屜、隨身講稿備忘錄 (快捷鍵 N)、自動輪播
│
└── 📱 5. QR 分享專區 (QR & Short URL Sharing)
    ├── 官方完整公開網址條碼 + 極簡縮網址條碼 (如 TinyURL)
    ├── 一鍵複製網址到剪貼簿 (彈出綠色 Toast 成功提示)
    └── 🔍 點圖高畫質燈箱放大 (Lightbox Modal 330×330px)：
        ├── 方便會場中遠距離投影螢幕手機秒辨識掃碼
        └── 支援 Esc 鍵、關閉鈕或點擊背景隨時退出
```

---

## 🎨 二、通用無障礙與主題規範

1. **階層式頂部佈局 (Top-Right 工具列)**：
   - **第一行**：左側為專案識別 Logo 與計畫全銜，**網頁右上方空白處**靠齊配置「字體縮放」、「布景切換」與「背景音樂播放器」。
   - **第二行**：五大核心功能分頁（中心、成果、問答、簡報、QR）獨立成行，空間充裕、字體清晰、點選不擁擠。
2. **根字級全局動態縮放 (Root Font-Size Scaling)**：
   - 透過控制 `html[data-font]` 動態調整根字級，連動全站所有 `rem` 排版元素：
     - **中（16px）**：標準公務檢視。
     - **大（19px）**：長者與行動裝置閱讀推薦。
     - **特大（23px）**：遠距投影與超高齡長者輔助。
3. **四色情境色彩主題 (Theme Switching)**：
   - 透過 `body[data-theme]` 與 CSS 變數即時換色：
     - **風格一（預設主題色）**：呼應計畫屬性（如茶園綠、生態綠）。
     - **風格二（次要主題色）**：如水岸藍、科技藍。
     - **風格三（淺色系）**：明亮清爽公務簡報質感。
     - **風格四（深色系）**：高對比夜間抗疲勞與投影防眩光。
4. **原生 Web Audio API 水晶音樂合成器**：
   - 純 JavaScript 原生合成正弦波與泛音鐘音，零版權問題、無外部 MP3 載入延遲。
   - 內建 4 首不同調性水晶樂曲（悠揚、輕快、溫暖、沉靜）與靜音控制。

---

## 📋 三、通用 5 步建構實施 SOP (Universal 5-Step Runbook)

### 步驟 1：素材抽取與數據標準化
將任何新的簡報檔命名為 `presentation.pptx` 置於專案目錄：
1. 執行 `python scripts/extract_presentation_assets.py presentation.pptx`：
   - 自動將每一頁投影片匯出為 `slides_img/slide_01.png` ~ `slide_NN.png`。
   - 自動提取簡報內嵌的所有高畫質實境相片至 `doc_media/`。
2. 建立或更新 `slides_data.js`：
   ```javascript
   window.SLIDES_DATA = [
     { slide_num: 1, title: "簡報標題", category: "分項分類", image: "slides_img/slide_01.png", notes: "講者備忘講稿" },
     // ... 依序填入各頁
   ];
   ```

### 步驟 2：配置頁面內容與 KPI 指標
1. 在 `index.html` 的 `header` 設定專案標題與主辦單位名稱。
2. 在 `🏛️ 場域中心` 填入實體地址、聯絡電話、Google Maps 經緯度及 YouTube 宣導影片 ID。
3. 在 `🌟 A. 成果網頁` 填入 KPI 數據卡片與四大面向重點，每張卡片標註 `data-slide="N"` 對應頁碼。
4. 在 `🎯 B. 問答模式` 填入評鑑委員常見提問與重點回答，設置 `data-slide="N"` 直達按鈕。

### 步驟 3：產製雙軌二維條碼
執行 `python scripts/generate_qrcodes_api.py <公開網址> <輸出路徑>`：
1. 產製官方公開網址條碼 `qrcode.png` (500×500)。
2. 申請極簡縮網址（如 TinyURL），產製 `qrcode_tinyurl.png` (500×500)。

### 步驟 4：套用全螢幕微型畫筆與無障礙樣式
1. 引入標準 `style.css` 與 `app.js`。
2. 確認全螢幕模式下具備：
   - 正下方微型工具列（高度 22px、貼底 5px、平時半透明 0.38）。
   - 實體 `[✕ 關閉]` 按鍵與快捷鍵 `Esc` / `D` / `P` 開關。
   - 條碼點圖燈箱高解析放大。

### 步驟 5：零伺服器一鍵發布 (GitHub Pages)
1. 提交至 Git 倉庫並推播至 GitHub `main` 分支。
2. 在 Repository 設定中啟用 GitHub Pages（Branch: `main` / root）。
3. 部署完成後即可獲得全球 CDN 免費公開訪問網址，免密碼、免裝 APP 隨開隨讀。

---

## 🛠️ 四、通用工具庫說明 (scripts/)
- [extract_presentation_assets.py](./scripts/extract_presentation_assets.py)：通用 PPTX 投影片與多媒體圖片抽取腳本。
- [generate_qrcodes_api.py](./scripts/generate_qrcodes_api.py)：通用雙軌高解析 QR 碼生成工具。
- [crystal_synth_engine.js](./scripts/crystal_synth_engine.js)：通用純前端 Web Audio 水晶音樂合成器模組。
