//ADD CATEGORY OFFER//
document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('.addCategoryOffer');

  forms.forEach((form) => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();


      let isValid = true;

      // Get form elements inside this specific modal
      const offerTitle = form.querySelector('#offerTitle').value.trim();
      const discountType = form.querySelector('#discountType').value;
      const discountValue = form.querySelector('#discountValue').value.trim();
      const startDate = form.querySelector('#startDate').value;
      const endDate = form.querySelector('#endDate').value;

      // Error elements
      const errTitle = form.querySelector('#err_title');
      const errValue = form.querySelector('#err_value');
      const errStart = form.querySelector('#err_startDate');
      const errEnd = form.querySelector('#err_endDate');

      // Clear errors
      errTitle.textContent = '';
      errValue.textContent = '';
      errStart.textContent = '';
      errEnd.textContent = '';

      // Validations
      if (offerTitle === '') {
        errTitle.textContent = 'Offer title is required';
        isValid = false;
      }

      if (discountValue === '' || isNaN(discountValue) || discountValue <= 0) {
        errValue.textContent = 'Enter a valid discount value';
        isValid = false;
      } else if (discountType === 'PERCENTAGE' && discountValue > 100) {
        errValue.textContent = 'Percentage discount cannot exceed 100%';
        isValid = false;
      }

      const today = new Date().toISOString().split('T')[0];

      if (startDate === '') {
        errStart.textContent = 'Start date is required';
        isValid = false;
      } else if (startDate < today) {
        errStart.textContent = 'Start date cannot be in the past';
        isValid = false;
      }

      if (endDate === '') {
        errEnd.textContent = 'End date is required';
        isValid = false;
      } else if (endDate < startDate) {
        errEnd.textContent = 'End date cannot be before start date';
        isValid = false;
      }

      if (isValid) {
        form.submit();
      }
    });
  });
});
