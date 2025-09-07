let btn = document.getElementById('addToCartButton');
btn.addEventListener('click', async (e) => {
  e.preventDefault();
  const productId = btn.dataset.productId;
  const variantId = btn.dataset.variantId;
  const price=btn.dataset.variantPrice;
  const quantity = document.getElementById('quantity').value;

  try {
    const response = await fetch('/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        variantId,
        price,
        quantity,
      }),
    });

    const result = await response.json();
    console.log('Cart response:', result);

    if (!result.success) {
      Swal.fire({
        icon: 'error',
        text: result.message || 'Something went wrong',
      }).then(() => {
        if (result.redirect) {
          window.location.href = result.redirect;
        }
      });
    } else if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: result.message || 'Item added to cart',
        timer: 1500, // auto-close after 1.5s
        showConfirmButton: false,
      });
    }
  } catch (error) {
    console.log('Error:', error);
  }
});
