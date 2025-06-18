import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ProductDetailsItems from './ProductDetailsItems';
import { FaCartShopping} from 'react-icons/fa6';
import Login from '../LoginRegister/Login';
import Register from '../LoginRegister/Register';

const headVariants = {
    'Home Decor' : {
        2: ['Length', 'Width', 'Height', 'Color'],
        3: ['Size', 'Color']
    },
    'Clothing & Textiles': {
        5: ['Size', 'Color'],
        6: ['Length', 'Color'],
        7: ['Size', 'Color']
    }, 
    'Natural Cosmetics' : {
        9: ['Weight'],
        10: ['Volume'],
        11: ['Color']
    }, 
    'Accessories & Jewelry': ['Color'],
    'Food & Spices' : {
        14: ['Volume'],
        15: ['Weight'],
    }
}




export default function ProductDetails() {
    const { categoryName,id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [product, setProduct] = useState({});
    const [index, setIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState("");
    const [messageStatus, setMessageStatus] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    const addToCart = async (id, quantity) => {
        const role = localStorage.getItem('role') || '';
        const access_token = localStorage.getItem('access_token');
        const element = {
            product_item_id: id,
            quantity
        } 

        

        if(role === 'Customer') {
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
                const res = await axios.post('http://localhost:8000/api/Carts/cart/items/', element,
                    {
                        headers: {
                            Authorization: `Bearer ${access_token}` ,
                            'Content-Type': 'application/json',
                        }
                    });
                if(res.status === 201) {
                    setMessage('Item added to cart successfully!');
                    setMessageStatus(false);
                }else {
                    setMessage('Error whene adding this item to the cart.');
                    setMessageStatus(true);
                }
            }catch(error){
                setMessage(`Error whene adding this item to the cart: ${error}`);
                setMessageStatus(true);
            }
        }else {
            setMessage('You must be logged in as a Customer to add items.');
            setMessageStatus(true);
            setTimeout(() => {
                setShowLogin(true);
            }, 2000);
        }

        setTimeout(() => {
            setMessage('');
        }, 3000);
        

        
    }

    const modalLoginRef = useRef();
    const modalRegisterRef = useRef();

    const loadProductFromDB = async () => {
        try {
        const res = await axios.get(`http://localhost:8000/api/products/${id}/`);
        if (res.status === 200) {
            setProduct(res.data);
            console.log(res.data);
        } else {
            setProduct({});
            console.log('Error when fetching this product from the database.');
        }
        } catch (error) {
        setProduct({});
        console.log(`Error when fetching this product from the database: ${error}`);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadProductFromDB();
    }, []);


    if (isLoading) return <div>Loading...</div>;

    return (
        <div className='flex justify-center mt-5 dark:text-white'>
            <div className='my-3 grid grid-cols-1 sm:grid-cols-2 gap-20 w-3/4'>
                {product?.items?.[index]?.images?.[0]?.image_url ? (
                <img
                    src={`http://localhost:8000/${product.items[index].images[0].image_url}`}
                    alt="product"
                    className="w-full border-2 border-primary"
                />
                ) : (
                <p>No image available.</p>
                )}
                <div>
                    <a className='text-gray-500 hover:text-primary hover:underline font-semibold' 
                        href={`/Category/${categoryName}`}>See more products for this category</a>
                    <p className='mt-3 text-2xl font-semibold text-primary'>{product?.name ? product.name : null }</p>
                    <p className='mt-2 text-lg text-gray-600 border-b-2 border-gray-500 pb-3'>{product?.description ? product.description : null}</p>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 mt-3 px-5 mb-11'>
                        <div className='flex items-center'>
                            <p className='text-2xl font-semibold mr-3'>
                            {Number(product?.items[index]?.price) > product?.items[index]?.price_after_promotion ? 
                                product.items[index].price_after_promotion
                                : product?.items[index]?.price}$ 
                            </p>
                            <p className='line-through text-gray-600 mr-3'>
                                {Number(product?.items[index]?.price) > product?.items[index]?.price_after_promotion ? 
                                    `${product.items[index].price}$`
                                    : null}
                            </p>
                            <p className=" text-red-600 font-bold text-lg bg-red-100 px-2 rounded">
                                {product.active_discount_rate ? `-${parseInt(product.active_discount_rate)}%` : null}
                            </p>
                        </div>
                        <div className='flex items-center'>
                            <select
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="border-2 p-2 m mb-1 rounded-lg border-primary 
                                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            >
                                {[...Array(product?.items[index].stock_quantity).keys()].map(i => (
                                    <option key={i + 1} value={i + 1}>
                                    {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <ProductDetailsItems prod={product ? product : null} 
                            headVariants={product.category === 12 ? headVariants[categoryName] : headVariants[categoryName][product.category]}
                            index={index} setIndex={setIndex}
                    /> 
                    {/* Order button */}
                    <button
                    onClick={() => addToCart(product.items[index].id, quantity)}
                    className=' bg-gradient-to-r from-primary to-secondary transition-all duration-200
                                 text-white py-2 mt-8 mb-4 px-4 rounded-full flex items-center gap-3 group
                                hover:scale-105'
                    >
                    <span className='group-hover:block transition-all duration-200'>Add to cart</span>
                    <FaCartShopping className='text-xl text-white drop-shadow-sm cursor-pointer' />
                    </button>
                    <p className={messageStatus ? 'text-primary' : 'text-blue-600'}>{message}</p>
                
                </div>
            </div>
            {showLogin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div ref={modalLoginRef}>
                <Login
                    onClose={() => setShowLogin(false)}
                    onSwitchToRegister={() => {
                    setShowLogin(false);
                    setShowRegister(true);
                    }}
                />
                </div>
            </div>
            )}

            {showRegister && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div ref={modalRegisterRef}>
                <Register 
                    onClose={() => setShowRegister(false)} 
                    onSwitchToLogin={() => {
                    setShowRegister(false);
                    setShowLogin(true);
                    }}
                />
                </div>
            </div>
            )}
        </div>
        
    );
}
