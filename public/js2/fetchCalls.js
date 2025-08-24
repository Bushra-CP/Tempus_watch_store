///REMOVE IMAGE IN EDIT VARIANT///
async function removeImage(productId, variantId, index) {
  if (!confirm('Do you want to remove this image?')) return;

  const res = await fetch(
    `/admin/products/variant/removeImage?productId=${productId}&variantId=${variantId}&index=${index}`,
    {
      method: 'DELETE',
    },
  );

  if (res.ok) {
    location.reload(); // refresh page after delete
  } else {
    alert('Failed to remove image');
  }
}
///REMOVE IMAGE IN EDIT VARIANT///

///UNLIST VARIANT///
async function unlistVariant(variantId) {
  if (!confirm('Do you want to unlist this variant?')) return;

  const res = await fetch(
    `/admin/products/variant/unlist?id=${variantId}`,
    {
      method: 'PATCH',
    },
  );

  if (res.ok) {
    location.reload(); // refresh page after delete
  } else {
    alert('Failed to unlist');
  }
}
///UNLIST VARIANT///

///UNLIST VARIANT///
async function listVariant(variantId) {
  if (!confirm('Do you want to list this variant?')) return;

  const res = await fetch(
    `/admin/products/variant/list?id=${variantId}`,
    {
      method: 'PATCH',
    },
  );

  if (res.ok) {
    location.reload(); // refresh page after delete
  } else {
    alert('Failed to list');
  }
}
///UNLIST VARIANT///