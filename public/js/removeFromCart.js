document.querySelectorAll('.removeFromCart').forEach((btn) => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const userId = btn.dataset.userId;
    const productId = btn.dataset.productId;
    const variantId = btn.dataset.variantId;
    const quantity = btn.dataset.quantity;

    try {
      const response = await fetch('/cart/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, variantId, quantity }),
      });

      const result = await response.json();
      if (result.success) {
        Swal.fire({
          text: result.message,
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          if (result.redirect) {
            window.location.href = result.redirect;
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          text: result.message || 'Something went wrong',
        });
      }
    } catch (error) {
      console.log('Error:', error);
    }
  });
});
