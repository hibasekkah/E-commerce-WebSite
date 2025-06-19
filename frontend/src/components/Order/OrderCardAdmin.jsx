import React from 'react';
import dayjs from 'dayjs';
import axios from 'axios';

const convertStatus = {
  Processing : 'SHIPPED',
  Shipped: 'DELIVERED'
}


export default function OrderCardAdmin({ lines, createdAt, status, orderTotal, user, shippingMethod, shippingAddress, orderId }) {
  const formattedDate = dayjs(createdAt).format('MMMM D, YYYY [at] HH:mm');
  const formattedPhone = user?.phone ? `+${user.phone}` : '';

  const changeStatus = async (status) => {
    const access_token = localStorage.getItem('access_token');
    if (!access_token) {
      setMessage("Unauthorized: You will be logged out. Please log in again.");
      setMessageStatus(true);
      setTimeout(() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("role");
          localStorage.removeItem("username");
          localStorage.removeItem("email");
          localStorage.removeItem("phone");
          localStorage.removeItem("dob");
          localStorage.removeItem("gender");
          window.location.href = '/';
      }, 2000);
      
      return;
    }
    
    try {
      const res = await axios.patch(`http://localhost:8000/api/Orders/admin/orders/${orderId}/`, {status}, {
        headers:{
          Authorization:`Bearer ${access_token}` ,
          'Content-Type': 'application/json',
        }
      });
      console.log(res);
      if(res.status === 200) {
        setOrders(res.data);
      }else {
        console.log('Error whene loading orders history.');
      }
    }catch(err){
      if (err.response) {
        console.log('Error response:', err.response.data);
      } else {
        console.log('Unknown error:', err);
      }
    }
  }

  return (
    <div className='w-full max-w-4xl border-primary border-2 rounded-lg p-10 mb-5'>
      {/* Header with date and status */}
      <div className='flex justify-between items-start gap-4 mb-5'>
        <p className=' text-gray-500'>Ordered on: <span className='font-medium'>{formattedDate}</span></p>
        <p className=' text-primary font-semibold'>{status}</p>
        {status !== 'Delivered' ?
        <button className='bg-gradient-to-r from-primary to-secondary text-white font-bold 
                          py-1 px-4 rounded-full cursor-pointer transform transition-transform duration-200 hover:scale-105'
                onClick={() => changeStatus(convertStatus[status])}
        >
          Change Status to {convertStatus[status]}
        </button>
        : null
        }
        
      </div>

      {/* User Info */}
      <div className='mb-5 flex flex-col gap-2 bg-gray-50 border border-gray-300 rounded p-4'>
        <p><span className='font-semibold'>Username:</span> {user?.username}</p>
        <p><span className='font-semibold'>Email:</span> {user?.email}</p>
        <p><span className='font-semibold'>Phone:</span> {formattedPhone}</p>
        <p><span className='font-semibold'>Shipping Method:</span> {shippingMethod}</p>
      </div>

      {/* Shipping Address */}
      {shippingMethod !== 'In-Store Pickup' && (
        <div className='mb-5 bg-gray-50 border border-gray-300 rounded p-4'>
          <p className='font-semibold mb-2'>Shipping Address:</p>
          <p>{shippingAddress.address}</p>
          <p>{shippingAddress.city}, {shippingAddress.state}</p>
          <p>{shippingAddress.postal_code}, {shippingAddress.country}</p>
        </div>
      )}
      {/* Product lines */}
      <div className='flex flex-col border-gray-600 border-2'>
        <div className='grid grid-cols-3 gap-5 font-semibold text-primary border-b-4 border-gray-500 
                        px-3 py-2'>
          <span>Product name</span>
          <span>Unit Price</span>
          <span>Quantity</span>
        </div>
        {lines.map((line, index) => (
          <div key={index} className='grid grid-cols-3 gap-5 border-b-2 border-gray-600 
                                        px-3 py-2'>
            <span>{line.product_item.name}</span>
            <span>{line.price}$</span>
            <span>{line.quantity}</span>
          </div>
        ))}
      </div>
        <div className="flex justify-end mt-3">
        <p className="inline-block text-red-600 font-bold text-lg bg-red-100 px-5 py-3 rounded">
            Order Total : {orderTotal}$
        </p>
        </div>
    </div>
  );
}
