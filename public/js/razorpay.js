const options = {
    key: "<%= razorpayKey %>",
    amount: "<%= order.amount %>",
    currency: "<%= order.currency %>",
    name: "<%= listing.title %>",
    description: "Including 18% GST",
    order_id: "<%= order.id %>",
    handler: function (response) {
      window.location.href = "/bookings/success";
    },
    prefill: {
      name: "<%= currentUser.username %>",
      email: "<%= currentUser.email %>",
    },
    theme: {
      color: "#212529",
    },
  };

  const rzp1 = new Razorpay(options);

  document.getElementById("payBtn").onclick = function (e) {
    rzp1.open();
    e.preventDefault();
  };