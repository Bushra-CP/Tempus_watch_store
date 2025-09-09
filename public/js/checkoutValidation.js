// handle selection & highlighting
document.querySelectorAll('.address-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.address-card').forEach((c) => {
      c.classList.remove('selected');
      c.querySelector('.address-radio').checked = false;
    });

    card.classList.add('selected');
    card.querySelector('.address-radio').checked = true;
  });
});

const defaultRadio = document.querySelector('.address-radio:checked');
if (defaultRadio) {
  defaultRadio.closest('.address-card').classList.add('selected');
}




