let cropper;
let croppedFile;
const imageInput = document.getElementById('categoryImage');
const imageToCrop = document.getElementById('imageToCrop');
const cropButton = document.getElementById('cropButton');
const croppedPreview = document.getElementById('croppedPreview');
const previewContainer = document.getElementById('previewContainer');
const modalEl = new bootstrap.Modal(document.getElementById('cropperModal'));

// Step 1: Open crop modal on image select
imageInput.addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    imageToCrop.src = e.target.result;
    modalEl.show();
  };
  reader.readAsDataURL(file);
});

// Step 2: Initialize cropper when modal shown
document
  .getElementById('cropperModal')
  .addEventListener('shown.bs.modal', () => {
    cropper = new Cropper(imageToCrop, {
      aspectRatio: 1,
      viewMode: 1,
    });
  });

// Step 3: Crop and replace file input content
cropButton.addEventListener('click', function () {
  cropper.getCroppedCanvas({ width: 300, height: 300 }).toBlob((blob) => {
    croppedFile = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });

    // Show preview
    const previewUrl = URL.createObjectURL(croppedFile);
    croppedPreview.src = previewUrl;
    previewContainer.classList.remove('d-none');

    // Replace the file input with cropped image (so multer gets cropped file)
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(croppedFile);
    imageInput.files = dataTransfer.files;

    modalEl.hide();
  }, 'image/jpeg');
});

// ================
// Form validation
// ================
const form = document.getElementById('categoryForm');
const errCategoryName = document.getElementById('errCategoryName');
const errDescription = document.getElementById('errDescription');

form.addEventListener('submit', function (e) {
  let isValid = true;

  const categoryName = document.querySelector('[name="categoryName"]');
  const description = document.querySelector('[name="description"]');
  const imageInput = document.getElementById('categoryImage');

  // Clear old error messages
  errCategoryName.textContent = '';
  errDescription.textContent = '';

  // ✅ Validate Category Name
  if (!categoryName.value.trim()) {
    errCategoryName.textContent = 'Category name is required.';
    isValid = false;
  } else if (categoryName.value.trim().length < 3) {
    errCategoryName.textContent =
      'Category name must be at least 3 characters.';
    isValid = false;
  } 

  document.getElementById('categoryName').addEventListener('input', () => {
    document.getElementById('errCategoryName').innerHTML = '';
  });

  // ✅ Validate Description
  if (!description.value.trim()) {
    errDescription.textContent = 'Description is required.';
    isValid = false;
  } else if (description.value.trim().length < 10) {
    errDescription.textContent = 'Description must be at least 10 characters.';
    isValid = false;
  }

  document.getElementById('description').addEventListener('input', () => {
    document.getElementById('errDescription').innerHTML = '';
  });

  // ✅ Validate Cropped Image
  if (!imageInput.files || imageInput.files.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'Image Required',
      text: 'Please upload and crop an image before submitting.',
      confirmButtonColor: '#d33',
    });
    isValid = false;
  }

  // ❌ Stop form submission if invalid
  if (!isValid) {
    e.preventDefault();
  }
});

//////////////////////////////////
// reset preview when form resets
/////////////////////////////////
document.getElementById('categoryForm').addEventListener('reset', function () {
  const previewContainer = document.getElementById('previewContainer');
  const croppedPreview = document.getElementById('croppedPreview');

  croppedPreview.src = ''; // clear the image
  previewContainer.classList.add('d-none'); // hide preview section

  // Clear all error messages inside <p>
  document.querySelectorAll('.errorMsg').forEach((p) => {
    p.innerText = '';
  });
});
