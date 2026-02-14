/**
 * ==========================================
 * PERSONAL FINANCE DASHBOARD
 * Modular, production-ready implementation
 * ==========================================
 */

// ==========================================
// CONFIGURATION
// ==========================================

const CONFIG = {
  STORAGE_KEY: 'financeTransactions',
  THEME_KEY: 'financeTheme',
  MAX_TITLE_LENGTH: 50,
  MIN_AMOUNT: 0.01,
  CURRENCY_SYMBOL: '₹',
  DEBOUNCE_DELAY: 300,
  CATEGORIES: ['Food', 'Shopping', 'Travel', 'Rent', 'Salary', 'Other']
};

// ==========================================
// CONSTANTS
// ==========================================

const CHART_COLORS = {
  pie: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'],
  bar: { background: 'rgba(0, 230, 118, 0.7)', border: '#00e676' }
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ==========================================
// STATE MANAGEMENT MODULE
// ==========================================

const Store = {
  state: {
    transactions: [],
    chartInstances: { pie: null, bar: null }
  },

  getTransactions() {
    return this.state.transactions;
  },

  addTransaction(transaction) {
    this.state.transactions.push(transaction);
    this.persist();
  },

  removeTransaction(id) {
    this.state.transactions = this.state.transactions.filter(t => t.id !== id);
    this.persist();
  },

  load() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
      this.state.transactions = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      this.state.transactions = [];
    }
  },

  persist() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.state.transactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
      throw new Error('Failed to save transaction');
    }
  },

  getChartInstance(type) {
    return this.state.chartInstances[type];
  },

  setChartInstance(type, instance) {
    this.state.chartInstances[type] = instance;
  }
};

// ==========================================
// DOM MODULE
// ==========================================

const DOM = {
  // Cache DOM elements
  elements: null,

  init() {
    this.elements = {
      // Form inputs
      form: document.getElementById('transactionForm'),
      title: document.getElementById('title'),
      amount: document.getElementById('amount'),
      type: document.getElementById('type'),
      category: document.getElementById('category'),

      // Display elements
      incomeValue: document.getElementById('incomeValue'),
      expenseValue: document.getElementById('expenseValue'),
      balanceValue: document.getElementById('balanceValue'),
      list: document.getElementById('list'),
      emptyState: document.getElementById('emptyState'),

      // Action buttons
      exportBtn: document.getElementById('exportCSV'),
      themeToggle: document.getElementById('themeToggle'),

      // Chart containers
      pieChart: document.getElementById('pieChart'),
      barChart: document.getElementById('barChart'),

      // Balance card
      balanceCard: null
    };

    // Cache balance card reference
    this.elements.balanceCard = this.elements.balanceValue.closest('.card');

    return this.elements;
  },

  getElements() {
    return this.elements;
  },

  clearForm() {
    this.elements.form.reset();
    this.elements.title.focus();
  },

  getFormData() {
    return {
      title: this.elements.title.value.trim(),
      amount: parseFloat(this.elements.amount.value),
      type: this.elements.type.value,
      category: this.elements.category.value
    };
  },

  updateValue(elementId, value) {
    const element = this.elements[elementId];
    if (element) element.textContent = value;
  },

  showEmptyState(show = true) {
    if (show) {
      this.elements.emptyState.classList.add('show');
      this.elements.list.style.display = 'none';
    } else {
      this.elements.emptyState.classList.remove('show');
      this.elements.list.style.display = '';
    }
  },

  clearList() {
    this.elements.list.innerHTML = '';
  },

  addTransactionElement(transaction) {
    const li = document.createElement('li');
    const isIncome = transaction.type === 'income';
    const color = isIncome ? '#00e676' : '#ff6b6b';

    li.innerHTML = `
      <div class="transaction-content">
        <strong>${escapeHtml(transaction.title)}</strong>
        <small>${transaction.category} • ${transaction.date || 'N/A'}</small>
      </div>
      <div class="transaction-amount">
        <span style="color: ${color};">
          ${isIncome ? '+' : '-'}${CONFIG.CURRENCY_SYMBOL}${transaction.amount.toFixed(2)}
        </span>
      </div>
      <button class="delete-btn" data-id="${transaction.id}" aria-label="Delete transaction">❌</button>
    `;

    this.elements.list.appendChild(li);
  }
};

