///REMOVE IMAGE IN EDIT VARIANT///
async function removeImage(productId, variantId, index) {
  const confirmation = await Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to remove this image?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, remove it!',
    cancelButtonText: 'Cancel',
  });

  if (confirmation.isConfirmed) {
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
  }
}
///REMOVE IMAGE IN EDIT VARIANT///

///REPLACE IMAGE IN EDIT VARIANT///
async function replaceImage(productId, variantId, index) {
  // Confirm before replacing
  const confirmation = await Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to replace this image?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, replace it!',
    cancelButtonText: 'Cancel',
  });

  if (!confirmation.isConfirmed) return;

  // Create a hidden file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.click();

  // When user selects a file
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    //Show crop modal
    const reader = new FileReader();
    reader.onload = function (event) {
      const image = document.getElementById('imageToCrop');
      image.src = event.target.result;

      // Destroy old cropper instance if exists
      if (cropper) cropper.destroy();

      // Create new cropper
      cropper = new Cropper(image, {
        aspectRatio: 1, // adjust (e.g., 4/3 or 16/9)
        viewMode: 2,
        autoCropArea: 1,
      });

      // Show modal
      const modal = new bootstrap.Modal(
        document.getElementById('cropperModal'),
      );
      modal.show();

      // Handle crop button click
      const cropBtn = document.getElementById('cropButton');
      cropBtn.onclick = async function () {
        const canvas = cropper.getCroppedCanvas({ width: 600, height: 600 }); // adjust size
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg'),
        );

        const formData = new FormData();
        formData.append('image', blob, 'cropped.jpg');
        formData.append('productId', productId);
        formData.append('variantId', variantId);
        formData.append('index', index);

        const res = await fetch('/admin/products/variant/replaceImage', {
          method: 'PATCH',
          body: formData,
        });

        modal.hide(); // close modal

        if (res.ok) {
          Swal.fire('Replaced!', 'Image successfully replaced.', 'success');
          location.reload();
        } else {
          Swal.fire('Error!', 'Failed to replace image.', 'error');
        }
      };
    };

    reader.readAsDataURL(file);
  };
}

///REPLACE IMAGE IN EDIT VARIANT///

///UNLIST VARIANT///
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

  const res = await fetch(`/admin/products/variant/unlist?id=${variantId}`, {
    method: 'PATCH',
  });

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

  const res = await fetch(`/admin/products/variant/list?id=${variantId}`, {
    method: 'PATCH',
  });

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
///UNLIST VARIANT///
