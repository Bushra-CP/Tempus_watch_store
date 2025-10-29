document.addEventListener('click', async function (e) {
  if (e.target.classList.contains('remove-wishlist')) {
    const productId = e.target.dataset.productId;

    Swal.fire({
      title: 'Remove from wishlist?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch('/wishlist/remove', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId }),
          });
          const result = await response.json();
          if (result.success) {
            Swal.fire('Removed!', result.message, 'success');
            e.target.closest('.col-lg-3').remove(); // remove card from UI
          } else {
            Swal.fire('Error', result.message, 'error');
          }
        } catch (error) {
          console.error(error);
          Swal.fire('Error', 'Something went wrong', 'error');
        }
      }
    });
  }
});
