import React, { useState } from 'react';
import axios from 'axios';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

// --- IMPORTANT ---
// This is your PayPal Client ID from your Django settings.
// It's the public key used by the frontend to render the buttons.
const PAYPAL_CLIENT_ID = "AUzyUJ4siTZfpwkJ8j53FqJ3vAFiWMLm6G5seJ84MsoryYn1iAeYJxP7uwwPH-v1J1ozJBqYBm-3UoGl";

// Your Django API base URL.
const API_BASE_URL = "http://127.0.0.1:8000/api";

const Payment = ({ orderId, onPaymentSuccess }) => {
  // State to manage messages (e.g., errors, success) and processing status.
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * This function is called when the PayPal button is clicked.
   * It contacts your Django backend to create a payment order with PayPal.
   */
  // In Payment.jsx

const createOrder = async () => {
  setMessage('');
  const token = localStorage.getItem('access_token');

  if (!token) {
    setMessage("Authentication error. Please log in again.");
    throw new Error("Authentication token not found.");
  }

  try {
    const payload = { order_id: orderId };
    console.log("Sending payload to create order:", payload); // Good for debugging

    const res = await axios.post(`${API_BASE_URL}/Payments/create-paypal-order/`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.data.orderID) {
      return res.data.orderID;
    } else {
      throw new Error("PayPal order ID not returned from server.");
    }
  } catch (error) {
    // --- THIS IS THE IMPROVED PART ---
    console.error("💥 Axios Error creating PayPal order:", error);
    
    let detailedError = "Could not initiate payment. Please try again.";
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error Response Data:", error.response.data);
      console.error("Error Response Status:", error.response.status);
      detailedError = `Server Error: ${error.response.data.error || error.response.data.detail || JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      // The request was made but no response was received (e.g., server is down, CORS issue)
      console.error("Error Request:", error.request);
      detailedError = "No response from server. Check if the backend is running and check for CORS issues.";
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error Message:', error.message);
      detailedError = error.message;
    }

    setMessage(detailedError); // Show the detailed error to the user
    throw new Error(detailedError); // Pass the detailed error to PayPal's onError
  }
};

  /**
   * This function is called after the user approves the payment in the PayPal popup.
   * It contacts your Django backend to "capture" the payment.
   */
  const onApprove = async (data) => {
    setIsProcessing(true); // Show a processing indicator
    const token = localStorage.getItem('access_token');
    if (!token) {
      setMessage("Authentication error. Please log in again.");
      setIsProcessing(false);
      return;
    }
    
    try {
      // The 'data' object from PayPal contains the 'orderID' we need to capture.
      const payload = { orderID: data.orderID }; 
      const res = await axios.post(`${API_BASE_URL}/Payments/capture-paypal-order/`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        setMessage("Payment successful! Your order is being processed.");
        // Call the function passed from the parent component (PaymentPage)
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        // Handle cases where the server responds with a non-200 status
        setMessage("Failed to process payment. Please contact support.");
      }
    } catch (error) {
      console.error("Error capturing PayPal payment:", error);
      const errorMsg = error.response?.data?.error || "An error occurred while finalizing your payment.";
      setMessage(errorMsg);
    } finally {
      // Ensure the processing indicator is hidden, regardless of outcome.
      setIsProcessing(false);
    }
  };

  /**
   * This function handles any errors that occur directly within the PayPal button's flow.
   * For example, if the PayPal popup fails to load.
   */
  const onError = (err) => {
    console.error("PayPal Button Error:", err);
    setMessage("An error occurred with the PayPal payment. Please refresh and try again.");
    setIsProcessing(false);
  };

  return (
    // The PayPalScriptProvider loads the necessary PayPal SDK script.
    // It's essential to wrap your PayPalButtons with it.
    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
      <div className="payment-wrapper">
        {isProcessing && (
          <div style={{ textAlign: 'center', margin: '20px' }}>
            <strong>Processing your payment, please wait...</strong>
          </div>
        )}

        {/* The PayPalButtons component renders the actual "Pay with PayPal" button */}
        {/* We hide it while processing to prevent double-clicks */}
        <div style={{ display: isProcessing ? 'none' : 'block' }}>
          <PayPalButtons
  style={{ layout: 'vertical' }}
  createOrder={createOrder}
  onApprove={onApprove}
  onError={onError}
  // This array tells PayPal to hide the generic card button,
  // the PayPal Credit button, and any "Pay Later" options.
  disableFunding={['card', 'credit', 'paylater']} 
/>
        </div>
        
        {/* Display any success or error messages to the user */}
        {message && (
          <div style={{ 
            color: message.includes('successful') ? 'green' : 'red', 
            marginTop: '15px', 
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            {message}
          </div>
        )}
      </div>
    </PayPalScriptProvider>
  );
};

export default Payment;