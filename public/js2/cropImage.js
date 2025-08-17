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
  reader.onload = e => {
    imageToCrop.src = e.target.result;
    modalEl.show();
  };
  reader.readAsDataURL(file);
});

// Step 2: Initialize cropper when modal shown
document.getElementById('cropperModal').addEventListener('shown.bs.modal', () => {
  cropper = new Cropper(imageToCrop, {
    aspectRatio: 1,
    viewMode: 1
  });
});

// Step 3: Crop and replace file input content
cropButton.addEventListener('click', function () {
  cropper.getCroppedCanvas({ width: 300, height: 300 }).toBlob(blob => {
    croppedFile = new File([blob], "cropped.jpg", { type: "image/jpeg" });

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