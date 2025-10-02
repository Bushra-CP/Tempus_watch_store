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



