# 🐕 BorderCollie - 專案管理甘特圖

BorderCollie 是一個現代化、輕量級的專案管理與人力資源甘特圖工具。它專為快速編輯與視覺化設計，支援純文字格式定義專案，並即時轉換為互動式甘特圖。

![Dark Mode](assets/Screenshot_Dark.png)

## ✨ 特色功能

-   **雙視圖切換**：
    -   **專案甘特圖 (Project Gantt)**：以專案為核心，展示各階段時程與相依性。
    -   **人力甘特圖 (Person Gantt)**：以人員為核心，視覺化每位成員在不同專案間的投入狀況與工作負載。
-   **雙顯示模式**：
    -   **標準區塊 (Block)**：傳統甘特圖條塊。
    -   **箭頭樣式 (Arrow)**：專案流程視覺化，以箭頭表現階段順序，清楚呈現階段間的接續關係。
-   **隱藏/顯示功能**：可隱藏特定專案或人員列，頂部 chip 列表可快速恢復。
-   **專案 Pending 功能**：擱置中的專案保留於編輯區，但自動從甘特圖與人力計算中移除。
-   **雙編輯模式**：
    -   **純文字編輯 (Text-to-Gantt)**：簡單直覺的純文字語法定義專案。
    -   **表單編輯 (Table Editor)**：結構化表格介面，適合不熟悉純文字語法的使用者。
-   **精美現代 UI**：Glassmorphism 設計、今日標記、年度時間軸、動態互動效果、Dark / Light 主題切換。
-   **智慧排程與負載計算**：自動時間接續、人力負載警示（紅/綠燈號）、智慧行分配。
-   **多專案工作區**：LocalStorage 儲存、Frontmatter 元資料、分享連結衝突處理。
-   **資料載入**：支援 GitHub Gist (`?gist=`)、外部 URL (`?source=`)、LZ-String 分享連結 (`?data=`)。
-   **匯出功能**：PNG / SVG / PowerPoint / Excel。
-   **[Excel VBA 離線版](excel/README.md)**：獨立 Excel 工具，支援與網頁版雙向匯入/匯出。

![Light Mode](assets/Screenshot_Light.png)
![Person Gantt](assets/Screenshot_Person.png)

## 🚀 快速開始

**線上體驗：https://kywk.github.io/border-collie/**

本地安裝與部署請參考 **[INSTALL.md](INSTALL.md)**。

## 📝 純文字編輯規格

```text
name: AI 專案規劃 2025
description: 年度 AI 專案時程與人力配置
---
AI OCR:
- BA, 2025-10-01, 2025-11-30: Andy 0.3, Ben 0.8, Cat 0.5
- SA, --, 2026-02: Andy 0.3, Danny 0.6, Elsa 0.2
- Dev, 2026-03, 2026-05: Andy 0.1, Elsa 0.6, Frank 0.6

Staff Portal:
- BA/SA, 2026-01, 2026-06: Andy 0.3, Monica 0.7, Amber 0.4
- SD/Dev, 2026-03, 2026-09: Andy 0.2, Amber 0.7, Kevin 0.7
```

| 元素 | 格式 | 說明 |
|------|------|------|
| Frontmatter | `name: ...` + `---` | 選用，定義工作區名稱、描述等元資料 |
| 專案宣告 | `專案名稱:` | 冒號結尾；加 `, pending` 可擱置 |
| 階段定義 | `- 名稱, 開始, 結束: 人員` | 日期支援 `YYYY-MM` 或 `YYYY-MM-DD`；`--` 接續前一階段 |
| 人員指派 | `人名 比例` | 多人以 `,` 分隔，比例 `0.1` ~ `1.0` |

## 📦 外部專案整合

BorderCollie 的元件和共用模組可被外部專案以 submodule 方式引用（如 [Sheltie](https://github.com/kywk/sheltie)）。

共用模組位於 `src/shared/`，提供型別定義、解析器、Vue composables 和 CSS 變數。

- 整合指南與範例：**[docs/integration-guide.md](docs/integration-guide.md)**
- 開發規範：**[CONTRIBUTING.md](CONTRIBUTING.md)**

## 🛠️ 技術架構

-   **Frontend**: Vue 3 + TypeScript + Vite + Pinia
-   **Styling**: Vanilla CSS (Variables & Scoped CSS)
-   **Utils**: lz-string, html-to-image, pptxgenjs, exceljs, @vueuse/core, lodash-es

## 📚 文件索引

| 文件 | 說明 |
|------|------|
| [INSTALL.md](INSTALL.md) | 安裝與部署 |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 共用元件開發規範 |
| [docs/integration-guide.md](docs/integration-guide.md) | 外部專案整合指南與範例 |
| [docs/README.md](docs/README.md) | 設計文件目錄總覽 |
| [excel/README.md](excel/README.md) | Excel VBA 版本說明 |

## 📄 License

MIT
