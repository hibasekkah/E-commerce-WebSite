import React, { useEffect, useState } from 'react'
import Cart from './Cart'
import image from '../../assets/Products/Caftan.jpg';
import axios from 'axios';

export default function CartPage() {

  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCartFromDB = async () => {
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

    try{
      const res = await axios.get('http://localhost:8000/api/Carts/cart/', {
        headers:{
          Authorization:`Bearer ${access_token}` ,
          'Content-Type': 'application/json',
        }
      });
      if(res.status === 200) {
        console.log(res);
      } else {
        console.log('Error whene fetching the shopping cart.');
        console.log(res);
      }
    }catch(error){
      console.log(`Error whene fetching the shopping cart: ${error}`);
    }
    setIsLoading(false);
  }

  useEffect(()=> {
    loadCartFromDB();
  },[]);

  if (isLoading) return <div>Loading...</div>;
  return (
    <div className='flex flex-col items-center justify-center my-5'>
        <h1 className='mb-8 font-dancing text-primary text-3xl font-bold'>Shopping Cart</h1>
        <Cart image={image} name='Caftan' variation={[]} quantity={4} price={150} />
    </div>
    
  )
}
