# 通用簡報成果展示系統：配置指南與模板規範

本文件提供將任何全新專案簡報（PPTX / PDF）套用至「通用訪視成果展示系統」的快速填表指南。

---

## 1. 核心設定參數表 (Configuration Spec)

在實作新專案展示網頁時，僅需替換下列標準欄位：

| 參數名稱 | 說明 | 範例 |
| :--- | :--- | :--- |
| `PROJECT_NAME` | 計畫或專案全銜 | 「教育部南投縣樂齡學習數位示範體驗場域」或「115年度社區發展成果展示」 |
| `PROJECT_SUB` | 副標題或執行單位 | 「魚池數位機會中心 (DOC)」或「某某社區發展協會」 |
| `TOTAL_SLIDES` | 簡報總頁數 | `25`（可為 10 到 100 頁任意數字） |
| `PRIMARY_COLOR` | 品牌/在地主色 | `#0f766e`（茶園綠）、`#1d4ed8`（科技藍）、`#e11d48`（熱情紅） |
| `MAP_COORDS` | 實體場域經緯度或地址 | 嵌入 Google Maps 的 `iframe` 連結 |
| `MEDIA_YOUTUBE` | YouTube 相關宣導影片 ID | `fVBTS-hqiIA` 等（可配置 1~4 部） |
| `PUBLIC_URL` | 線上公開部署網址 | `https://<username>.github.io/<repo>/` |
| `SHORT_URL` | 極簡宣傳縮網址 | `https://tinyurl.com/<custom>` |

---

## 2. 簡報數據檔結構 (`slides_data.js`)

每份簡報僅需產製一份陣列數據：

```javascript
window.SLIDES_DATA = [
  {
    slide_num: 1,
    title: "封面與計畫介紹",
    category: "開場簡報",
    image: "slides_img/slide_01.png",
    notes: "講者重點備忘：說明本計畫緣起、訪視宗旨與核心成員。"
  },
  {
    slide_num: 2,
    title: "年度亮點成果總覽",
    category: "整體成效",
    image: "slides_img/slide_02.png",
    notes: "重點強調整體滿意度與學員回饋數據。"
  }
  // ... 依此類推
];
```

---

## 3. 面向卡片與問答連動規格

在成果網頁與問答卡片中，只要為按鈕添加 `data-slide="頁碼"` 屬性：

```html
<!-- 成果網頁中跳轉至空間設備簡報 P.7 -->
<button class="jump-slide-btn" data-slide="7">查看空間簡報 P.7 ➔</button>

<!-- 考題解答中跳轉至幫手激勵制度 P.12 -->
<button class="jump-slide-btn" data-slide="12">查看簡報對應說明 P.12 ➔</button>
```

JavaScript 會自動捕捉所有帶有 `data-slide` 的元素，並在點選時以零延遲無縫切換到 `modeC` 簡報模式定位該頁投影片！
