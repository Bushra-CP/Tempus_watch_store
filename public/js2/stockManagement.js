function setFilter(filter) {
  const params = new URLSearchParams(window.location.search); // get current query params
  params.set('filter', filter); // update or add status
  window.location.search = params.toString(); // reload with updated query string
}