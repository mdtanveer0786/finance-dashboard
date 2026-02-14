/**
 * ============================================
 * WEALTHWISE - MODERN FINANCE DASHBOARD
 * Complete JavaScript with All Features
 * Version: 2.0.0
 * ============================================
 */

// ========== CONFIGURATION ==========
const CONFIG = {
  STORAGE_KEY: 'wealthwise_data',
  THEME_KEY: 'wealthwise_theme',
  CURRENCY: '₹',
  TRANSACTIONS_PER_PAGE: 10,
  MONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};

// ========== APP STATE ==========
let transactions = [];
let currentPage = 1;
let filteredTransactions = [];
let charts = {};

// ========== DOM ELEMENTS ==========
const elements = {
  // Sidebar
  sidebar: document.getElementById('sidebar'),
  menuToggle: document.getElementById('menuToggle'),
  closeSidebar: document.getElementById('closeSidebar'),
  overlay: document.getElementById('overlay'),
  navLinks: document.querySelectorAll('.sidebar-nav a'),
  transactionCount: document.getElementById('transactionCount'),

  // Pages
  pages: document.querySelectorAll('.page'),
  pageTitle: document.getElementById('pageTitle'),
  currentPage: document.getElementById('currentPage'),

  // Theme
  themeToggle: document.getElementById('themeToggle'),
  darkModeToggle: document.getElementById('darkModeToggle'),

  // Stats
  totalIncome: document.getElementById('totalIncome'),
  totalExpense: document.getElementById('totalExpense'),
  totalBalance: document.getElementById('totalBalance'),
  totalSavings: document.getElementById('totalSavings'),
  todaySpending: document.getElementById('todaySpending'),
  monthlyBudgetLeft: document.getElementById('monthlyBudgetLeft'),

  // Goal Progress
  goalProgressText: document.getElementById('goalProgressText'),
  goalPercentage: document.getElementById('goalPercentage'),
  goalProgress: document.getElementById('goalProgress'),

  // Quick Add Form
  quickAddForm: document.getElementById('quickAddForm'),
  quickTitle: document.getElementById('quickTitle'),
  quickAmount: document.getElementById('quickAmount'),
  quickType: document.getElementById('quickType'),

  // Recent Transactions
  recentTransactionsList: document.getElementById('recentTransactionsList'),
  dashboardEmptyState: document.getElementById('dashboardEmptyState'),

  // Insights
  insightsList: document.getElementById('insightsList'),

  // Charts
  pieChart: document.getElementById('pieChart'),
  barChart: document.getElementById('barChart'),
  analyticsChart: document.getElementById('analyticsChart'),
  piePeriod: document.getElementById('piePeriod'),
  barPeriod: document.getElementById('barPeriod'),
  analyticsRange: document.getElementById('analyticsRange'),

  // Transactions Page
  allTransactionsList: document.getElementById('allTransactionsList'),
  filterType: document.getElementById('filterType'),
  filterCategory: document.getElementById('filterCategory'),
  filterDate: document.getElementById('filterDate'),
  filteredCount: document.getElementById('filteredCount'),
  clearFilters: document.getElementById('clearFilters'),
  prevPage: document.getElementById('prevPage'),
  nextPage: document.getElementById('nextPage'),
  pageInfo: document.getElementById('pageInfo'),

  // Analytics Page
  avgDailyExpense: document.getElementById('avgDailyExpense'),
  mostActiveDay: document.getElementById('mostActiveDay'),
  activeDayTransactions: document.getElementById('activeDayTransactions'),
  topCategory: document.getElementById('topCategory'),
  topCategoryAmount: document.getElementById('topCategoryAmount'),
  savingsRateAnalytics: document.getElementById('savingsRateAnalytics'),
  categoryAnalysis: document.getElementById('categoryAnalysis'),

  // Budget Page
  totalBudgetProgress: document.getElementById('totalBudgetProgress'),
  budgetSpent: document.getElementById('budgetSpent'),
  budgetRemaining: document.getElementById('budgetRemaining'),
  budgetList: document.getElementById('budgetList'),
  addBudgetBtn: document.getElementById('addBudgetBtn'),

  // Goals Page
  goalsList: document.getElementById('goalsList'),
  addGoalBtn: document.getElementById('addGoalBtn'),

  // Reports Page
  generateReportBtn: document.getElementById('generateReportBtn'),
  generateCustomReport: document.getElementById('generateCustomReport'),
  reportType: document.getElementById('reportType'),
  reportMonth: document.getElementById('reportMonth'),

  // Settings Page
  displayName: document.getElementById('displayName'),
  displayEmail: document.getElementById('displayEmail'),
  saveProfile: document.getElementById('saveProfile'),
  weekStart: document.getElementById('weekStart'),
  budgetAlerts: document.getElementById('budgetAlerts'),
  monthlyReports: document.getElementById('monthlyReports'),
  goalReminders: document.getElementById('goalReminders'),
  exportDataBtn: document.getElementById('exportDataBtn'),
  importDataBtn: document.getElementById('importDataBtn'),
  resetDataBtn: document.getElementById('resetDataBtn'),

  // Search
  searchInput: document.getElementById('searchInput'),

  // Buttons
  exportBtn: document.getElementById('exportBtn'),
  importBtn: document.getElementById('importBtn'),
  viewAllBtn: document.querySelectorAll('[data-page="transactions"]'),

  // FAB & Modal
  fabBtn: document.getElementById('fabBtn'),
  quickAddModal: document.getElementById('quickAddModal'),
  closeModal: document.getElementById('closeModal'),
  modalForm: document.getElementById('modalForm'),
  modalTitle: document.getElementById('modalTitle'),
  modalAmount: document.getElementById('modalAmount'),
  modalType: document.getElementById('modalType'),
  modalCategory: document.getElementById('modalCategory'),
  modalDate: document.getElementById('modalDate'),
  modalPayment: document.getElementById('modalPayment'),

  // Toast
  toast: document.getElementById('toast')
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  loadTheme();
  setupEventListeners();
  setDefaultDates();
  updateUI();
  initCharts();
  updateTransactionCount();
  updateGoalProgress();
  generateInsights();
});

