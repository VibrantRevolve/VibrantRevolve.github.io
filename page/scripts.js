// EmailJS init
emailjs.init("YOUR_EMAILJS_PUBLIC_KEY");

function sendEmail(email, amount, method) {
  const templateParams = {
    user_email: email,
    amount_paid: amount,
    payment_method: method
  };

  emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", templateParams)
    .then(() => {
      alert("Payment confirmed via email!");
      window.location.href = "success.html";
    })
    .catch(error => {
      console.error("EmailJS Error:", error);
    });
}

// Paystack
function payWithPaystack() {
  const email = document.getElementById("paystack-email").value;
  const amount = document.getElementById("paystack-amount").value * 100;

  const handler = PaystackPop.setup({
    key: 'YOUR_PAYSTACK_PUBLIC_KEY',
    email: email,
    amount: amount,
    currency: "NGN",
    callback: function(response) {
      sendEmail(email, amount / 100, "Paystack");
    },
    onClose: function() {
      alert("Payment window closed.");
    }
  });
  handler.openIframe();
}

// Flutterwave
function payWithFlutterwave() {
  const email = document.getElementById("flutter-email").value;
  const amount = document.getElementById("flutter-amount").value;

  FlutterwaveCheckout({
    public_key: "YOUR_FLUTTERWAVE_PUBLIC_KEY",
    tx_ref: Date.now(),
    amount: amount,
    currency: "NGN",
    payment_options: "card,ussd",
    customer: {
      email: email,
    },
    callback: function(data) {
      if (data.status === "successful") {
        sendEmail(email, amount, "Flutterwave");
      }
    },
    customizations: {
      title: "Your Company",
      description: "Payment for services",
      logo: "https://yourdomain.com/logo.png",
    },
  });
}

// PayPal
paypal.Buttons({
  createOrder: function (data, actions) {
    const amount = document.getElementById("paypal-amount").value || "1.00";
    return actions.order.create({
      purchase_units: [{
        amount: { value: amount }
      }]
    });
  },
  onApprove: function (data, actions) {
    return actions.order.capture().then(function (details) {
      const email = document.getElementById("paypal-email").value;
      const amount = document.getElementById("paypal-amount").value;
      sendEmail(email, amount, "PayPal");
    });
  }
}).render('#paypal-button-container');
