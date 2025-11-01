let cropper;
const fileQueue = []; // queue of files to crop
let isCropping = false;
let variantIndex = 1;

const imageToCrop = document.getElementById('imageToCrop');
const cropButton = document.getElementById('cropButton');
const form = document.getElementById('imageForm');
const modal = new bootstrap.Modal(document.getElementById('cropperModal'));

const croppedBlobs = []; // { blob, variantIndex }
const variantImages = new Map(); // variantIndex:number -> Blob[]

// ============================
// Register input for a variant
// ============================
function registerImageInput(vIndex) {
  const imageInput = document.getElementById(`imageInput_${vIndex}`);
  const previewContainer = document.getElementById(`previewContainer_${vIndex}`);
  if (!imageInput) return;

  imageInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    const validTypes = ['image/jpeg', 'image/png']; // allow JPG/PNG
    

    files.forEach((file) => {
      // ✅ validate type
      if (!validTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Only JPG and PNG images are allowed.',
          confirmButtonColor: '#d33',
        });
        return;
      }
      
      // enqueue valid file
      fileQueue.push({ file, variantIndex: vIndex });
    });

    // allow selecting same file again
    imageInput.value = '';
    if (!isCropping) startCropping();
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

  // avoid name clash with the global variantIndex
  const { file, variantIndex: queueVIndex } = fileQueue.shift();
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
      cropButton.dataset.variantIndex = String(queueVIndex);
    };
  };
  reader.readAsDataURL(file);
}

