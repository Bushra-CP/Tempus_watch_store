let cropper;
const fileQueue = []; // queue of files to crop
let isCropping = false;

const imageToCrop = document.getElementById('imageToCrop');
const cropButton = document.getElementById('cropButton');
const form = document.getElementById('imageForm');
const modal = new bootstrap.Modal(document.getElementById('cropperModal'));
const imageInput = document.getElementById('imageInput');
const previewContainer = document.getElementById('previewContainer');

const croppedBlobs = []; // store cropped images as blobs

// ============================
// Add selected files to queue
// ============================
imageInput.addEventListener('change', (e) => {
  const newFiles = Array.from(e.target.files);
  fileQueue.push(...newFiles);
  imageInput.value = ''; // allow reselecting same file
  if (!isCropping) {
    startCropping();
  }
});

// ============================
// Start Cropping
// ============================
function startCropping() {
  if (fileQueue.length === 0) {
    isCropping = false;
    return;
  }
  isCropping = true;

  const file = fileQueue.shift();
  const reader = new FileReader();

  reader.onload = function (evt) {
    imageToCrop.src = evt.target.result;
    imageToCrop.onload = function () {
      if (cropper) cropper.destroy();
      cropper = new Cropper(imageToCrop, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1,
        responsive: true,
        zoomOnWheel: true,
      });
      modal.show();
    };
  };
  reader.readAsDataURL(file);
}

// ============================
// Crop button handler
// ============================
cropButton.addEventListener('click', () => {
  if (!cropper) return;
  const canvas = cropper.getCroppedCanvas({ width: 300, height: 300 });

  canvas.toBlob((blob) => {
    croppedBlobs.push(blob);

    // Thumbnail preview
    const img = document.createElement('img');
    img.src = URL.createObjectURL(blob);
    img.className = 'thumb img-thumbnail';
    img.style.width = '140px';
    img.style.height = '140px';
    img.style.objectFit = 'cover';
    previewContainer.appendChild(img);

    modal.hide();
    cropper.destroy();
    cropper = null;
    startCropping();
  }, 'image/jpeg');
});

// ============================
// Cancel cropping (skip file)
// ============================
document
  .querySelector('#cropperModal .btn-secondary')
  .addEventListener('click', () => {
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    startCropping();
  });

// ============================
// Form Submit (with validation)
// ============================
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // prevent default HTML form submit

  let valid = true;

  const variant = document.querySelector('#variants-container .variant');
  const strapMaterial = variant
    .querySelector('[name="strapMaterial"]')
    .value.trim();
  const strapColor = variant.querySelector('[name="strapColor"]').value.trim();
  const dialColor = variant.querySelector('[name="dialColor"]').value.trim();
  const caseSize = variant.querySelector('[name="caseSize"]').value.trim();
  const caseMaterial = variant
    .querySelector('[name="caseMaterial"]')
    .value.trim();
  const stockQuantity = variant
    .querySelector('[name="stockQuantity"]')
    .value.trim();
  const actualPrice = variant
    .querySelector('[name="actualPrice"]')
    .value.trim();

  // simple validation
  if (!strapMaterial) {
    document.getElementById('err_strapMaterial').innerText =
      'Strap Material is required';
    valid = false;
  }
  if (!strapColor) {
    document.getElementById('err_strapColor').innerText =
      'Strap Color is required';
    valid = false;
  }
  if (!dialColor) {
    document.getElementById('err_dialColor').innerText =
      'Dial Color is required';
    valid = false;
  }
  if (!caseSize || isNaN(caseSize) || caseSize <= 0) {
    document.getElementById('err_caseSize').innerText =
      'Case Size must be positive';
    valid = false;
  }
  if (!caseMaterial) {
    document.getElementById('err_caseMaterial').innerText =
      'Case Material is required';
    valid = false;
  }
  if (!stockQuantity || isNaN(stockQuantity) || stockQuantity < 0) {
    document.getElementById('err_stockQuantity').innerText =
      'Stock Quantity must be valid';
    valid = false;
  }
  if (!actualPrice || isNaN(actualPrice) || actualPrice <= 0) {
    document.getElementById('err_actualPrice').innerText =
      'Actual Price must be positive';
    valid = false;
  }

  if (!valid) return;

  // ============================
  // Prepare FormData manually
  // ============================
  const fd = new FormData(form);

  // Append cropped blobs directly
  croppedBlobs.forEach((blob, i) => {
    fd.append('images_variant[]', blob, `cropped_${i}.jpg`);
  });

  // Debug
  for (const [k, v] of fd.entries()) {
    console.log(k, v instanceof File ? `${v.name} (${v.size} bytes)` : v);
  }

  // ============================
  // Submit using fetch
  // ============================
  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: fd,
    });

    const result = await res.json();
    if (result.success) {
      form.reset();
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
      alert('Error: ' + (result.message || 'Upload failed'));
    }
  } catch (err) {
    console.error(err);
    alert('Something went wrong while uploading.');
  }
});

// ============================
// Reset Handler
// ============================
form.addEventListener('reset', () => {
  setTimeout(() => {
    previewContainer.innerHTML = '';
    croppedBlobs.length = 0;
    fileQueue.length = 0;
    isCropping = false;

    if (cropper) {
      cropper.destroy();
      cropper = null;
    }

    document.querySelectorAll('.errorMsg').forEach((p) => (p.innerText = ''));
  }, 0);
});