// ==========================================
// VALIDATION MODULE
// ==========================================

const Validator = {
  validateTransaction(data) {
    const errors = [];

    if (!data.title) {
      errors.push('Title is required');
    } else if (data.title.length > CONFIG.MAX_TITLE_LENGTH) {
      errors.push(`Title must be less than ${CONFIG.MAX_TITLE_LENGTH} characters`);
    }

    if (!data.amount || isNaN(data.amount)) {
      errors.push('Please enter a valid amount');
    } else if (data.amount <= CONFIG.MIN_AMOUNT) {
      errors.push(`Amount must be greater than ${CONFIG.MIN_AMOUNT}`);
    }

    if (!data.category) {
      errors.push('Please select a category');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// ==========================================
// CALCULATION MODULE
// ==========================================

const Calculator = {
  calculateTotals(transactions) {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });

    return {
      income,
      expense,
      balance: income - expense
    };
  },

  calculateCategoryExpenses(transactions) {
    const categories = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      }
    });
    return categories;
  },

  calculateMonthlyExpenses(transactions) {
    const months = new Array(12).fill(0);
    transactions.forEach(t => {
      months[t.month] += (t.type === 'expense' ? t.amount : 0);
    });
    return months;
  }
};

// ==========================================
// CHART MODULE
// ==========================================

const ChartManager = {
  isPieChartEmpty(categories) {
    return Object.keys(categories).length === 0;
  },

  createPieChart(categories) {
    if (this.isPieChartEmpty(categories)) {
      return this.showEmptyChartMessage('pieChart', 'No expense data');
    }

    const instance = Store.getChartInstance('pie');
    if (instance) instance.destroy();

    try {
      const newChart = new Chart(DOM.elements.pieChart, {
        type: 'doughnut',
        data: {
          labels: Object.keys(categories),
          datasets: [{
            data: Object.values(categories),
            backgroundColor: CHART_COLORS.pie,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 2
          }]
        },
        options: this.getChartOptions()
      });

      Store.setChartInstance('pie', newChart);
    } catch (error) {
      console.error('Error creating pie chart:', error);
    }
  },

  createBarChart(months) {
    const instance = Store.getChartInstance('bar');
    if (instance) instance.destroy();

    try {
      const newChart = new Chart(DOM.elements.barChart, {
        type: 'bar',
        data: {
          labels: MONTH_LABELS,
          datasets: [{
            label: 'Monthly Expenses',
            data: months,
            backgroundColor: CHART_COLORS.bar.background,
            borderColor: CHART_COLORS.bar.border,
            borderWidth: 1,
            borderRadius: 6,
            hoverBackgroundColor: 'rgba(0, 230, 118, 0.9)'
          }]
        },
        options: {
          ...this.getChartOptions(),
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: 'rgba(255, 255, 255, 0.6)',
                callback: (value) => `${CONFIG.CURRENCY_SYMBOL}${value}`
              },
              grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            x: {
              ticks: { color: 'rgba(255, 255, 255, 0.6)' },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
          }
        }
      });

      Store.setChartInstance('bar', newChart);
    } catch (error) {
      console.error('Error creating bar chart:', error);
    }
  },

  getChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: 'rgba(255, 255, 255, 0.8)',
            font: { size: 12, family: "system-ui, -apple-system, sans-serif" }
          }
        }
      }
    };
  },

  showEmptyChartMessage(canvasId, message) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    }
  },

  updateCharts() {
    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded');
      return;
    }

    const transactions = Store.getTransactions();
    const categories = Calculator.calculateCategoryExpenses(transactions);
    const months = Calculator.calculateMonthlyExpenses(transactions);

    this.createPieChart(categories);
    this.createBarChart(months);
  }
};

// ==========================================
// EXPORT MODULE
// ==========================================

