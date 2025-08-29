async function setFilter(sort) {
  const params = new URLSearchParams(window.location.search);
  params.set('sort', sort);
  window.history.replaceState(
    {},
    '',
    `${window.location.pathname}?${params.toString()}`,
  );
  await fetch(`/collections?${params.toString()}`);
}

async function updateURLAndFetch() {
  const params = new URLSearchParams();

  // Add checked checkboxes
  document.querySelectorAll('input[type="checkbox"]:checked').forEach((box) => {
    params.append(box.name, box.value);
  });

  // Update URL
  window.history.replaceState(
    {},
    '',
    `${window.location.pathname}?${params.toString()}`,
  );

  await fetch(`/collections?${params.toString()}`, { method: 'GET' });
}

// Add change event
document.querySelectorAll('input[type="checkbox"]').forEach((box) => {
  box.addEventListener('change', updateURLAndFetch);
});

function restoreCheckboxes() {
  const params = new URLSearchParams(window.location.search);

  document.querySelectorAll('input[type="checkbox"]').forEach((box) => {
    const values = params.getAll(box.name);
    if (values.includes(box.value)) {
      box.checked = true;
    }
  });
}
window.addEventListener('DOMContentLoaded', restoreCheckboxes);

document.querySelectorAll('.clear-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const filter = btn.getAttribute('data-filter');

    // Uncheck all checkboxes of this filter
    document
      .querySelectorAll(`input[name="${filter}"]`)
      .forEach((chk) => (chk.checked = false));

    // Remove the filter param from URL
    const params = new URLSearchParams(window.location.search);
    params.delete(filter);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
    btn.style.display = 'none';
    await fetch(`/collections?${params.toString()}`, { method: 'GET' });
  });
});

document.querySelectorAll('input[type="checkbox"]').forEach((box) => {
  box.addEventListener('change', () => {
    const name = box.name;
    const target = document.getElementById(`clear-btn_${name}`);

    if (!target) return; // safety check

    // get all checkboxes in this group
    const group = document.querySelectorAll(`input[name="${name}"]`);

    // check if at least one is checked
    const anyChecked = Array.from(group).some((cb) => cb.checked);

    // toggle button visibility live
    target.style.display = anyChecked ? 'block' : 'none';
  });
});
