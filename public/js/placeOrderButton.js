document.querySelectorAll('.selectAddress').forEach((a) => {
  a.addEventListener('click', async (e) => {
    e.preventDefault();

    let addressId = a.dataset.addressId;

    try {
      const response = await fetch(
        `/checkout/getSelectedAddressId?id=${addressId}`,
      );
      const result = await response.json();

      if (result.success) {
        console.log('Address updated:', result.addressId);
        // highlight selected address in UI here
      }
    } catch (err) {
      console.error('Error updating address:', err);
    }
  });
});

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
async function payNow() {
  const checkoutData = document.getElementById('checkout-data');
  const orderTotal = checkoutData.dataset.orderTotal;
  const name = checkoutData.dataset.name;
  const email = checkoutData.dataset.email;
  const phoneNo = checkoutData.dataset.phoneNo;

  // 1. Create order by calling backend
  const response = await fetch('/checkout/placeOrder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orderTotal,
    }),
  });

  const order = await response.json();
  console.log('Checkout response:', order);

  // 2. Open Razorpay Checkout
  const options = {
    key: 'rzp_test_RJndEocLfkxOKh', // Replace with your Razorpay key_id
    amount: order.amount,
    currency: order.currency,
    name: 'Tempus',
    description: 'Test Transaction-Online Payment',
    order_id: order.id, // This is the order_id created in the backend
    callback_url: '/orderSuccessful', // Your success URL
    prefill: {
      name: name,
      email: email,
      contact: phoneNo,
    },
    theme: {
      color: '#F37254',
    },
    handler: function (response) {
      // 3. Verify payment with backend
      fetch('/checkout/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'ok') {
            Swal.fire({
              text: data.message || 'Payment Successful',
              timer: 1500,
              showConfirmButton: false,
            }).then(() => {
              if (data.redirect) {
                window.location.href = data.redirect;
              }
            });
          } else {
            Swal.fire({
              text: data.message || 'Payment Failed',
            }).then(() => {
              if (data.redirect) {
                window.location.href = data.redirect;
              }
            });
          }
        })
        .catch((error) => {
          console.log('Error:', error);
          alert('Error verifying payment');
        });
    },
  };

  const rzp = new Razorpay(options);

  rzp.on('payment.failed', function (response) {
    console.log('Payment Failed:', response);
    rzp.close();

    // Optional: You can also send details to backend to log failure
    fetch('/checkout/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: response.error.metadata.order_id,
        razorpay_payment_id: response.error.metadata.payment_id,
        razorpay_signature: null, // since it failed, no valid signature
      }),
    }).then(() => {
      Swal.fire({
        text: 'Payment Failed',
      }).then(() => {
        window.location.href = '/orderFailed';
      });
    });
  });

  rzp.open();
}
