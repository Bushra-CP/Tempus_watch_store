function setStatus(status) {
  const params = new URLSearchParams(window.location.search); // get current query params
  params.set('status', status); // update or add status
  window.location.search = params.toString(); // reload with updated query string
}

function setSort(sort) {
  const params = new URLSearchParams(window.location.search); // get current query params
  params.set('sort', sort); // update or add status
  window.location.search = params.toString(); // reload with updated query string
}