function loadData() {
  try {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
    transactions = saved ? JSON.parse(saved) : [];
    filteredTransactions = [...transactions];
  } catch (error) {
    console.error('Error loading data:', error);
    transactions = [];
    filteredTransactions = [];
  }
}

function saveData() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(transactions));
    updateUI();
    updateTransactionCount();
    updateGoalProgress();
    generateInsights();
    if (elements.analyticsRange) updateAnalytics();
    if (elements.filterType) applyFilters();
  } catch (error) {
    console.error('Error saving data:', error);
    showToast('Error saving data', 'error');
  }
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
  // Sidebar
  elements.menuToggle?.addEventListener('click', toggleSidebar);
  elements.closeSidebar?.addEventListener('click', closeSidebar);
  elements.overlay?.addEventListener('click', closeSidebar);

  // Navigation
  elements.navLinks.forEach(link => {
    link.addEventListener('click', handleNavigation);
  });

  // Theme
  elements.themeToggle?.addEventListener('click', toggleTheme);
  elements.darkModeToggle?.addEventListener('change', toggleTheme);

  // Quick Add Form
  elements.quickAddForm?.addEventListener('submit', handleQuickAdd);

  // Search
  elements.searchInput?.addEventListener('input', debounce(handleSearch, 300));

  // Filters
  elements.filterType?.addEventListener('change', applyFilters);
  elements.filterCategory?.addEventListener('change', applyFilters);
  elements.filterDate?.addEventListener('change', applyFilters);
  elements.clearFilters?.addEventListener('click', clearFilters);

  // Pagination
  elements.prevPage?.addEventListener('click', () => changePage(-1));
  elements.nextPage?.addEventListener('click', () => changePage(1));

  // Export/Import
  elements.exportBtn?.addEventListener('click', exportToCSV);
  elements.importBtn?.addEventListener('click', importData);
  elements.exportDataBtn?.addEventListener('click', exportToJSON);
  elements.importDataBtn?.addEventListener('click', importFromJSON);
  elements.resetDataBtn?.addEventListener('click', resetAllData);

  // View All buttons
  elements.viewAllBtn.forEach(btn => {
    btn.addEventListener('click', () => switchPage('transactions'));
  });

  // Chart periods
  elements.piePeriod?.addEventListener('change', updatePieChart);
  elements.barPeriod?.addEventListener('change', updateBarChart);
  elements.analyticsRange?.addEventListener('change', updateAnalytics);

  // Budget
  elements.addBudgetBtn?.addEventListener('click', () => showToast('Budget feature coming soon!', 'info'));

  // Goals
  elements.addGoalBtn?.addEventListener('click', () => showToast('Goals feature coming soon!', 'info'));

  // Reports
  elements.generateReportBtn?.addEventListener('click', generateReport);
  elements.generateCustomReport?.addEventListener('click', generateCustomReport);

  // Settings
  elements.saveProfile?.addEventListener('click', saveProfile);

  // FAB & Modal
  elements.fabBtn?.addEventListener('click', openQuickAddModal);
  elements.closeModal?.addEventListener('click', closeQuickAddModal);
  elements.modalForm?.addEventListener('submit', handleModalSubmit);

  // Close modal on outside click
  window.addEventListener('click', (e) => {
    if (e.target === elements.quickAddModal) {
      closeQuickAddModal();
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeQuickAddModal();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      openQuickAddModal();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      elements.searchInput?.focus();
    }
  });
}

