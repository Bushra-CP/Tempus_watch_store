document.querySelectorAll('.removeCoupon').forEach((btn) => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const couponId = btn.dataset.couponId;

    // Ask for confirmation first
    const confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to remove this coupon?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel',
    });

    if (confirmation.isConfirmed) {
      try {
        const response = await fetch('/admin/coupons/remove', {
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
  });
});

document.querySelectorAll('.deactivateCoupon').forEach((btn) => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const couponId = btn.dataset.couponId;

    // Ask for confirmation first
    const confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to deactivate this coupon?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes!',
      cancelButtonText: 'Cancel',
    });

    if (confirmation.isConfirmed) {
      try {
        const response = await fetch('/admin/coupons/deactivate', {
          method: 'PATCH',
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
  });
});

document.querySelectorAll('.activateCoupon').forEach((btn) => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const couponId = btn.dataset.couponId;

    // Ask for confirmation first
    const confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to activate this coupon?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes!',
      cancelButtonText: 'Cancel',
    });

    if (confirmation.isConfirmed) {
      try {
        const response = await fetch('/admin/coupons/activate', {
          method: 'PATCH',
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
  });
});
