document.addEventListener('DOMContentLoaded', () => {
  const copyButtons = document.querySelectorAll('.copy');
  const toastEl = document.getElementById('mainToast1');
  const toastMsg = document.getElementById('toastMsg');
  const toast = new bootstrap.Toast(toastEl, { delay: 2000 });

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const code = btn.getAttribute('data-code');

      try {
        await navigator.clipboard.writeText(code);
        toastMsg.textContent = `Coupon code "${code}" copied!`;
        toast.show();
      } catch (err) {
        console.error('Failed to copy:', err);

        // fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        toastMsg.textContent = `Coupon code "${code}" copied!`;
        toast.show();
      }
    });
  });
});
