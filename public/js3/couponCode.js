async function applyCode(btn) {
  const couponId = btn.dataset.couponId;
  const cartTotal = btn.dataset.cartTotal;
  try {
    const response = await fetch('/cart/applyCoupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponId, cartTotal }),
    });

    const result = await response.json();

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
    Swal.fire({
      icon: 'error',
      text: 'Request failed',
    });
  }
}

async function removeCoupon(btn) {
  const couponId = btn.dataset.couponId;
  try {
    const response = await fetch('/cart/removeCoupon', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponId }),
    });

    const result = await response.json();

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
    Swal.fire({
      icon: 'error',
      text: 'Request failed',
    });
  }
}

async function applyOtherCodes(btn) {
  const couponCode = document.getElementById('c_code').value.trim();
  const cartTotal = btn.dataset.cartTotal;
  try {
    const response = await fetch('/cart/applyOtherCoupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponCode, cartTotal }),
    });

    const result = await response.json();

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
    Swal.fire({
      icon: 'error',
      text: 'Request failed',
    });
  }
}



async function removeOtherCodes(btn) {
  const couponCode = document.getElementById('c_applied_code').value.trim();
  try {
    const response = await fetch('/cart/removeOtherCoupon', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponCode }),
    });

    const result = await response.json();

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
    Swal.fire({
      icon: 'error',
      text: 'Request failed',
    });
  }
}