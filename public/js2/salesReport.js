const filterType = document.getElementById('filterType');
const customDateInputs = document.getElementById('customDateInputs');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const downloadPDF = document.getElementById('downloadPDF');
const downloadExcel = document.getElementById('downloadExcel');

// Show custom inputs if "custom" is selected
filterType.addEventListener('change', function () {
  if (this.value === 'custom') {
    customDateInputs.classList.remove('d-none');
  } else {
    customDateInputs.classList.add('d-none');
    if (this.value) {
      window.location.href = `/admin/sales?type=${this.value}`;
    }
  }
});

// Apply custom date filter
function applyCustomFilter() {
  const start = startDateInput.value;
  const end = endDateInput.value;
  if (start && end) {
    window.location.href = `/admin/sales?type=custom&startDate=${start}&endDate=${end}`;
  } else {
    alert('Please select both start and end dates.');
  }
}

// Download PDF/Excel
function setDownloadLinks() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.toString();
  downloadPDF.href = `/admin/sales?${query}&format=pdf`;
  downloadExcel.href = `/admin/sales?${query}&format=excel`;
}

setDownloadLinks();
