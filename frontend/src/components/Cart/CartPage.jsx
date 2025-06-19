import React, { useEffect, useState } from 'react'
import Cart from './Cart'
import image from '../../assets/Products/Caftan.jpg';
import axios from 'axios';

const headVariants = {
  2: ['Length', 'Width', 'Height', 'Color'],
  3: ['Size', 'Color'],
  5: ['Size', 'Color'],
  6: ['Length', 'Color'],
  7: ['Size', 'Color'],
  9: ['Weight'],
  10: ['Volume'],
  11: ['Color'],
  12: ['Color'],
  14: ['Volume'],
  15: ['Weight'],
}

const categoryName = (id) => {
  switch(id){
    case '2':
    case '3':
      return 'Home Decor';
    case '5':
    case '6':
    case '7':
      return 'Clothing & Textiles';
    case '9':
    case '10':
    case '11':
      return 'Natural Cosmetics';
    case '12': 
      return 'Accessories & Jewelry';
    case '14':
    case '15':
      return 'Food & Spices';
    default:
      return 'Unknown Category';  // optional default case
  }
}


export default function CartPage() {

  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(0);

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
        setCart(res.data);
      } else {
        console.log('Error whene fetching the shopping cart.');
      }
    }catch(error){
      console.log(`Error whene fetching the shopping cart: ${error}`);
    }
    setIsLoading(false);
  }

  useEffect(()=> {
    loadCartFromDB();
  },[step]);

  if (isLoading) return <div>Loading...</div>;
  return (
    <div className='flex flex-col items-center justify-center my-5'>
        <h1 className='mb-8 font-dancing text-primary text-3xl font-bold'>Shopping Cart</h1>
        {cart?.total_items > 0 ? 
          <div className='mb-5 text-xl font-semibold'>
            <p>Total price : {cart?.total_price}$</p>
          </div>
          : null
        }
        { cart?.total_items > 0 ?
          (cart.items.map(item => {
          const name = item.product_item.name;
          const imageUrl = `http://localhost:8000/${item.product_item.images[0].image_url}`;
          const category = categoryName(item.product_item.category_id);
          const price = Number(item.product_item.price) > item.product_item.price_after_promotion ? 
                              item.product_item.price_after_promotion
                              : item.product_item.price
          const headVariantions = headVariants[item.product_item.category_id];
          const variations = Object.values(item.product_item.variations).map(element => element);
          const stockQuantity = item.product_item.stock_quantity;
          const quantity = item.quantity;

          return (<Cart key={item.id} image={imageUrl} name={name} 
                  productId={item.product_item.product_id}  category={category}
                  headVariantions={headVariantions} variations={variations}
                  stockQuantity={stockQuantity}
                  currentQuantity={quantity} price={price} idItem={item.id} 
                  setStep={setStep}/>)
        })
        ) : <p className='mb-48 mt-10 bg-primary text-white px-3 py-2 text-lg font-semibold'>
               Your cart is waiting for your picks. Start shopping now!
              </p>
      } 
      {
        cart?.total_items > 0 ?
        <button 
        className= {`bg-gradient-to-r from-blue-500 to-blue-800 text-white font-semibold
                    py-2 px-2 cursor-pointer transform transition-transform duration-200
                    hover:from-blue-900 hover:to-blue-900 text-xl
                    dark:from-blue-500 dark:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-500`}
        onClick={() => window.location.href = '/Order'}
        >
        Proceed to Checkout
        </button> 
        : null
      }
      
    </div>
    
  )
}
