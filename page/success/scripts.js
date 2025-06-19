// script.js

// Firebase setup
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// EmailJS init
emailjs.init("YOUR_EMAILJS_USER_ID");

// PayPal Integration
paypal.Buttons({
  createOrder: function(data, actions) {
    return actions.order.create({
      purchase_units: [{ amount: { value: '10.00' } }] // example
    });
  },
  onApprove: function(data, actions) {
    return actions.order.capture().then(function(details) {
      const email = document.getElementById("paypal-email").value;
      sendEmail(email, "10.00", "PayPal");
    });
  }
}).render('#paypal-button-container');

// Paystack
function payWithPaystack() {
  const email = document.getElementById("paystack-email").value;
  const amount = parseInt(document.getElementById("paystack-amount").value) * 100;

  let handler = PaystackPop.setup({
    key: 'YOUR_PAYSTACK_KEY',
    email: email,
    amount: amount,
    currency: "NGN",
    callback: function(response) {
      sendEmail(email, amount / 100, "Paystack");
    }
  });
  handler.openIframe();
}

// Flutterwave
function payWithFlutterwave() {
  const email = document.getElementById("flutter-email").value;
  const amount = parseInt(document.getElementById("flutter-amount").value);

  FlutterwaveCheckout({
    public_key: "YOUR_FLUTTERWAVE_KEY",
    tx_ref: "txn-" + Date.now(),
    amount: amount,
    currency: "NGN",
    customer: { email: email },
    callback: function(response) {
      sendEmail(email, amount, "Flutterwave");
    },
    onclose: function() {}
  });
}

// Save + email + redirect
function sendEmail(email, amount, method) {
  db.collection("payments").add({
    email: email,
    amount: amount,
    method: method,
    timestamp: new Date()
  });

  emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
    user_email: email,
    payment_amount: amount,
    payment_method: method
  }).then(() => {
    window.location.href = "success.html";
  }).catch(err => {
    console.error("EmailJS failed", err);
    window.location.href = "success.html";
  });
}
