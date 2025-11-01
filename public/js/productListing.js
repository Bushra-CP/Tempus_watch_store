// Get checked values for a filter
function getSelectedValues(name) {
  return Array.from(
    document.querySelectorAll(`input[name='${name}']:checked`),
  ).map((cb) => cb.value);
}

// Build query string for all filters
function buildQuery(page = 1, sort = currentSort) {
  const params = new URLSearchParams();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('search')) {
    params.set('search', urlParams.get('search'));
  }

  [
    'category',
    'brand',
    'price',
    'caseSize',
    'strapColor',
    'dialColor',
    'movement',
  ].forEach((filter) => {
    getSelectedValues(filter).forEach((v) => params.append(filter, v));
  });

  // Only set sort if it's not 'manual'
  if (sort && sort !== 'manual') params.set('sort', sort);

  // Only set page if it's not 1
  if (page && page !== 1) params.set('page', page);

  return params;
}

// Update URL + Fetch products
function fetchProducts(page = 1) {
  const params = buildQuery(page);

  // ✅ update the URL so filters are visible
  window.history.replaceState(
    {},
    '',
    `${window.location.pathname}?${params.toString()}`,
  );

  // ✅ fetch JSON data from backend
  fetch(`/collections?${params.toString()}`, {
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  })
    .then((res) => res.json())
    .then((data) => {
      renderProducts(data.products, data.total, data.wishlist);
      renderPagination(data.totalPages, data.currentPage);
    })
    .catch((err) => console.error('Error fetching products:', err));
}

// Render product grid
function renderProducts(products, total, wishlist = []) {
  const totalContainer = document.getElementById('total-products');
  if (totalContainer) {
    totalContainer.innerText = `${total} Products`;
  }

  const container = document.getElementById('products-container');
  let html = '<div class="row g-3">';

  if (products.length > 0) {
    products.forEach((p) => {
      // Check if product is in wishlist
      const isInWishlist =
        Array.isArray(wishlist) && p._id
          ? wishlist.some(
              (item) =>
                item.productId?.toString() === p._id.toString() ||
                item.items?.productId?.toString() === p._id.toString(),
            )
          : false;

      html += `
        <div class="col-md-4 col-sm-6">
          <div class="product-card mx-4 my-2">
            <div class="product-image">
              <img src="${p.variants?.[0]?.variantImages?.[0] || ''}" 
                   alt="${p.productName || ''}"/>
              <a class="wishlist-btn" href="/wishlist/add?productId=${p._id}&variantId=${p.variants?.[0]?._id}">
                <i class="fa ${isInWishlist ? 'fa-solid active' : 'fa-regular'} fa-heart wishlist-icon"></i>
              </a>
            </div>

            <a href="/collections/${p._id}?variantId=${p.variants?.[0]?._id}" class="text-decoration-none text-dark d-block">
              <div class="product-details">
                <h4>${p.productName || ''}</h4>
                <p class="product-price">
                  Rs. ${p.minPrice || 0}${p.maxPrice && p.maxPrice !== p.minPrice ? ` - Rs. ${p.maxPrice}` : ''}
                </p>
              </div>
            </a>
          </div>
        </div>`;
    });
  } else {
    html += '<p>No products found</p>';
  }

  html += '</div>';
  container.innerHTML = html;
}

// Render pagination
function renderPagination(totalPages, currentPage) {
  const paginationContainer = document.getElementById('pagination');
  if (!paginationContainer) return; // fallback just in case

  let html = '<nav><ul class="pagination">';
  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" onclick="fetchProducts(${i}); return false;">${i}</a>
      </li>`;
  }
  html += '</ul></nav>';

  paginationContainer.innerHTML = html;
}

// Sorting
let currentSort = 'manual';
function setFilter(sort) {
  currentSort = sort;
  fetchProducts(1);
}

// Checkbox events
document.querySelectorAll("input[type='checkbox']").forEach((cb) => {
  cb.addEventListener('change', function () {
    const group = this.name;
    const clearBtn = document.getElementById(`clear-btn_${group}`);
    if (getSelectedValues(group).length > 0) {
      clearBtn.style.display = 'inline-block';
    } else {
      clearBtn.style.display = 'none';
    }
    fetchProducts(1);
  });
});

// Clear buttons
document.querySelectorAll('.clear-btn').forEach((btn) => {
  btn.addEventListener('click', function () {
    const filter = this.dataset.filter;
    document
      .querySelectorAll(`input[name='${filter}']`)
      .forEach((cb) => (cb.checked = false));
    this.style.display = 'none';
    fetchProducts(1);
  });
});

// Restore checkbox states on page load
function restoreCheckboxes() {
  const params = new URLSearchParams(window.location.search);
  document.querySelectorAll("input[type='checkbox']").forEach((box) => {
    const values = params.getAll(box.name);
    if (values.includes(box.value)) {
      box.checked = true;
      const clearBtn = document.getElementById(`clear-btn_${box.name}`);
      if (clearBtn) clearBtn.style.display = 'inline-block';
    }
  });
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  restoreCheckboxes();

  const params = new URLSearchParams(window.location.search);
  if (params.has('search')) {
    // Let the backend handle search results normally
    return;
  }

  // Only fetch products if it's not a search request
  fetchProducts(1);
});