// ========== SIDEBAR FUNCTIONS ==========
function toggleSidebar() {
  elements.sidebar.classList.toggle('active');
  elements.overlay.classList.toggle('active');
}

function closeSidebar() {
  elements.sidebar.classList.remove('active');
  elements.overlay.classList.remove('active');
}

// ========== NAVIGATION ==========
function handleNavigation(e) {
  e.preventDefault();
  const page = e.currentTarget.dataset.page;
  if (!page) return;

  switchPage(page);

  if (window.innerWidth <= 1024) {
    closeSidebar();
  }
}

function switchPage(page) {
  // Update active nav link
  elements.navLinks.forEach(link => {
    const li = link.parentElement;
    if (link.dataset.page === page) {
      li.classList.add('active');
    } else {
      li.classList.remove('active');
    }
  });

  // Update page visibility
  elements.pages.forEach(p => {
    if (p.id === page) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });

  // Update page title
  const titles = {
    'dashboard': 'Dashboard',
    'transactions': 'Transactions',
    'analytics': 'Analytics',
    'budget': 'Budget Planner',
    'goals': 'Savings Goals',
    'reports': 'Financial Reports',
    'settings': 'Settings'
  };

  elements.pageTitle.textContent = titles[page] || 'Dashboard';
  elements.currentPage.textContent = titles[page] || 'Dashboard';

  // Refresh page data
  if (page === 'transactions') {
    currentPage = 1;
    applyFilters();
  }

  if (page === 'analytics') {
    updateAnalytics();
  }

  if (page === 'dashboard') {
    updateUI();
    updateCharts();
    generateInsights();
  }
}

// ========== THEME ==========
function loadTheme() {
  const theme = localStorage.getItem(CONFIG.THEME_KEY);
  if (theme === 'dark') {
    document.body.classList.add('dark');
    updateThemeIcons(true);
    if (elements.darkModeToggle) elements.darkModeToggle.checked = true;
  }
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem(CONFIG.THEME_KEY, isDark ? 'dark' : 'light');
  updateThemeIcons(isDark);
  if (elements.darkModeToggle) elements.darkModeToggle.checked = isDark;
  updateCharts();
  showToast(`${isDark ? 'Dark' : 'Light'} mode activated`, 'success');
}

