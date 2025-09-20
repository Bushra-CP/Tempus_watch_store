document.querySelectorAll('.removeOffer').forEach((btn) => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const offerId = btn.dataset.offerId;

    // Ask for confirmation first
    const confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to remove this offer?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel',
    });

    if (confirmation.isConfirmed) {
      try {
        const response = await fetch('/admin/categoryOffers/removeOffer', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offerId }),
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


document.querySelectorAll('.deactivateOffer').forEach((btn) => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const offerId = btn.dataset.offerId;

    // Ask for confirmation first
    const confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to deactivate this offer?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes!',
      cancelButtonText: 'Cancel',
    });

    if (confirmation.isConfirmed) {
      try {
        const response = await fetch('/admin/categoryOffers/deactivateOffer', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offerId }),
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


document.querySelectorAll('.activateOffer').forEach((btn) => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const offerId = btn.dataset.offerId;

    // Ask for confirmation first
    const confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to activate this offer?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes!',
      cancelButtonText: 'Cancel',
    });

    if (confirmation.isConfirmed) {
      try {
        const response = await fetch('/admin/categoryOffers/activateOffer', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offerId }),
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
