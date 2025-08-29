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

// Add newly selected files to the queue
imageInput.addEventListener('change', (e) => {
  const newFiles = Array.from(e.target.files);
  fileQueue.push(...newFiles);
  imageInput.value = ''; // allow selecting same file again
  if (!isCropping) {
    startCropping();
  }
});

// ============================
// Start Cropping from Queue
// ============================
function startCropping() {
  if (fileQueue.length === 0) {
    isCropping = false;
    return;
  }
  isCropping = true;
  const file = fileQueue.shift(); // take the first file from queue
  const reader = new FileReader();
  reader.onload = function (evt) {
    imageToCrop.src = evt.target.result;
    imageToCrop.onload = function () {
      if (cropper) cropper.destroy();
      cropper = new Cropper(imageToCrop, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1, // crop area uses full image initially
        responsive: true, // resize correctly
        zoomOnWheel: true, // allow zooming with mouse wheel
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

  // Convert to Blob and store
  canvas.toBlob((blob) => {
    croppedBlobs.push(blob);

    // Thumbnail preview
    const img = document.createElement('img');
    img.src = URL.createObjectURL(blob);
    img.className = 'thumb img-thumbnail';
    img.style.width = '140px'; // set width
    img.style.height = '140px'; // set height
    img.style.objectFit = 'cover'; // keep aspect ratio & crop nicely
    previewContainer.appendChild(img);

    modal.hide();
    cropper.destroy();
    cropper = null;

    // Start cropping next file in queue
    startCropping();
  }, 'image/jpeg');
});

// ============================
// Cancel cropping → skip file
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

// Override form submit
form.addEventListener('submit', (e) => {
  // FORM VALIDATION  //

  let valid = true;

  // =====================
  // Variant-level validation (loop through all variants)
  // =====================
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
  const offerPrice = variant.querySelector('[name="offerPrice"]').value.trim();

  if (!strapMaterial) {
    document.getElementById('err_strapMaterial').innerHTML =
      'Strap Material is required';
    valid = false;
  }

  if (!strapColor) {
    document.getElementById('err_strapColor').innerHTML =
      'Strap Color is required';
    valid = false;
  }

  if (!dialColor) {
    document.getElementById('err_dialColor').innerHTML =
      'Dial Color is required';
    valid = false;
  }

  if (!caseSize || isNaN(caseSize) || caseSize <= 0) {
    document.getElementById('err_caseSize').innerHTML =
      'Case Size must be a positive number';
    valid = false;
  }

  if (!caseMaterial) {
    document.getElementById('err_caseMaterial').innerHTML =
      'Case Material is required';
    valid = false;
  }

  if (!stockQuantity || isNaN(stockQuantity) || stockQuantity < 0) {
    document.getElementById('err_stockQuantity').innerHTML =
      'Stock Quantity must be a valid number';
    valid = false;
  }

  if (!actualPrice || isNaN(actualPrice) || actualPrice <= 0) {
    document.getElementById('err_actualPrice').innerHTML =
      'Actual Price must be a positive number';
    valid = false;
  }

  if (!offerPrice || isNaN(offerPrice) || offerPrice <= 0) {
    document.getElementById('err_offerPrice').innerHTML =
      'Offer Price must be a positive number';
    valid = false;
  }

  if (!valid) {
    e.preventDefault();
    return;
  }

  // FORM VALIDATION  //

  // =====================
  // FormData & fetch submission 👇
  // =====================

  // Attach cropped blobs
  croppedBlobs.forEach((blob, i) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.name = 'images_variant[]';

    const dt = new DataTransfer();
    dt.items.add(new File([blob], `cropped_${i}.jpg`, { type: 'image/jpeg' }));
    input.files = dt.files;

    input.style.display = 'none';
    form.appendChild(input);
  });

  // Debug: log what the browser will send
  const fd = new FormData(form);
  for (const [k, v] of fd.entries()) {
    console.log(k, v instanceof File ? `${v.name} (${v.size} bytes)` : v);
  }
});

// ============================
// Reset Handler
// ============================
form.addEventListener('reset', () => {
  setTimeout(() => {
    // Clear all preview containers
    document
      .querySelectorAll('[id^="previewContainer_"]')
      .forEach((container) => {
        container.innerHTML = '';
      });

    // Reset arrays & state
    croppedBlobs.length = 0;
    fileQueue.length = 0;
    isCropping = false;

    // Destroy cropper if open
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }

    // Clear all error messages inside <p>
    document.querySelectorAll('.errorMsg').forEach((p) => {
      p.innerText = '';
    });
  }, 0);
});