function updateThemeIcons(isDark) {
  const icon = elements.themeToggle?.querySelector('i');
  if (icon) {
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// ========== DATE FUNCTIONS ==========
function setDefaultDates() {
  if (elements.modalDate) {
    const today = new Date().toISOString().split('T')[0];
    elements.modalDate.value = today;
  }

  if (elements.reportMonth) {
    const today = new Date();
    const yearMonth = today.toISOString().slice(0, 7);
    elements.reportMonth.value = yearMonth;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
}

// ========== QUICK ADD FORM ==========
function handleQuickAdd(e) {
  e.preventDefault();

  const title = elements.quickTitle?.value.trim();
  const amount = parseFloat(elements.quickAmount?.value);
  const type = elements.quickType?.value;

  if (!title || !amount) {
    showToast('Please fill all fields', 'error');
    return;
  }

  if (amount <= 0) {
    showToast('Please enter valid amount', 'error');
    return;
  }

  const transaction = {
    id: Date.now(),
    title,
    amount,
    type,
    category: type === 'income' ? 'Salary' : 'Other',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    timestamp: new Date().toISOString()
  };

  transactions.push(transaction);
  saveData();

  elements.quickAddForm.reset();
  showToast('Transaction added!', 'success');

  if (type === 'income' && amount > 5000) {
    playConfetti();
  }
}

// ========== MODAL FUNCTIONS ==========
function openQuickAddModal() {
  elements.quickAddModal?.classList.add('show');
  setDefaultDates();
}

function closeQuickAddModal() {
  elements.quickAddModal?.classList.remove('show');
}

function handleModalSubmit(e) {
  e.preventDefault();

  const title = elements.modalTitle?.value.trim();
  const amount = parseFloat(elements.modalAmount?.value);
  const type = elements.modalType?.value;
  const category = elements.modalCategory?.value;
  const date = elements.modalDate?.value;
  const payment = elements.modalPayment?.value;

  if (!title || !amount || !category) {
    showToast('Please fill all fields', 'error');
    return;
  }

  if (amount <= 0) {
    showToast('Please enter valid amount', 'error');
    return;
  }

  const transaction = {
    id: Date.now(),
    title,
    amount,
    type,
    category,
    date,
    paymentMethod: payment,
    timestamp: new Date().toISOString()
  };

  transactions.push(transaction);
  saveData();

  closeQuickAddModal();
  elements.modalForm.reset();
  setDefaultDates();

  showToast('Transaction added!', 'success');

  if (type === 'income' && amount > 5000) {
    playConfetti();
  }
}

// ========== DELETE TRANSACTION ==========
function deleteTransaction(id) {
  if (confirm('Delete this transaction?')) {
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    showToast('Transaction deleted', 'success');
  }
}

// ========== UPDATE UI ==========
function updateUI() {
  // Calculate totals
  const totals = calculateTotals();

  // Update stats
  elements.totalIncome.textContent = `${CONFIG.CURRENCY}${formatNumber(totals.income)}`;
  elements.totalExpense.textContent = `${CONFIG.CURRENCY}${formatNumber(totals.expense)}`;
  elements.totalBalance.textContent = `${CONFIG.CURRENCY}${formatNumber(totals.balance)}`;
  elements.totalSavings.textContent = `${CONFIG.CURRENCY}${formatNumber(totals.balance * 0.3)}`;

  // Today's spending
  const today = new Date().toISOString().split('T')[0];
  const todayExpenses = transactions.filter(t => t.type === 'expense' && t.date === today)
    .reduce((sum, t) => sum + t.amount, 0);
  elements.todaySpending.textContent = `${CONFIG.CURRENCY}${formatNumber(todayExpenses)}`;

  // Monthly budget (example)
  const monthlyBudget = 50000;
  const monthlyExpenses = transactions.filter(t => {
    const date = new Date(t.date);
    const now = new Date();
    return t.type === 'expense' &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
  }).reduce((sum, t) => sum + t.amount, 0);

  elements.monthlyBudgetLeft.textContent = `${CONFIG.CURRENCY}${formatNumber(monthlyBudget - monthlyExpenses)}`;

  // Render recent transactions
  renderRecentTransactions();
}

function calculateTotals() {
  let income = 0, expense = 0;
  transactions.forEach(t => {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  });
  return { income, expense, balance: income - expense };
}

function formatNumber(num) {
  return num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// ========== RENDER TRANSACTIONS ==========
function renderRecentTransactions() {
  const list = elements.recentTransactionsList;
  if (!list) return;

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (recent.length === 0) {
    list.innerHTML = '';
    if (elements.dashboardEmptyState) {
      elements.dashboardEmptyState.style.display = 'block';
    }
    return;
  }

  if (elements.dashboardEmptyState) {
    elements.dashboardEmptyState.style.display = 'none';
  }

  list.innerHTML = recent.map(t => createTransactionHTML(t)).join('');

  // Add delete handlers
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      deleteTransaction(id);
    });
  });
}

