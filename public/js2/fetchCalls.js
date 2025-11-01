///REMOVE IMAGE IN EDIT VARIANT///
async function removeImage(productId, variantId, index) {
  const result = await Swal.fire({
    text: 'Do you want to remove this image?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, remove',
    cancelButtonText: 'No, cancel',
  });

  if (result.isConfirmed) {
    const res = await fetch(
      `/admin/products/variant/removeImage?productId=${productId}&variantId=${variantId}&index=${index}`,
      {
        method: 'DELETE',
      },
    );

    if (res.ok) {
      location.reload(); // refresh page after delete
    } else {
      alert('Failed to remove image');
    }
  } else {
    return;
  }
}
///REMOVE IMAGE IN EDIT VARIANT///

///LIST AND UNLIST PRODUCT///
async function unlistProduct(event, productName, url) {
  event.preventDefault(); // stop link from navigating immediately

  const result = await Swal.fire({
    title: 'Confirm Deactivation',
    text: `Do you want to unlist "${productName}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, unlist',
    cancelButtonText: 'No, cancel',
  });

  if (result.isConfirmed) {
    window.location.href = url; // proceed only after confirmation
  }
}

async function listProduct(event, productName, url) {
  event.preventDefault(); // stop link from navigating immediately

  const result = await Swal.fire({
    title: 'Confirm Activation',
    text: `Do you want to list "${productName}"?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, list',
    cancelButtonText: 'No, cancel',
  });

  if (result.isConfirmed) {
    window.location.href = url; // proceed only after confirmation
  }
}
///LIST AND UNLIST PRODUCT///

///UNLIST AND LIST VARIANT///
async function unlistVariant(variantId) {
  const result = await Swal.fire({
    title: 'Confirm Unlist',
    text: 'Do you really want to unlist this variant?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, unlist',
    cancelButtonText: 'No, cancel',
  });

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(
      `/admin/products/variant/unlist?id=${variantId}`,
      {
        method: 'PATCH',
      },
    );

    const data = await response.json();

    if (response.ok && data.success) {
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: data.message,
        timer: 1500,
        showConfirmButton: false,
      });
      location.reload(); // Refresh after success
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: data.message || 'Something went wrong!',
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'Failed to unlist variant', 'error');
  }
}

async function listVariant(variantId) {
  const result = await Swal.fire({
    title: 'Confirm List',
    text: 'Do you really want to list this variant?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, list',
    cancelButtonText: 'No, cancel',
  });

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(
      `/admin/products/variant/list?id=${variantId}`,
      {
        method: 'PATCH',
      },
    );

    const data = await response.json();

    if (response.ok && data.success) {
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: data.message,
        timer: 1500,
        showConfirmButton: false,
      });
      location.reload();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: data.message || 'Something went wrong!',
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'Failed to list variant', 'error');
  }
}
///UNLIST AND LIST VARIANT///
