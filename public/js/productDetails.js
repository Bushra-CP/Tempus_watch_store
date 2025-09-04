const thumbnails = document.querySelectorAll('.thumbnail');
const mainImage = document.getElementById('currentImage');
const mainContainer = document.querySelector('.main-image-container');

// ✅ Switch image on thumbnail click
thumbnails.forEach((thumb) => {
  thumb.addEventListener('click', () => {
    mainImage.src = thumb.src;

    // highlight active thumbnail
    thumbnails.forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
  });
});

// ✅ Toggle zoom on main image click
mainContainer.addEventListener('click', () => {
  mainContainer.classList.toggle('zoomed');
});

// ✅ Move zoom focus with mouse
mainContainer.addEventListener('mousemove', (e) => {
  if (mainContainer.classList.contains('zoomed')) {
    const { left, top, width, height } = mainContainer.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    mainImage.style.transformOrigin = `${x}% ${y}%`;
  }
});
