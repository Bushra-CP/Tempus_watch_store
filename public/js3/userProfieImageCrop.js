let cropper;
let croppedFile;

const imageInput = document.getElementById('profileImageInput');
const imageToCrop = document.getElementById('imageToCrop');
const cropButton = document.getElementById('cropButton');
const croppedPreview = document.getElementById('croppedPreview');
const previewContainer = document.getElementById('previewContainer');
const cropperModalEl = new bootstrap.Modal(
  document.getElementById('cropperModal'),
  {
    focus: false, // disable Bootstrap's focus trap (fixes n[0].focus error)
  },
);

// Step 1: Open crop modal on image select
imageInput.addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    imageToCrop.src = e.target.result;

    // Wait for image load before showing modal
    imageToCrop.onload = () => {
      if (cropper) {
        cropper.destroy();
        cropper = null;
      }

      // Show modal
      cropperModalEl.show();

      // Init cropper AFTER modal fully shown (prevents sizing issues)
      const modalEl = document.getElementById('cropperModal');
      modalEl.addEventListener(
        'shown.bs.modal',
        () => {
          cropper = new Cropper(imageToCrop, {
            aspectRatio: 1,
            viewMode: 1,
            responsive: true,
            autoCropArea: 1,
          });
        },
        { once: true }, // prevent stacking multiple listeners
      );
    };
  };
  reader.readAsDataURL(file);
});

// Step 2: Crop and replace file input content
cropButton.addEventListener('click', function () {
  if (!cropper) return;

  cropper.getCroppedCanvas({ width: 300, height: 300 }).toBlob((blob) => {
    if (!blob) return;

    croppedFile = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });

    // Show preview
    const previewUrl = URL.createObjectURL(croppedFile);
    croppedPreview.src = previewUrl;
    previewContainer.classList.remove('d-none');

    // Replace the file input with cropped image (so multer gets cropped file)
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(croppedFile);
    imageInput.files = dataTransfer.files;

    // Cleanup
    cropper.destroy();
    cropper = null;
    cropperModalEl.hide();
  }, 'image/jpeg');
});

// Step 3: If modal closed without cropping → destroy cropper
document
  .getElementById('cropperModal')
  .addEventListener('hidden.bs.modal', () => {
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
  });

// RESET PREVIEW CONTAINER
document
  .getElementById('editProfileForm')
  .addEventListener('reset', function () {
    const previewContainer = document.getElementById('previewContainer');
    const croppedPreview = document.getElementById('croppedPreview');

    croppedPreview.src = ''; // clear the image
    previewContainer.classList.add('d-none'); // hide preview section
  });
