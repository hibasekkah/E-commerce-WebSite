import axios from 'axios';
import React, { useState } from 'react'

const changeQuantity = async (id, quantity, setChangeQ, setStep) => {
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
        const res = await axios.patch(`http://localhost:8000/api/Carts/cart/items/${id}/`, {quantity}, {
            headers:{
                Authorization: `Bearer ${access_token}`
            }
        })
        if(res.status === 200) {
            setChangeQ(false);
            setStep(prev => prev+1);
        }else {
            console.log('Error whene changing the quantity.');
        }
    }catch(error) {
        console.log(`Error whene changing the quantity : ${error}`);
    }
}

const remove = async (id, setStep) => {
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
        const res = await axios.delete(`http://localhost:8000/api/Carts/cart/items/${id}/`, {
            headers:{
                Authorization: `Bearer ${access_token}`
            }
        })
        if(res.status === 204) {
            setStep(prev => prev+1);
        }else {
            console.log('Error whene removing this item from the cart.');
        }
    }catch(error) {
        console.log(`Error whene removing this item from the cart : ${error}`);
    }
}

export default function Cart({image, name, productId, category,  headVariantions, variations
                                , currentQuantity , stockQuantity , price, idItem, setStep}) {

    const [changeQ, setChangeQ] = useState(false);
    const [quantity, setQuantity] = useState(currentQuantity);

  return (
        <div className='sm:w-1/2 w-2/3 border-primary border-2 rounded-lg p-10 mb-5'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-10'>
                <img src={image}
                    className='border-primary border-2 w-full' 
                    alt='product'   
                /> 
                <div>
                    <a className='text-gray-500 hover:text-primary hover:underline font-semibold' 
                        href={`/Product/${category}/${productId}`}>View product</a>
                    <p className='mt-3 sm:text-2xl text-lg font-semibold text-primary border-b-2 border-gray-600 pb-3'>{name}</p>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 mt-3 px-5 mb-11'>
                        <div className='flex items-end'>
                            <p className='text-2xl font-semibold'>{price}$</p>
                            <p className='mr-3 text-lg'>/Unit</p>
                        </div>
                        <div className='flex items-end'>
                                {!changeQ ?
                                <p className='text-lg bg-primary text-white px-2 py-1 rounded-sm'>{currentQuantity} Items</p>
                                :null
                                }
                                
                        </div>
                    </div>
                    <div className='mt-3 border-2 border-primary'>
                        {headVariantions.map((element,index) => {
                            const value = variations.filter((value,idx) => idx === index);
                            return(
                                <div className='grid grid-cols-2 border-b-2 border-primary py-1 px-2' key={index}>
                                    <span className='text-primary font-semibold'>{element}</span>
                                    <span>{value}</span>
                                </div>
                            )
                            
                        }
                        )}
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4'>
                        {changeQ ?
                            <>
                                <select
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="border-2 p-2 m mb-1 rounded-lg border-primary 
                                            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                >
                                    {[...Array(stockQuantity).keys()].map(i => (
                                        <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                        </option>
                                    ))}
                                </select>
                                <button 
                                className= {`bg-gradient-to-r from-blue-500 to-blue-800 text-white font-semibold
                                            py-2 px-2 cursor-pointer transform transition-transform duration-200
                                            hover:from-blue-900 hover:to-blue-900 
                                            dark:from-blue-500 dark:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-500`}
                                onClick={() => changeQuantity(idItem, quantity, setChangeQ, setStep)}
                                >
                                Change
                                </button>

                            </>
                        :
                        <>
                            <button 
                            className= {`bg-gradient-to-r from-blue-500 to-blue-800 text-white font-semibold
                                        py-2 px-2 cursor-pointer transform transition-transform duration-200
                                        hover:from-blue-900 hover:to-blue-900 
                                        dark:from-blue-500 dark:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-500`}
                            onClick={() => setChangeQ(true)}
                            >
                            Change Quantity
                            </button>
                            <button 
                            className='bg-gradient-to-r from-primary to-secondary text-white 
                                                font-semibold py-2 px-2  cursor-pointer 
                                                hover:from-secondary hover:to-secondary'
                            onClick={() => remove(idItem, setStep)}                    
                            >
                                Remove
                            </button>
                        </>
                        
                        }
                        
                    </div>
                </div>
            </div>
        </div>
    
  )
}
