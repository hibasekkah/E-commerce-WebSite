import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Payment from './Payment'; // Adjust path to your Payment component

const PaymentPage = () => {
  const [orderId, setOrderId] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const navigate = useNavigate();

  // This effect runs when the component mounts
  useEffect(() => {
    // 1. Get the order ID from localStorage
    const storedOrderId = localStorage.getItem('orderId');

    if (storedOrderId) {
      setOrderId(parseInt(storedOrderId, 10));
    } else {
      // 2. If no orderId is found, the user probably came here by mistake.
      //    Redirect them to the home page or the order creation page.
      console.error("No Order ID found in localStorage.");
      navigate('/make-order'); // Or navigate('/')
    }
  }, [navigate]);

  // 3. This function is passed to the Payment component.
  //    It will be called upon a successful transaction.
  const handlePaymentSuccess = () => {
    console.log("Payment was successful. Updating UI.");
    setIsPaid(true);
    // Important: Clean up the orderId from storage after payment is done
    localStorage.removeItem('orderId');
  };

  // 4. Render the UI
  if (!orderId) {
    // Show a loading message or a blank screen while we check for the order ID
    return <div>Loading payment details...</div>;
  }

  return (
    <div className="dark:bg-gray-900 dark:text-white flex justify-center py-10">
      <div className="py-6 px-8 border-2 border-secondary rounded-lg my-5 mx-4 w-full sm:w-1/3">
        {isPaid ? (
          // Show this after payment is successful
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-500 mb-4">Payment Successful!</h2>
            <p>Thank you for your purchase. Your order is now being processed.</p>
            <button
              onClick={() => navigate('/OrderHistory')} // Navigate to an orders history page
              className="mt-6 px-6 py-2 rounded bg-gradient-to-tr from-red-500 to-red-800 text-white hover:from-red-700 hover:to-red-700"
            >
              View My Orders
            </button>
          </div>
        ) : (
          // Show this before payment is completed
          <div>
            <h2 className="text-2xl font-bold mb-4 text-center">Complete Your Payment</h2>
            <p className="text-center mb-6">You are about to pay for Order #{orderId}.</p>
            {/* 5. Render the Payment component and pass it the required props */}
            <Payment 
              orderId={orderId} 
              onPaymentSuccess={handlePaymentSuccess} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;