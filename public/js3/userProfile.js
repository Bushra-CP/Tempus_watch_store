function showSection(event, sectionName) {
  // Prevent default only for in-page toggles
  if (sectionName) {
    event.preventDefault();

    // Hide all sections
    const sections = [
      'profile',
      'addresses',
      'wishlist',
      'payments',
      'support',
      'rewards',
      'referEarn',
      'wallet',
    ];
    sections.forEach((section) => {
      const el = document.getElementById(section + '-section');
      if (el) el.style.display = 'none';
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionName + '-section');
    if (selectedSection) selectedSection.style.display = 'block';

    // Update active menu item
    document.querySelectorAll('.sidebar-menu a').forEach((link) => {
      link.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
  }
}
