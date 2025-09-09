document.querySelectorAll('.selectAddress').forEach((a) => {
  a.addEventListener('click', async (e) => {
    e.preventDefault();

    let addressId = a.dataset.addressId;

    try {
      const response = await fetch(
        `/checkout/getSelectedAddressId?id=${addressId}`,
      );
      const result = await response.json();

      if (result.success) {
        console.log('Address updated:', result.addressId);
        // highlight selected address in UI here
      }
    } catch (err) {
      console.error('Error updating address:', err);
    }
  });
});

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
let btn = document.getElementById('placeOrder');
btn.addEventListener('click', async (e) => {
  e.preventDefault();

  try {
    const response = await fetch('/checkout/placeOrder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();
    console.log('Checkout response:', result);

    if (result.success) {
      Swal.fire({
        icon: 'success',
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
