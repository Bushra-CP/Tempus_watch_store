const refInput = document.getElementById('refInput');
const copyBtn = document.getElementById('copyBtn');
const toastEl = document.getElementById('mainToast');
const toastMsg = document.getElementById('toastMsg');

function showToast(message) {
  toastMsg.textContent = message;
  const toast = new bootstrap.Toast(toastEl, { delay: 1700 });
  toast.show();
}

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(refInput.value);
    showToast('Referral code copied!');
  } catch {
    refInput.select();
    document.execCommand('copy');
    showToast('Link copied!');
  }
});
