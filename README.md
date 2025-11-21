# A-Share ETF Analyzer (A股 ETF 对比分析工具)

这是一个基于 **Google Gemini 2.5 Flash** 模型开发的智能 ETF 分析工具，专注于中国 A 股市场的场内交易基金（ETF）对比。

它利用 Gemini 的 **Google Search Grounding**（搜索落地）能力，实时抓取互联网上的真实历史行情数据，为用户提供近 60 个交易日的走势对比、净值分析和涨跌幅统计。

![App Screenshot](./screenshot.png) *(如有截图可放置于此)*

## ✨ 主要功能

1.  **智能搜索与补全**：
    *   内置包含宽基、行业、跨境、商品等数百只常用 ETF 的本地数据库。
    *   支持输入代码（如 `510300`）或简称（如 `沪深300`）进行实时联想提示。
2.  **AI 驱动的数据获取**：
    *   不依赖传统的付费金融 API，而是通过 Gemini 2.5 Flash 结合 Google Search 实时检索财经网站数据。
    *   自动解析非结构化数据为标准 JSON 格式，包含真实的数据来源链接。
3.  **多维度可视化对比**：
    *   **走势图**：基于 `Recharts` 实现的交互式折线图，支持“单位净值”和“涨跌幅百分比”两种模式切换。
    *   **详细数据表**：展示最新价、60日涨跌幅、最高/最低价等关键指标。
4.  **组合管理**：
    *   自由添加、删除对比标的，支持多只 ETF 同屏对比。
    *   自动分配高辨识度的图表颜色。

## 🛠 技术栈

*   **前端框架**: React 19, TypeScript, Vite
*   **UI 库**: Tailwind CSS, Lucide React
*   **图表库**: Recharts
*   **AI 模型**: Google Gemini API (@google/genai SDK)
    *   Model: `gemini-2.5-flash`
    *   Tool: `googleSearch`

## 🚀 快速开始

### 前置要求

*   Node.js (v18 或更高版本)
*   Google AI Studio API Key (需要开通付费项目以支持 Search Grounding 功能，或者使用支持该功能的免费层级)

### 安装步骤

1.  **克隆项目**

    ```bash
    git clone https://github.com/your-username/a-share-etf-analyzer.git
    cd a-share-etf-analyzer
    ```

2.  **安装依赖**

    ```bash
    npm install
    ```

3.  **配置环境变量**

    在项目根目录创建 `.env` 文件（或设置系统环境变量），填入你的 Gemini API Key：

    ```env
    # Linux/Mac
    export API_KEY="your_google_api_key_here"
    
    # 或者在构建工具中配置 (Vite 默认读取 .env 通常需要前缀，但在本演示环境中我们直接使用了 process.env.API_KEY)
    ```

    *注意：本项目代码示例中使用了 `process.env.API_KEY`，请确保您的运行环境支持注入该变量。*

4.  **启动开发服务器**

    ```bash
    npm run dev
    ```

5.  **构建生产版本**

    ```bash
    npm run build
    ```

## 📂 项目结构

```
├── components/
│   ├── ETFInput.tsx        # 搜索与添加组件（含自动补全）
│   ├── ETFList.tsx         # 已选标签列表
│   ├── ETFTable.tsx        # 数据详情表格
│   └── PerformanceChart.tsx # 核心图表组件
├── services/
│   └── geminiService.ts    # Gemini API 调用与 Prompt 工程逻辑
├── utils/
│   ├── colors.ts           # 颜色生成算法
│   └── etfList.ts          # 本地 ETF 静态数据库
├── App.tsx                 # 主应用逻辑
├── types.ts                # TypeScript 类型定义
└── index.html              # 入口 HTML
```

## ⚠️ 免责声明

*   本项目的数据由 AI 模型通过搜索引擎抓取生成，可能存在延迟、缺失或误差。
*   **本项目展示的所有信息仅供技术交流与演示使用，不构成任何投资建议。**
*   股市有风险，投资需谨慎。

## 📄 License

MIT
