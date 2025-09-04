let cropper;
let croppedFile;
const imageInput = document.getElementById('profileImageInput');
const imageToCrop = document.getElementById('imageToCrop');
const cropButton = document.getElementById('cropButton');
const croppedPreview = document.getElementById('croppedPreview');
const previewContainer = document.getElementById('previewContainer');
const modalEl = new bootstrap.Modal(document.getElementById('cropperModal'));

// Open cropper modal when selecting image
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

// Initialize cropper each time modal shows
document
  .getElementById('cropperModal')
  .addEventListener('shown.bs.modal', () => {
    cropper = new Cropper(imageToCrop, {
      aspectRatio: 1,
      viewMode: 1,
    });
  });

// Destroy cropper when modal hides (important fix)
document
  .getElementById('cropperModal')
  .addEventListener('hidden.bs.modal', () => {
    cropper?.destroy();
    cropper = null;
  });

// Crop and save
cropButton.addEventListener('click', function () {
  cropper.getCroppedCanvas({ width: 300, height: 300 }).toBlob((blob) => {
    croppedFile = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });

    // Show preview
    const previewUrl = URL.createObjectURL(croppedFile);
    croppedPreview.src = previewUrl;
    previewContainer.classList.remove('d-none');

    // Replace file input
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(croppedFile);
    imageInput.files = dataTransfer.files;

    modalEl.hide();
  }, 'image/jpeg');
});


// RESET PREVIEW CONTAINER
document.getElementById('editProfileForm').addEventListener('reset', function () {
  const previewContainer = document.getElementById('previewContainer');
  const croppedPreview = document.getElementById('croppedPreview');

  croppedPreview.src = ''; // clear the image
  previewContainer.classList.add('d-none'); // hide preview section
});