const Exporter = {
  toCSV(transactions) {
    if (transactions.length === 0) {
      alert('No transactions to export!');
      return;
    }

    const headers = ['Title', 'Amount', 'Type', 'Category', 'Date'];
    const rows = transactions.map(t => [
      t.title,
      t.amount.toFixed(2),
      t.type,
      t.category,
      t.date || 'N/A'
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }
};

// ==========================================
// THEME MODULE
// ==========================================

const Theme = {
  init() {
    this.restore();
  },

  toggle() {
    document.body.classList.toggle('dark');
    this.save();
    this.updateIcon();
  },

  save() {
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem(CONFIG.THEME_KEY, isDark ? 'dark' : 'light');
  },

  restore() {
    const theme = localStorage.getItem(CONFIG.THEME_KEY);
    if (theme === 'dark') {
      document.body.classList.add('dark');
    }
    this.updateIcon();
  },

  updateIcon() {
    const isDark = document.body.classList.contains('dark');
    DOM.elements.themeToggle.textContent = isDark ? '☀️' : '🌙';
  }
};

// ==========================================
// RENDERING MODULE
// ==========================================

const Renderer = {
  render() {
    this.renderCards();
    this.renderTransactionsList();
    this.updateCharts();
  },

  renderCards() {
    const transactions = Store.getTransactions();
    const { income, expense, balance } = Calculator.calculateTotals(transactions);

    DOM.updateValue('incomeValue', this.formatCurrency(income));
    DOM.updateValue('expenseValue', this.formatCurrency(expense));
    DOM.updateValue('balanceValue', this.formatCurrency(balance));

    // Update balance card color
    const balanceCard = DOM.elements.balanceCard;
    if (balance < 0) {
      balanceCard.classList.add('negative');
    } else {
      balanceCard.classList.remove('negative');
    }
  },

  renderTransactionsList() {
    const transactions = Store.getTransactions();

    DOM.clearList();

    if (transactions.length === 0) {
      DOM.showEmptyState(true);
      return;
    }

    DOM.showEmptyState(false);

    // Sort by newest first
    const sorted = [...transactions].sort((a, b) => b.id - a.id);

    sorted.forEach(transaction => {
      DOM.addTransactionElement(transaction);
    });

    this.attachDeleteHandlers();
  },

  attachDeleteHandlers() {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        EventManager.handleDelete(id);
      });
    });
  },

  updateCharts() {
    ChartManager.updateCharts();
  },

  formatCurrency(amount) {
    return `${CONFIG.CURRENCY_SYMBOL}${amount.toFixed(2)}`;
  }
};

// ==========================================
// EVENT MANAGER MODULE
// ==========================================

const EventManager = {
  init() {
    this.attachFormListener();
    this.attachExportListener();
    this.attachThemeListener();
  },

  attachFormListener() {
    DOM.elements.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
  },

  attachExportListener() {
    DOM.elements.exportBtn.addEventListener('click', () => this.handleExport());
  },

  attachThemeListener() {
    DOM.elements.themeToggle.addEventListener('click', () => this.handleThemeToggle());
  },

  handleFormSubmit(e) {
    e.preventDefault();

    const formData = DOM.getFormData();
    const validation = Validator.validateTransaction(formData);

    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    const transaction = {
      id: Date.now(),
      ...formData,
      month: new Date().getMonth(),
      date: new Date().toISOString().split('T')[0]
    };

    try {
      Store.addTransaction(transaction);
      DOM.clearForm();
      Renderer.render();
    } catch (error) {
      alert(error.message);
    }
  },

  handleDelete(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      Store.removeTransaction(id);
      Renderer.render();
    }
  },

  handleExport() {
    Exporter.toCSV(Store.getTransactions());
  },

  handleThemeToggle() {
    Theme.toggle();
  }
};

// ==========================================
// UTILITIES
// ==========================================

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// ==========================================
// APPLICATION INITIALIZATION
// ==========================================

const App = {
  init() {
    // Initialize DOM
    DOM.init();

    // Load data
    Store.load();

    // Setup event listeners
    EventManager.init();

    // Restore theme
    Theme.init();

    // Render UI
    Renderer.render();

    console.log('Finance Dashboard initialized successfully');
  }
};

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}