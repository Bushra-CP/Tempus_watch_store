document.addEventListener('DOMContentLoaded', () => {
  const zoomScale = 2; // how much to zoom
  const containers = document.querySelectorAll('.zoom-container');

  containers.forEach((container) => {
    const img = container.querySelector('img');

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;

      img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
      img.style.transform = `scale(${zoomScale})`;
    });

    container.addEventListener('mouseleave', () => {
      img.style.transform = 'scale(1)';
      img.style.transformOrigin = 'center center';
    });
  });
});

// WISHLIST BUTTON
const wishlistBtn = document.getElementById('wishlistBtn');
const wishlistIcon = document.getElementById('wishlistIcon');

const addedToastEl = document.getElementById('wishlistAddedToast');
const removedToastEl = document.getElementById('wishlistRemovedToast');

const addedToast = new bootstrap.Toast(addedToastEl);
const removedToast = new bootstrap.Toast(removedToastEl);

wishlistBtn.addEventListener('click', function (e) {
  e.preventDefault();

  if (wishlistIcon.classList.contains('fa-regular')) {
    // Change to solid heart (added)
    wishlistIcon.classList.remove('fa-regular');
    wishlistIcon.classList.add('fa-solid', 'text-danger');
    addedToast.show();
  } else {
    // Change back to outline heart (removed)
    wishlistIcon.classList.remove('fa-solid', 'text-danger');
    wishlistIcon.classList.add('fa-regular');
    removedToast.show();
  }
});
// WISHLIST BUTTON
