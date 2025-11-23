let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const title = document.getElementById("title");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");
const list = document.getElementById("list");

document.getElementById("addBtn").addEventListener("click", () => {
  if (!title.value || !amount.value) return alert("Enter valid data!");

  const item = {
    id: Date.now(),
    title: title.value,
    amount: Number(amount.value),
    type: type.value,
    category: category.value,
    month: new Date().getMonth()
  };

  transactions.push(item);
  saveData();
  render();
});

function saveData() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Update UI
function render() {
  list.innerHTML = "";
  let income = 0, expense = 0;

  transactions.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;

    const li = document.createElement("li");
    li.innerHTML = `
      ${t.title} (₹${t.amount}) - ${t.category}
      <button onclick="del(${t.id})">❌</button>
    `;
    list.appendChild(li);
  });

  document.getElementById("incomeValue").innerText = "₹" + income;
  document.getElementById("expenseValue").innerText = "₹" + expense;
  document.getElementById("balanceValue").innerText = "₹" + (income - expense);

  loadCharts();
}

function del(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveData();
  render();
}

/*------------------ Charts ------------------*/
let pieChart, barChart;

function loadCharts() {
  const categories = {};
  const months = new Array(12).fill(0);

  transactions.forEach(t => {
    if (t.type === "expense") {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    }
    months[t.month] += t.amount;
  });

  // Pie Chart
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories)
      }]
    }
  });

  // Bar Chart
  if (barChart) barChart.destroy();
  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      datasets: [{
        label: "Monthly Spending",
        data: months
      }]
    }
  });
}

/* Export CSV */
document.getElementById("exportCSV").addEventListener("click", () => {
  let csv = "Title,Amount,Type,Category,Month\n";
  transactions.forEach(t => {
    csv += `${t.title},${t.amount},${t.type},${t.category},${t.month+1}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
});

/* DARK MODE */
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
  
render();