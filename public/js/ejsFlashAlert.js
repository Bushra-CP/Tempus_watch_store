const success_msg =
  '<%= success_msg && success_msg.length > 0 ? success_msg[0] : "" %>';
const error_msg =
  '<%= error_msg && error_msg.length > 0 ? error_msg[0] : "" %>';

if (success_msg && success_msg.length > 0) {
  Swal.fire({
    icon: 'success',
    title: 'Success',
    text: success_msg,
    confirmButtonColor: '#3085d6',
  });
}

if (error_msg && error_msg.length > 0) {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: error_msg,
    confirmButtonColor: '#d33',
  });
}
