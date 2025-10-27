function userPageNotFound(req, res, next) {
  res.redirect('/pageNotFound');
}

function adminPageNotFound(req, res, next) {
  res.redirect('/admin/pageNotFound');
}

export default { userPageNotFound, adminPageNotFound };
