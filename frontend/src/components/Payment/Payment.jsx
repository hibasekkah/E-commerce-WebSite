import React, { useEffect, useRef } from 'react';

export default function Payment() {
  const paypalRef = useRef();
  const orderId = localStorage.getItem('orderId');
  const accessToken = localStorage.getItem('access_token'); // Required for auth

  useEffect(() => {
    if (window.paypal && orderId) {
      window.paypal.Buttons({
        createOrder:  async function (data, actions) {
          return fetch('http://localhost:8000/api/Payments/create-paypal-order/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({ order_id: orderId })
          })
            .then(res => res.json())
            .then(data => {
              if (data.orderID) {
                return data.orderID;
              } else {
                throw new Error("PayPal order creation failed");
              }
            });
        },
        onApprove: async function (data, actions) {
          return fetch('http://localhost:8000/api/Payments/capture-paypal-order/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({ orderID: data.orderID })
          })
            .then(res => res.json())
            .then(data => {
              if (data.status === 'success') {
                alert('✅ Payment captured successfully!');
              } else {
                alert('❌ Payment capture failed');
              }
            });
        },
        onError: function (err) {
          console.error('PayPal error', err);
          alert('❌ PayPal error occurred');
        }
      }).render(paypalRef.current);
    }
  }, [orderId, accessToken]);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow text-center">
      <h2 className="text-xl font-bold mb-4">Complete Your Payment</h2>
      <div ref={paypalRef}></div>
    </div>
  );
}
