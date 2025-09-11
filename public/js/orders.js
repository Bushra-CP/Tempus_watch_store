/////////// Reset form fields when modal is closed ////////////
document.querySelectorAll('.modal').forEach((modal) => {
  modal.addEventListener('hidden.bs.modal', () => {
    const form = modal.querySelector('form');
    if (form) form.reset();

    // Extra: reset rating stars in review modal
    if (modal.id === 'reviewModal') {
      document
        .querySelectorAll('#reviewModal .star-rating i')
        .forEach((star) =>
          star.classList.remove('bi-star-fill', 'text-warning'),
        );
      document
        .querySelectorAll('#reviewModal .star-rating i')
        .forEach((star) => star.classList.add('bi-star'));
      document.getElementById('ratingValue').value = '';
    }
  });
});
/////////// Reset form fields when modal is closed ////////////

/////////// Handle star rating /////////
const stars = document.querySelectorAll('#reviewModal .star-rating i');
const ratingInput = document.getElementById('ratingValue');

stars.forEach((star) => {
  // Hover effect
  star.addEventListener('mouseover', function () {
    let value = this.getAttribute('data-value');
    highlightStars(value);
  });

  // Remove hover when leaving
  star.addEventListener('mouseout', function () {
    highlightStars(ratingInput.value || 0);
  });

  // Click to select / toggle
  star.addEventListener('click', function () {
    let value = this.getAttribute('data-value');
    if (ratingInput.value === value) {
      // If clicking same star again → reset rating
      ratingInput.value = '';
      highlightStars(0);
    } else {
      ratingInput.value = value;
      highlightStars(value);
    }
  });
});

// Function to fill stars up to a given value
function highlightStars(value) {
  stars.forEach((s) => {
    s.classList.remove('bi-star-fill', 'text-warning');
    s.classList.add('bi-star');
  });
  for (let i = 1; i <= value; i++) {
    let starEl = document.querySelector(
      `#reviewModal .star-rating i[data-value="${i}"]`,
    );
    if (starEl) {
      starEl.classList.remove('bi-star');
      starEl.classList.add('bi-star-fill', 'text-warning');
    }
  }
}
/////////// Handle star rating /////////
