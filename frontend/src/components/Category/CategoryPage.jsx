import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ProductCard from '../Product/ProductCard';

export default function CategoryPage({}) {

    const categories = {
        'Home Decor':1,
        'Clothing & Textiles':4,
        'Natural Cosmetics':8,
        'Accessories & Jewelry':12,
        'Food & Spices': 13,
    };
    const {categoryName} = useParams();
    const [productCat, setProductCat] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [searchType, setSearchType] = useState('');
    let delay = 0;

    const includedProducts = productCat.filter(product => {
        const price = product.items[0].price_after_promotion < product.items[0].price 
            ? product.items[0].price_after_promotion 
            : product.items[0].price;

        return (
            searchValue === '' ||
            searchType === '' ||
            (searchType === 'productName' && product.name.toLowerCase().includes(searchValue.toLowerCase())) ||
            (searchType === 'price' && price <= Number(searchValue))
        );
    });


    const loadProdFromDB = async (id, setProductCat) => {
        try {
            const res = await axios.get(`http://localhost:8000/api/products/?category=${id}`);
            if(res.status === 200) {
                setProductCat(res.data.results);
            } else {
                console.log('Error whene fetching products for this category');
                setProductCat([]);
            }
        } catch(error) {
            console.log(`Error whene fetching products for this category: ${error}`);
            setProductCat([]);
        }
        setIsLoading(false);
    }

    useEffect(() => {
        loadProdFromDB(categories[categoryName], setProductCat);
    }, [])

    if(isLoading) 
      return <p className="text-center mt-10 text-primary">Loading...</p>; 

    return (
        <div id="category">
            <div className='bg-primary/40 py-2 mb-4'>
                <h1 className='text-3xl  font-dancing font-bold text-center'>{categoryName}</h1>
            </div>
            <div className='flex flex-col justify-center items-center'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <input 
                        type={`${searchType === 'price' ? 'number' : 'text'}`}
                        value={searchValue}
                        placeholder="Enter your search..."
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="border-2 p-2 mb-1 rounded-lg border-primary
                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"                         
                    />
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="border-2 p-2  mb-1 rounded-lg border-primary
                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"  
                    >
                        <option value='' >Search By</option>
                        <option value='price' >Price</option>
                        <option value='productName' >Product name</option>
                    </select>
                </div>
            </div>
            <div className='container flex justify-center items-center'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2'>
                    {includedProducts.length > 0 ? (
                        includedProducts.map(product => {
                            const image = `http://localhost:8000/${product.items[0].images[0].image_url}` ;
                            const price =   product.items[0].price_after_promotion < product.items[0].price ? 
                                            product.items[0].price_after_promotion : 
                                            product.items[0].price;
                            const prevPrice = product.items[0].price_after_promotion < product.items[0].price ? product.items[0].price : null;
                            delay += 50;
                            return (
                                <div data-aos="zoom-in-up" data-aos-delay={delay}>
                                    <ProductCard 
                                        key={product.id} 
                                        image={image} 
                                        price={price} 
                                        name={product.name} 
                                        id = {product.id}
                                        prevPrice={prevPrice} 
                                        discount={product.active_discount_rate} 
                                    />
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-center col-span-full text-primary text-lg mt-10 mb-48">No products found.</p>
                    )}

                </div>
            </div>
    </div>
    )
}
