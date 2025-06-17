import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductDetailsItems from './ProductDetailsItems';

const headVariants = {
    'Home Decor' : {
        2: ['Height', 'Width', 'Length', 'Color'],
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

    console.log(product.category === 12 ? headVariants[categoryName] : headVariants[categoryName][product.category]);
    return (
        <div className='flex justify-center mt-5'>
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
                <div className=''>
                    <a className='text-gray-500 hover:text-primary hover:underline font-semibold' 
                        href={`/Category/${categoryName}`}>See more products for this category</a>
                    <p className='mt-3 text-2xl font-semibold text-primary'>{product?.name ? product.name : null }</p>
                    <p className='mt-2 text-lg text-gray-800 border-b-2 border-gray-500 pb-3'>{product?.description ? product.description : null}</p>
                    <div className='flex items-end mt-3 px-5 mb-11'>
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
                    </div>
                    <ProductDetailsItems prod={product ? product : null} 
                            headVariants={product.category === 12 ? headVariants[categoryName] : headVariants[categoryName][product.category]}
                            index={index} setIndex={setIndex}
                    /> 
                       
                
                </div>
            </div>
        </div>
        
    );
}
