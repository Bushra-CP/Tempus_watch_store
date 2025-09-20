// Demo wallet state
let balance = 2450.0;
const tx = [
  {
    date: '2025-09-12 10:20',
    type: 'Credit',
    details: 'Referral bonus',
    amount: +300,
    status: 'Success',
  },
  {
    date: '2025-09-10 16:05',
    type: 'Debit',
    details: 'Order #W-1824',
    amount: -450,
    status: 'Success',
  },
  {
    date: '2025-09-07 09:33',
    type: 'Credit',
    details: 'Added via card',
    amount: +500,
    status: 'Success',
  },
];

// Elements
const balanceEl = document.getElementById('balance');
const txTable = document.getElementById('txTable');
const emptyState = document.getElementById('emptyState');
const toastEl = document.getElementById('mainToast');
const toastMsg = document.getElementById('toastMsg');

function showToast(message) {
  toastMsg.textContent = message;
  const t = new bootstrap.Toast(toastEl, { delay: 1700 });
  t.show();
}

function formatCurrency(v) {
  return '₹ ' + v.toFixed(2);
}

function updateBalance() {
  balanceEl.textContent = formatCurrency(balance);
}

function renderTx() {
  txTable.innerHTML = '';
  if (tx.length === 0) {
    emptyState.classList.remove('d-none');
    return;
  } else {
    emptyState.classList.add('d-none');
  }
  tx.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
          <td>${row.date}</td>
          <td>${row.type}</td>
          <td>${row.details}</td>
          <td class="text-end ${row.amount > 0 ? 'text-success' : 'text-danger'}">
            ${row.amount > 0 ? '+' : ''}${formatCurrency(Math.abs(row.amount))}
          </td>
          <td>
            <span class="badge ${row.amount > 0 ? 'badge-soft-success' : 'badge-soft-danger'}">${row.status}</span>
          </td>
        `;
    txTable.appendChild(tr);
  });
}

function addTransaction(type, details, amount) {
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
  tx.unshift({ date: now, type, details, amount, status: 'Success' });
  renderTx();
}

// Quick actions
document.getElementById('add500').addEventListener('click', () => {
  balance += 500;
  addTransaction('Credit', 'Quick add', +500);
  updateBalance();
  showToast('Added ₹500');
});

document.getElementById('add1000').addEventListener('click', () => {
  balance += 1000;
  addTransaction('Credit', 'Quick add', +1000);
  updateBalance();
  showToast('Added ₹1000');
});

document.getElementById('withdraw200').addEventListener('click', () => {
  if (balance < 200) return showToast('Insufficient balance');
  balance -= 200;
  addTransaction('Debit', 'Quick withdraw', -200);
  updateBalance();
  showToast('Withdrew ₹200');
});

// Add modal
document.getElementById('addForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const amt = Math.max(
    1,
    Number(document.getElementById('addAmount').value || 0),
  );
  balance += amt;
  addTransaction('Credit', 'Added to wallet', +amt);
  updateBalance();
  showToast('Added ' + formatCurrency(amt));
  bootstrap.Modal.getInstance(document.getElementById('addModal')).hide();
  e.target.reset();
});

// Withdraw modal
document.getElementById('withdrawForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const amt = Math.max(
    1,
    Number(document.getElementById('withdrawAmount').value || 0),
  );
  if (balance < amt) {
    showToast('Insufficient balance');
    return;
  }
  balance -= amt;
  addTransaction('Debit', 'Withdraw to bank', -amt);
  updateBalance();
  showToast('Withdrew ' + formatCurrency(amt));
  bootstrap.Modal.getInstance(document.getElementById('withdrawModal')).hide();
  e.target.reset();
});

// Export CSV
document.getElementById('exportCSV').addEventListener('click', () => {
  const header = ['Date', 'Type', 'Details', 'Amount', 'Status'].join(',');
  const rows = tx.map((r) =>
    [r.date, r.type, r.details, (r.amount > 0 ? '+' : '') + r.amount, r.status]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  );
  const csv = [header].concat(rows).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wallet-transactions.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Exported transactions');
});

// Init
updateBalance();
renderTx();
(function () {
  function c() {
    var b = a.contentDocument || a.contentWindow.document;
    if (b) {
      var d = b.createElement('script');
      d.innerHTML =
        "window.__CF$cv$params={r:'9815f7600037c6aa',t:'MTc1ODI1MjIyNi4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
      b.getElementsByTagName('head')[0].appendChild(d);
    }
  }
  if (document.body) {
    var a = document.createElement('iframe');
    a.height = 1;
    a.width = 1;
    a.style.position = 'absolute';
    a.style.top = 0;
    a.style.left = 0;
    a.style.border = 'none';
    a.style.visibility = 'hidden';
    document.body.appendChild(a);
    if ('loading' !== document.readyState) c();
    else if (window.addEventListener)
      document.addEventListener('DOMContentLoaded', c);
    else {
      var e = document.onreadystatechange || function () {};
      document.onreadystatechange = function (b) {
        e(b);
        'loading' !== document.readyState &&
          ((document.onreadystatechange = e), c());
      };
    }
  }
})();
