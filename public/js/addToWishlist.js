document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.wishlistBtn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const productId = btn.dataset.productId;
      const variantId = btn.dataset.variantId;

      try {
        const response = await fetch('/wishlist/add2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId,variantId }),
        });

        const result = await response.json();
        console.log('wishlist response:', result);

        if (!result.success) {
          Swal.fire({
            icon: 'error',
            text: result.message || 'Something went wrong',
          }).then(() => {
            if (result.redirect) {
              window.location.href = result.redirect;
            }
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: result.message || 'Item added to wishlist',
            timer: 1500,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    });
  });
});
