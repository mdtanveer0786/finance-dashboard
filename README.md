# WealthWise | Modern Personal Finance Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-6.0.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.5.1-FF6384?logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-00A3E0?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

**WealthWise** is a high-performance, responsive personal finance dashboard built with modern web technologies. It provides a comprehensive suite of tools to manage your finances, track spending patterns, and visualize your financial health in real-time.

---

## 🌟 Key Features

- **📊 Dynamic Analytics:** Real-time financial insights with interactive Chart.js visualizations (Doughnut, Bar, and Line charts).
- **📝 Full CRUD Transactions:** Comprehensive transaction management with "Add," "Edit," and "Delete" capabilities across all pages.
- **📱 PWA Ready:** Progressive Web App support for an "app-like" experience on mobile and desktop, including offline capabilities.
- **🌓 Adaptive Theme:** Seamless transition between Light and Dark modes with persistent user preferences.
- **📁 Data Management:** Export your financial history to CSV or JSON, and import backups to restore your data.
- **📈 Goal & Budget Tracking:** Set monthly budgets by category and track savings goals with visual progress indicators.
- **🤖 AI-Powered Insights:** Smart notifications and insights based on your spending habits and savings rate.

---

## 🛠 Tech Stack

- **Core:** JavaScript (ES6+), HTML5, Vanilla CSS3
- **Build Tool:** [Vite 6](https://vitejs.dev/)
- **Visuals:** [Chart.js](https://www.chartjs.org/) for data visualization
- **Icons:** [Font Awesome 6](https://fontawesome.com/)
- **Storage:** Browser `LocalStorage` for persistent data (No database required)
- **Deployment:** Optimized for Vercel/Netlify with PWA support

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mdtanveer0786/finance-dashboard.git
   cd finance-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```text
personal-finance-dashboard/
├── dist/                # Optimized production build
├── node_modules/        # Project dependencies
├── src/
│   ├── main.js         # Core application logic & state management
│   └── style.css       # Comprehensive dashboard styling (Light/Dark)
├── index.html          # Main entry point
├── package.json        # Build scripts and dependencies
├── vite.config.js      # Vite & PWA configuration
└── README.md           # Project documentation
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](https://opensource.org/licenses/MIT) page for details.

---

## 👨‍💻 Author

**Md Tanveer**
- GitHub: [@mdtanveer0786](https://github.com/mdtanveer0786)
- Website: [WealthWise Live Demo](https://financee-dashboard.netlify.app/)
