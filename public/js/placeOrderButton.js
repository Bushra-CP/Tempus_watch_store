/////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////
// Toggleable Radio Buttons
const radios = document.querySelectorAll('input[name="paymentMethod"]');

radios.forEach((radio) => {
  let wasChecked = radio.checked;

  radio.addEventListener('click', function () {
    if (wasChecked) {
      radio.checked = false;
    }

    wasChecked = radio.checked;
  });

  radio.addEventListener('change', function () {
    wasChecked = radio.checked;
  });
});

//////////////////////////////////////////////////////////
// Function to get current payment selection
function getPaymentDetails() {
  const useWallet = document.getElementById('useWallet').checked;

  const selectedRadio = document.querySelector(
    'input[name="paymentMethod"]:checked',
  );
  let paymentMethod = selectedRadio ? selectedRadio.value : null;

  if (useWallet && !paymentMethod) {
    paymentMethod = 'WALLET_ONLY';
  }

  if (!useWallet && !paymentMethod) {
    paymentMethod = null;
  }

  return { paymentMethod, useWallet };
}

// const paymentDetails = getPaymentDetails();
// console.log(paymentDetails.paymentMethod);
// console.log(paymentDetails.useWallet);

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
async function payNow() {
  const { paymentMethod, useWallet } = getPaymentDetails();

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
      paymentMethod,
      useWallet,
    }),
  });

  const order = await response.json();

  if (!order.success) {
    Swal.fire({
      text: order.message || 'Something went wrong',
    }).then(() => {
      if (order.redirect) window.location.href = order.redirect;
    });
    return; // stop here
  }

  // Wallet fully covered the amount
  if (order.paymentType === 'WALLET_ONLY') {
    Swal.fire({
      text: 'Payment completed using Wallet',
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      window.location.href = order.redirect || '/orderSuccessful';
    });
    return;
  }

  //  COD (Cash on Delivery)
  if (order.paymentType === 'COD') {
    Swal.fire({
      text: 'Order placed with Cash on Delivery',
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      window.location.href = order.redirect || '/orderSuccessful';
    });
    return;
  }

  // COD PLUS WALLET
  if (order.paymentType === 'WALLET_PLUS_COD') {
    Swal.fire({
      text: 'Order placed with Wallet and COD',
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      window.location.href = order.redirect || '/orderSuccessful';
    });
    return;
  }

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
