document.querySelectorAll('.removeAddress').forEach((btn) => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const addressId = btn.dataset.addressId;

    // Ask for confirmation first
    const confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this address?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (confirmation.isConfirmed) {
      try {
        const response = await fetch('/checkout/removeAddress', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addressId }),
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