function createTransactionHTML(t) {
  const isIncome = t.type === 'income';
  const formattedDate = formatDate(t.date);

  return `
        <div class="transaction-item">
            <div class="transaction-left">
                <div class="transaction-icon ${t.type}">
                    <i class="fas ${isIncome ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                </div>
                <div class="transaction-info">
                    <h4>${escapeHtml(t.title)}</h4>
                    <p>${t.category} • ${formattedDate}</p>
                </div>
            </div>
            <div class="transaction-right">
                <span class="transaction-amount ${t.type}">
                    ${isIncome ? '+' : '-'} ${CONFIG.CURRENCY}${formatNumber(t.amount)}
                </span>
                <button class="delete-btn" data-id="${t.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

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

// ========== TRANSACTIONS TABLE ==========
function renderTransactionsTable(transactionsToRender) {
  const tbody = elements.allTransactionsList;
  if (!tbody) return;

  if (transactionsToRender.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-receipt" style="font-size: 2rem; opacity: 0.5; margin-bottom: 0.5rem;"></i>
                    <p>No transactions found</p>
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = transactionsToRender.map(t => {
    const isIncome = t.type === 'income';
    const formattedDate = new Date(t.date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div class="transaction-icon ${t.type}" style="width: 32px; height: 32px; font-size: 0.8rem;">
                            <i class="fas ${isIncome ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                        </div>
                        <div>
                            <strong>${escapeHtml(t.title)}</strong>
                        </div>
                    </div>
                </td>
                <td>${t.category}</td>
                <td>${formattedDate}</td>
                <td>${t.paymentMethod || 'cash'}</td>
                <td style="color: ${isIncome ? 'var(--success)' : 'var(--danger)'}; font-weight: 600;">
                    ${isIncome ? '+' : '-'} ${CONFIG.CURRENCY}${formatNumber(t.amount)}
                </td>
                <td>
                    <button class="delete-btn" data-id="${t.id}" style="background: none; border: none; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
  }).join('');

  // Add delete handlers
  tbody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      deleteTransaction(id);
    });
  });
}

// ========== SEARCH AND FILTERS ==========
function handleSearch(e) {
  const query = e.target.value.toLowerCase();

  if (!query) {
    filteredTransactions = [...transactions];
  } else {
    filteredTransactions = transactions.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
    );
  }

  currentPage = 1;
  applyFilters();
}

function applyFilters() {
  let filtered = [...filteredTransactions];

  const type = elements.filterType?.value;
  const category = elements.filterCategory?.value;
  const date = elements.filterDate?.value;

  if (type && type !== 'all') {
    filtered = filtered.filter(t => t.type === type);
  }

  if (category && category !== 'all') {
    filtered = filtered.filter(t => t.category === category);
  }

  if (date) {
    filtered = filtered.filter(t => t.date === date);
  }

  // Update count
  if (elements.filteredCount) {
    elements.filteredCount.textContent = `${filtered.length} transactions`;
  }

  // Paginate
  const start = (currentPage - 1) * CONFIG.TRANSACTIONS_PER_PAGE;
  const end = start + CONFIG.TRANSACTIONS_PER_PAGE;
  const paginated = filtered.slice(start, end);

  renderTransactionsTable(paginated);
  updatePagination(filtered.length);
}

function clearFilters() {
  if (elements.filterType) elements.filterType.value = 'all';
  if (elements.filterCategory) elements.filterCategory.value = 'all';
  if (elements.filterDate) elements.filterDate.value = '';

  filteredTransactions = [...transactions];
  currentPage = 1;
  applyFilters();
}

function updatePagination(totalItems) {
  const totalPages = Math.ceil(totalItems / CONFIG.TRANSACTIONS_PER_PAGE);

  if (elements.pageInfo) {
    elements.pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
  }

  if (elements.prevPage) {
    elements.prevPage.disabled = currentPage === 1;
  }

  if (elements.nextPage) {
    elements.nextPage.disabled = currentPage === totalPages || totalPages === 0;
  }
}

function changePage(direction) {
  const totalPages = Math.ceil(filteredTransactions.length / CONFIG.TRANSACTIONS_PER_PAGE);
  const newPage = currentPage + direction;

  if (newPage >= 1 && newPage <= totalPages) {
    currentPage = newPage;
    applyFilters();
  }
}

// ========== CHARTS ==========
function initCharts() {
  if (elements.pieChart) updatePieChart();
  if (elements.barChart) updateBarChart();
  if (elements.analyticsChart) updateAnalyticsChart();
}

function updateCharts() {
  updatePieChart();
  updateBarChart();
}

function updatePieChart() {
  if (!elements.pieChart) return;

  const period = elements.piePeriod?.value || 'month';
  const ctx = elements.pieChart.getContext('2d');

  // Filter by period
  let filtered = [...transactions];
  const now = new Date();

  if (period === 'month') {
    filtered = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();
    });
  } else if (period === 'year') {
    filtered = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === now.getFullYear();
    });
  }

  // Get expenses by category
  const expenses = filtered.filter(t => t.type === 'expense');
  const categories = {};

  expenses.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + e.amount;
  });

  // Destroy existing chart
  if (charts.pie) charts.pie.destroy();

  // If no data
  if (Object.keys(categories).length === 0) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = '14px Inter';
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--gray-500').trim();
    ctx.textAlign = 'center';
    ctx.fillText('No expense data', ctx.canvas.width / 2, ctx.canvas.height / 2);
    return;
  }

  // Colors
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  // Create chart
  charts.pie = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: colors.slice(0, Object.keys(categories).length),
        borderWidth: 0,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percent = ((value / total) * 100).toFixed(1);
              return `${CONFIG.CURRENCY}${value.toFixed(2)} (${percent}%)`;
            }
          }
        }
      }
    }
  });
}

function updateBarChart() {
  if (!elements.barChart) return;

  const months = parseInt(elements.barPeriod?.value) || 6;
  const ctx = elements.barChart.getContext('2d');

  const labels = [];
  const incomeData = [];
  const expenseData = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthYear = date.toLocaleDateString('en-IN', { month: 'short' });
    labels.push(monthYear);

    let income = 0, expense = 0;

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear()) {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
      }
    });

    incomeData.push(income);
    expenseData.push(expense);
  }

  if (charts.bar) charts.bar.destroy();

  charts.bar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: '#10b981',
          borderRadius: 6,
          barPercentage: 0.6
        },
        {
          label: 'Expense',
          data: expenseData,
          backgroundColor: '#ef4444',
          borderRadius: 6,
          barPercentage: 0.6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { usePointStyle: true, boxWidth: 8 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => CONFIG.CURRENCY + value
          }
        }
      }
    }
  });
}

function updateAnalyticsChart() {
  if (!elements.analyticsChart) return;

  const range = parseInt(elements.analyticsRange?.value) || 30;
  const ctx = elements.analyticsChart.getContext('2d');

  const labels = [];
  const incomeData = [];
  const expenseData = [];

  for (let i = range - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    labels.push(label);

    const dateStr = date.toISOString().split('T')[0];
    let income = 0, expense = 0;

    transactions.forEach(t => {
      if (t.date === dateStr) {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
      }
    });

    incomeData.push(income);
    expenseData.push(expense);
  }

  if (charts.analytics) charts.analytics.destroy();

  charts.analytics = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Expense',
          data: expenseData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { usePointStyle: true }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => CONFIG.CURRENCY + value
          }
        }
      }
    }
  });
}

// ========== ANALYTICS ==========
function updateAnalytics() {
  const range = parseInt(elements.analyticsRange?.value) || 30;

  // Calculate average daily expense
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - range);

  const periodTransactions = transactions.filter(t => {
    return new Date(t.date) >= startDate;
  });

  const totalExpense = periodTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const avgDaily = totalExpense / range;
  elements.avgDailyExpense.textContent = `${CONFIG.CURRENCY}${formatNumber(avgDaily)}`;

  // Find most active day
  const dayCount = {};
  transactions.forEach(t => {
    const day = new Date(t.date).toLocaleDateString('en-IN', { weekday: 'long' });
    dayCount[day] = (dayCount[day] || 0) + 1;
  });

  let maxDay = 'Sunday', maxCount = 0;
  Object.entries(dayCount).forEach(([day, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxDay = day;
    }
  });

  elements.mostActiveDay.textContent = maxDay;
  elements.activeDayTransactions.textContent = `${maxCount} transactions`;

  // Find top category
  const categoryExpense = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categoryExpense[t.category] = (categoryExpense[t.category] || 0) + t.amount;
  });

  let topCat = 'Other', topAmount = 0;
  Object.entries(categoryExpense).forEach(([cat, amount]) => {
    if (amount > topAmount) {
      topAmount = amount;
      topCat = cat;
    }
  });

  elements.topCategory.textContent = topCat;
  elements.topCategoryAmount.textContent = `${CONFIG.CURRENCY}${formatNumber(topAmount)}`;

  // Calculate savings rate
  const totals = calculateTotals();
  const savingsRate = totals.income > 0
    ? ((totals.income - totals.expense) / totals.income * 100).toFixed(1)
    : 0;
  elements.savingsRateAnalytics.textContent = `${savingsRate}%`;

  // Update category analysis
  updateCategoryAnalysis();

  // Update chart
  updateAnalyticsChart();
}

function updateCategoryAnalysis() {
  const container = elements.categoryAnalysis;
  if (!container) return;

  const categoryExpense = {};
  let total = 0;

  transactions.filter(t => t.type === 'expense').forEach(t => {
    categoryExpense[t.category] = (categoryExpense[t.category] || 0) + t.amount;
    total += t.amount;
  });

  const sorted = Object.entries(categoryExpense)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  container.innerHTML = sorted.map(([category, amount], index) => {
    const percent = ((amount / total) * 100).toFixed(1);
    return `
            <div class="category-item">
                <span class="category-color" style="background: ${colors[index]}"></span>
                <div class="category-info">
                    <div class="category-name">${category}</div>
                    <div class="category-stats">
                        <span>${CONFIG.CURRENCY}${formatNumber(amount)}</span>
                        <span>${percent}%</span>
                    </div>
                </div>
            </div>
        `;
  }).join('');
}

// ========== INSIGHTS ==========
function generateInsights() {
  const container = elements.insightsList;
  if (!container) return;

  if (transactions.length === 0) {
    container.innerHTML = `
            <div class="insight-item">
                <i class="fas fa-lightbulb"></i>
                <p>Add transactions to get personalized insights</p>
            </div>
        `;
    return;
  }

  const insights = [];
  const totals = calculateTotals();

  // Savings insight
  if (totals.balance > 0) {
    insights.push({
      icon: 'fa-smile',
      text: `Great! You've saved ${CONFIG.CURRENCY}${formatNumber(totals.balance)} overall`
    });
  }

  // Spending insight
  const expenseRatio = totals.expense / (totals.income || 1);
  if (expenseRatio > 0.7) {
    insights.push({
      icon: 'fa-exclamation-triangle',
      text: 'You\'re spending more than 70% of your income'
    });
  }

  // Top category
  const categoryExpense = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categoryExpense[t.category] = (categoryExpense[t.category] || 0) + t.amount;
  });

  let topCat = 'Other', topAmount = 0;
  Object.entries(categoryExpense).forEach(([cat, amount]) => {
    if (amount > topAmount) {
      topAmount = amount;
      topCat = cat;
    }
  });

  if (topAmount > 0) {
    insights.push({
      icon: 'fa-chart-line',
      text: `Your highest spending category is ${topCat}`
    });
  }

  container.innerHTML = insights.map(insight => `
        <div class="insight-item">
            <i class="fas ${insight.icon}"></i>
            <p>${insight.text}</p>
        </div>
    `).join('');
}

