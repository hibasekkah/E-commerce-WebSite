import axios from 'axios';
import React, { useEffect, useState } from 'react'
import OrderCard from './OrderCard';

export default function OrderHistory() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const length =orders?.filter(order => order.status !== 'PENDING').length;

  const loadOrderHistoryFromDB = async () => {
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
      const res = await axios.get('http://localhost:8000/api/Orders/', {
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
    setIsLoading(false);
  }

  useEffect(() => {
    loadOrderHistoryFromDB();
  }, []);


  if (isLoading) return <div>Loading...</div>;
  return (
    <div className={`flex flex-col items-center justify-center mx-5 ${length ? 'my-10' : 'my-52'} `}>
      {
        orders
        ?.filter(order => order.status !== 'PENDING')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) 
        .map((order, index) => (
          <OrderCard key={index} lines={order.lines} createdAt={order.created_at} 
            status={order.status_display} orderTotal={order.order_total}/>
        ))
      }
      {!length ? 
        <p className='mb-48 mt-10 bg-primary text-white px-3 py-2 text-lg font-semibold'>
          Your order history is empty. Let’s fix that — discover something you’ll love!
        </p>
        : null}
    </div>
  )
}