// ============================
// Crop button handler
// ============================
cropButton.addEventListener('click', () => {
  if (!cropper) return;
  const vIndex = Number(cropButton.dataset.variantIndex);
  const previewContainer = document.getElementById(`previewContainer_${vIndex}`);

  const canvas = cropper.getCroppedCanvas({ width: 300, height: 300 });

  canvas.toBlob((blob) => {
    croppedBlobs.push({ blob, variantIndex: vIndex });

    // track per-variant images
    if (!variantImages.has(vIndex)) variantImages.set(vIndex, []);
    variantImages.get(vIndex).push(blob);

    // Thumbnail preview
    const img = document.createElement('img');
    img.src = URL.createObjectURL(blob);
    img.className = 'thumb img-thumbnail';
    img.style.width = '140px';
    img.style.height = '140px';
    img.style.objectFit = 'cover';
    previewContainer.appendChild(img);

    // clear per-variant image error (if any)
    const imgErrEl = document.getElementById(`errVariants_${vIndex}_images`);
    if (imgErrEl) imgErrEl.textContent = '';

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
      // handles ids like errVariants_0_caseSize
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

  // Reset preview container id
  const preview = newVariant.querySelector('[id^="previewContainer"]');
  if (preview) {
    preview.id = `previewContainer_${variantIndex}`;
    preview.innerHTML = '';
  }

  container.appendChild(newVariant);

  // hook cropping logic to this new input
  registerImageInput(variantIndex);

  variantIndex++;
}

// ============================
// Initial registration (first variant)
// ============================
registerImageInput(0);

// ============================
// Override form submit
// ============================
form.addEventListener('submit', (e) => {
  let valid = true;

  // =====================
  // Product-level validation
  // =====================
  const productName = document.getElementById('productName').value.trim();
  const description = document.getElementById('description').value.trim();
  const brand = document.getElementById('brand').value.trim();

  if (!productName) {
    document.getElementById('errProductName').innerHTML = 'Product name should be given';
    valid = false;
  }
  document.getElementById('productName').addEventListener('input', () => {
    document.getElementById('errProductName').innerHTML = '';
  });

  if (!description) {
    document.getElementById('errDescription').innerHTML = 'Description should be given';
    valid = false;
  }
  document.getElementById('description').addEventListener('input', () => {
    document.getElementById('errDescription').innerHTML = '';
  });

  if (!brand) {
    document.getElementById('errBrand').innerHTML = 'Brand name should be given';
    valid = false;
  }
  document.getElementById('brand').addEventListener('input', () => {
    document.getElementById('errBrand').innerHTML = '';
  });

  // =====================
  // Variant-level validation (loop through all variants)
  // =====================
  const variants = document.querySelectorAll('#variants-container .variant');

  variants.forEach((variant, index) => {
    const strapMaterial = variant.querySelector(`[name="variants[${index}][strapMaterial]"]`);
    const strapColor = variant.querySelector(`[name="variants[${index}][strapColor]"]`);
    const dialColor = variant.querySelector(`[name="variants[${index}][dialColor]"]`);
    const caseSize = variant.querySelector(`[name="variants[${index}][caseSize]"]`);
    const caseMaterial = variant.querySelector(`[name="variants[${index}][caseMaterial]"]`);
    const stockQuantity = variant.querySelector(`[name="variants[${index}][stockQuantity]"]`);
    const actualPrice = variant.querySelector(`[name="variants[${index}][actualPrice]"]`);
    const skuCode = variant.querySelector(`[name="variants[${index}][skuCode]"]`);

    // clear-on-type listeners
    [
      { el: strapMaterial, errId: `errVariants_${index}_strapMaterial` },
      { el: strapColor, errId: `errVariants_${index}_strapColor` },
      { el: dialColor, errId: `errVariants_${index}_dialColor` },
      { el: caseSize, errId: `errVariants_${index}_caseSize` },
      { el: caseMaterial, errId: `errVariants_${index}_caseMaterial` },
      { el: stockQuantity, errId: `errVariants_${index}_stockQuantity` },
      { el: actualPrice, errId: `errVariants_${index}_actualPrice` },
      { el: skuCode, errId: `errVariants_${index}_skuCode` },
    ].forEach(({ el, errId }) => {
      if (!el) return;
      el.addEventListener('input', () => {
        const err = document.getElementById(errId);
        if (err) err.innerHTML = '';
      });
    });

    // field validations
    if (!strapMaterial?.value.trim()) {
      document.getElementById(`errVariants_${index}_strapMaterial`).innerHTML = 'Strap Material is required';
      valid = false;
    }
    if (!strapColor?.value.trim()) {
      document.getElementById(`errVariants_${index}_strapColor`).innerHTML = 'Strap Color is required';
      valid = false;
    }
    if (!dialColor?.value.trim()) {
      document.getElementById(`errVariants_${index}_dialColor`).innerHTML = 'Dial Color is required';
      valid = false;
    }
    if (!caseSize?.value.trim() || isNaN(caseSize.value) || Number(caseSize.value) <= 0) {
      document.getElementById(`errVariants_${index}_caseSize`).innerHTML = 'Case Size must be a positive number';
      valid = false;
    }
    if (!caseMaterial?.value.trim()) {
      document.getElementById(`errVariants_${index}_caseMaterial`).innerHTML = 'Case Material is required';
      valid = false;
    }
    if (!stockQuantity?.value.trim() || isNaN(stockQuantity.value) || Number(stockQuantity.value) < 0) {
      document.getElementById(`errVariants_${index}_stockQuantity`).innerHTML = 'Stock Quantity must be a valid number';
      valid = false;
    }
    if (!actualPrice?.value.trim() || isNaN(actualPrice.value) || Number(actualPrice.value) <= 0) {
      document.getElementById(`errVariants_${index}_actualPrice`).innerHTML = 'Actual Price must be a positive number';
      valid = false;
    }
    if (!skuCode?.value.trim()) {
      document.getElementById(`errVariants_${index}_skuCode`).innerHTML = 'SKU Code is required';
      valid = false;
    }

    // ✅ per-variant image requirement
    const imgs = variantImages.get(index) || [];
    if (imgs.length === 0) {
      const imgErr = document.getElementById(`errVariants_${index}_images`);
      if (imgErr) imgErr.textContent = 'At least one image is required for this variant';
      valid = false;
    }
  });

  // ❌ Stop form submission if invalid
  if (!valid) {
    e.preventDefault();
    return;
  }

  // =====================
  // Append cropped blobs to form as hidden file inputs
  // =====================
  croppedBlobs.forEach(({ blob, variantIndex }, i) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.name = `images_variant_${variantIndex}[]`;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File([blob], `cropped_${i}.jpg`, { type: blob.type }));
    fileInput.files = dataTransfer.files;

    fileInput.style.display = 'none';
    form.appendChild(fileInput);
  });

  // let the form submit normally → backend gets req.files
});

// ============================
// Reset Handler
// ============================
form.addEventListener('reset', () => {
  setTimeout(() => {
    document.querySelectorAll('[id^="previewContainer_"]').forEach((container) => {
      container.innerHTML = '';
    });

    croppedBlobs.length = 0;
    fileQueue.length = 0;
    isCropping = false;
    variantImages.clear();

    if (cropper) {
      cropper.destroy();
      cropper = null;
    }

    document.querySelectorAll('.errorMsg').forEach((p) => {
      p.innerText = '';
    });
  }, 0);
});