// ========== GOAL PROGRESS ==========
function updateGoalProgress() {
  const totals = calculateTotals();
  const goal = 50000; // Monthly savings goal
  const progress = Math.min((totals.balance / goal) * 100, 100);

  if (elements.goalProgressText) {
    elements.goalProgressText.textContent = `${CONFIG.CURRENCY}${formatNumber(totals.balance)} / ${CONFIG.CURRENCY}${formatNumber(goal)}`;
  }

  if (elements.goalPercentage) {
    elements.goalPercentage.textContent = `${Math.round(progress)}%`;
  }

  if (elements.goalProgress) {
    elements.goalProgress.style.width = `${progress}%`;
  }
}

// ========== TRANSACTION COUNT ==========
function updateTransactionCount() {
  if (elements.transactionCount) {
    elements.transactionCount.textContent = transactions.length;
  }
}

// ========== REPORTS ==========
function generateReport() {
  showToast('Generating PDF report...', 'info');
  setTimeout(() => {
    showToast('Report generated successfully!', 'success');
  }, 2000);
}

function generateCustomReport() {
  const type = elements.reportType?.value;
  const month = elements.reportMonth?.value;

  if (!month) {
    showToast('Please select a month', 'error');
    return;
  }

  showToast(`Generating ${type} report for ${month}...`, 'info');
}

