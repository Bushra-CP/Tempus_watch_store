let cropper;
const fileQueue = []; // queue of files to crop
let isCropping = false;
let variantIndex = 1;

const imageToCrop = document.getElementById('imageToCrop');
const cropButton = document.getElementById('cropButton');
const form = document.getElementById('imageForm');
const modal = new bootstrap.Modal(document.getElementById('cropperModal'));

const croppedBlobs = []; // { blob, variantIndex }

// ============================
// Register input for a variant
// ============================
function registerImageInput(vIndex) {
  const imageInput = document.getElementById(`imageInput_${vIndex}`);
  const previewContainer = document.getElementById(
    `previewContainer_${vIndex}`,
  );

  if (!imageInput) return;

  imageInput.addEventListener('change', (e) => {
    const newFiles = Array.from(e.target.files);
    newFiles.forEach((file) => {
      fileQueue.push({ file, variantIndex: vIndex }); // keep track of which variant
    });

    imageInput.value = ''; // allow selecting same file again
    if (!isCropping) {
      startCropping();
    }
  });
}

// ============================
// Start Cropping from Queue
// ============================
function startCropping() {
  if (fileQueue.length === 0) {
    isCropping = false;
    return;
  }
  isCropping = true;

  const { file, variantIndex } = fileQueue.shift(); // get file + its variant index
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

      // Remember which variant this crop belongs to
      cropButton.dataset.variantIndex = variantIndex;
    };
  };
  reader.readAsDataURL(file);
}

// ============================
// Crop button handler
// ============================
cropButton.addEventListener('click', () => {
  if (!cropper) return;
  const vIndex = cropButton.dataset.variantIndex;
  const previewContainer = document.getElementById(
    `previewContainer_${vIndex}`,
  );

  const canvas = cropper.getCroppedCanvas({ width: 300, height: 300 });

  canvas.toBlob((blob) => {
    croppedBlobs.push({ blob, variantIndex: vIndex });

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

    startCropping(); // process next file in queue
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

// ============================
// Add Variant
// ============================
function addVariant() {
  const container = document.getElementById('variants-container');
  const newVariant = container.firstElementChild.cloneNode(true);

  // Update names & ids
  newVariant.querySelectorAll('input, select, textarea, p').forEach((el) => {
    if (el.name) {
      el.name = el.name.replace(/\[\d+\]/, `[${variantIndex}]`);
      if (el.type !== 'select-one') el.value = '';
    }
    if (el.id) {
      el.id = el.id.replace(/_\d+_/, `_${variantIndex}_`);
    }
    if (el.tagName.toLowerCase() === 'p') {
      el.innerHTML = '';
    }
    if (el.type === 'file') {
      el.value = '';
      el.id = `imageInput_${variantIndex}`;
    }
  });

  // Reset preview container
  const preview = newVariant.querySelector('[id^="previewContainer"]');
  if (preview) {
    preview.id = `previewContainer_${variantIndex}`;
    preview.innerHTML = '';
  }

  container.appendChild(newVariant);

  // ✅ Hook cropping logic to this new input
  registerImageInput(variantIndex);

  variantIndex++;
}

// ============================
// Initial registration (first variant)
// ============================
registerImageInput(0);

// Override form submit
form.addEventListener('submit', (e) => {
  // FORM VALIDATION  //

  let valid = true;

  // =====================
  // Product-level validation
  // =====================
  const productName = document.getElementById('productName').value.trim();
  const brand = document.getElementById('brand').value.trim();

  if (!productName) {
    document.getElementById('errProductName').innerHTML =
      'Product name should be given';
    valid = false;
  } else {
    document.getElementById('errProductName').innerHTML = '';
  }

  if (!brand) {
    document.getElementById('errBrand').innerHTML =
      'Brand name should be given';
    valid = false;
  } else {
    document.getElementById('errBrand').innerHTML = '';
  }

  // =====================
  // Variant-level validation (loop through all variants)
  // =====================
  const variants = document.querySelectorAll('#variants-container .variant');

  variants.forEach((variant, index) => {
    const strapMaterial = variant
      .querySelector(`[name="variants[${index}][strapMaterial]"]`)
      .value.trim();
    const strapColor = variant
      .querySelector(`[name="variants[${index}][strapColor]"]`)
      .value.trim();
    const dialColor = variant
      .querySelector(`[name="variants[${index}][dialColor]"]`)
      .value.trim();
    const caseSize = variant
      .querySelector(`[name="variants[${index}][caseSize]"]`)
      .value.trim();
    const caseMaterial = variant
      .querySelector(`[name="variants[${index}][caseMaterial]"]`)
      .value.trim();
    const stockQuantity = variant
      .querySelector(`[name="variants[${index}][stockQuantity]"]`)
      .value.trim();
    const actualPrice = variant
      .querySelector(`[name="variants[${index}][actualPrice]"]`)
      .value.trim();
    const offerPrice = variant
      .querySelector(`[name="variants[${index}][offerPrice]"]`)
      .value.trim();
    const skuCode = variant
      .querySelector(`[name="variants[${index}][skuCode]"]`)
      .value.trim();

    if (!strapMaterial) {
      document.getElementById(`errVariants_${index}_strapMaterial`).innerHTML =
        'Strap Material is required';
      valid = false;
    }

    if (!strapColor) {
      document.getElementById(`errVariants_${index}_strapColor`).innerHTML =
        'Strap Color is required';
      valid = false;
    }

    if (!dialColor) {
      document.getElementById(`errVariants_${index}_dialColor`).innerHTML =
        'Dial Color is required';
      valid = false;
    }

    if (!caseSize || isNaN(caseSize) || caseSize <= 0) {
      document.getElementById(`errVariants_${index}_caseSize`).innerHTML =
        'Case Size must be a positive number';
      valid = false;
    }

    if (!caseMaterial) {
      document.getElementById(`errVariants_${index}_caseMaterial`).innerHTML =
        'Case Material is required';
      valid = false;
    }

    if (!stockQuantity || isNaN(stockQuantity) || stockQuantity < 0) {
      document.getElementById(`errVariants_${index}_stockQuantity`).innerHTML =
        'Stock Quantity must be a valid number';
      valid = false;
    }

    if (!actualPrice || isNaN(actualPrice) || actualPrice <= 0) {
      document.getElementById(`errVariants_${index}_actualPrice`).innerHTML =
        'Actual Price must be a positive number';
      valid = false;
    }

    if (!offerPrice || isNaN(offerPrice) || offerPrice <= 0) {
      document.getElementById(`errVariants_${index}_offerPrice`).innerHTML =
        'Offer Price must be a positive number';
      valid = false;
    }

    if (!skuCode) {
      document.getElementById(`errVariants_${index}_skuCode`).innerHTML =
        'SKU Code is required';
      valid = false;
    }
  });

  if (!valid) {
    e.preventDefault();
    return;
  }

  // FORM VALIDATION  //

  // =====================
  // FormData & fetch submission 👇
  // =====================

  // 👉 Before submitting, add cropped blobs as hidden file inputs
  croppedBlobs.forEach(({ blob, variantIndex }, i) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.name = `images_variant_${variantIndex}[]`;

    // 🪄 Hack: create a DataTransfer to attach Blob to input
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(
      new File([blob], `cropped_${i}.jpg`, { type: 'image/jpeg' }),
    );
    fileInput.files = dataTransfer.files;

    fileInput.style.display = 'none';
    form.appendChild(fileInput);
  });

  // ✅ Now let the form submit normally → backend will get req.files
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