// ========== SETTINGS ==========
function saveProfile() {
  const name = elements.displayName?.value;
  const email = elements.displayEmail?.value;

  if (name && email) {
    showToast('Profile updated!', 'success');
  }
}

// ========== EXPORT / IMPORT ==========
function exportToCSV() {
  if (transactions.length === 0) {
    showToast('No transactions to export', 'error');
    return;
  }

  const headers = ['Title', 'Amount (₹)', 'Type', 'Category', 'Date', 'Payment Method'];
  const rows = transactions.map(t => [
    t.title,
    t.amount.toFixed(2),
    t.type,
    t.category,
    t.date,
    t.paymentMethod || 'cash'
  ]);

  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(cell => `"${cell}"`).join(',') + '\n';
  });

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();

  URL.revokeObjectURL(url);
  showToast('Export successful!', 'success');
}

function exportToJSON() {
  const data = {
    transactions,
    exportDate: new Date().toISOString(),
    version: '2.0.0'
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `wealthwise_backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();

  URL.revokeObjectURL(url);
  showToast('Backup created!', 'success');
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv,.json';

  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        // For CSV import (simplified)
        showToast('Import feature coming soon!', 'info');
      } catch (error) {
        showToast('Error importing file', 'error');
      }
    };

    reader.readAsText(file);
  };

  input.click();
}

function importFromJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.transactions && Array.isArray(data.transactions)) {
          if (confirm(`Import ${data.transactions.length} transactions? This will replace existing data.`)) {
            transactions = data.transactions;
            saveData();
            showToast('Data imported successfully!', 'success');
          }
        } else {
          showToast('Invalid backup file', 'error');
        }
      } catch (error) {
        showToast('Error importing file', 'error');
      }
    };

    reader.readAsText(file);
  };

  input.click();
}

function resetAllData() {
  if (confirm('⚠️ This will delete ALL your data. Are you absolutely sure?')) {
    transactions = [];
    filteredTransactions = [];
    saveData();
    showToast('All data reset', 'success');
    updateUI();
    updateCharts();
  }
}

// ========== TOAST ==========
function showToast(message, type = 'info') {
  const toast = elements.toast;
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ========== CONFETTI ==========
function playConfetti() {
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-10px';
      confetti.style.width = '8px';
      confetti.style.height = '8px';
      confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
      confetti.style.borderRadius = '50%';
      confetti.style.zIndex = '9999';
      confetti.style.pointerEvents = 'none';

      document.body.appendChild(confetti);

      const animation = confetti.animate(
        [
          { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
          { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ],
        {
          duration: 2000 + Math.random() * 1000,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }
      );

      animation.onfinish = () => confetti.remove();
    }, i * 100);
  }
}

// ========== UTILITIES ==========
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ========== GLOBAL FUNCTIONS ==========
window.deleteTransaction = deleteTransaction;
window.switchPage = switchPage;