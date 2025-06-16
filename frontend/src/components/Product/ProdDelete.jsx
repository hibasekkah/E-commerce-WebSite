import React, { useEffect, useState } from 'react'
import CatProdDelete from './CatProdDelete';
import axios from 'axios';

const loadProdsFromDB = async () => {
  try{
    const res = await axios.get('http://localhost:8000/api/products/');
    
    if(res.status === 200) {
      return res.data.results;
    } else {
      console.log('Failed to fetch products');
      return ;
    }
  } catch (error) {
    console.log('Failed to fetch products');
    return;
  }
}



const prodsCategories = [
  {
    id: 1,
    name: 'Home Decor',
    content: [
      { 
        id: 2, 
        name: 'Home Furniture',
        products: []
      }, {
        id: 3,
        name: 'Accessories',
        products: []
      }
    ]
  }, {
    id: 4,
    name: 'Clothing & Textiles',
    content: [
      { 
        id: 5, 
        name: 'Clothes',
        products: []
      }, {
        id: 6,
        name: 'Textiles',
        products: []
      }, {
        id: 7,
        name: 'Shoes',
        products: []
      }
    ]
  }, {
    id: 8,
    name: 'Natural Cosmetics',
    content: [
      { 
        id: 9, 
        name: 'Creams and Gels',
        products: []
      }, {
        id: 10,
        name: 'Liquids',
        products: []
      }, {
        id: 11,
        name: 'Others',
        products: []
      }
    ]
  }, {
    id: 12,
    name: 'Accessories & Jewelry',
    products: []
  }, {
    id: 13,
    name: 'Food & Spices',
    content: [
      { 
        id: 14, 
        name: 'Liquids',
        products: []
      }, {
        id: 15,
        name: 'Solids',
        products: []
      }
    ]
  }
]




export default function ProdDelete() {
  let delay = 100;
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]); // ✅ état local
  const [message, setMessage] = useState("");
  const [messageStatus, setMessageStatus] = useState(false);

  const loadProdsCategorie = async () => {
    const prods = await loadProdsFromDB();

    // Copier la structure vide
    const localCategories = prodsCategories.map(cat => ({
      ...cat,
      products: cat.products ? [] : undefined,
      content: cat.content ? cat.content.map(sub => ({ ...sub, products: [] })) : undefined
    }));

    // Injecter les produits dans la bonne catégorie ou sous-catégorie
    prods.forEach((product) => {
      localCategories.forEach((category) => {
        if (product.category === category.id && category.products) {
          category.products.push(product);
        } else if (category.content) {
          category.content.forEach((subCategory) => {
            if (product.category === subCategory.id) {
              subCategory.products.push(product);
            }
          });
        }
      });
    });

    setCategories(localCategories); // ✅ mise à jour du state
    setIsLoading(false);
  };

  useEffect(() => {
    loadProdsCategorie();
  }, []);

  if (isLoading) 
    return <p className="text-center mt-10 text-primary">Loading...</p>;

  return (
    <div className='mt-5'>
      <p className={messageStatus ? 'text-primary' : 'text-blue-600 text-center'}>{message}</p>
      <div className='mt-5'>
      {/* Champ de recherche */}
        <div className='flex flex-col justify-center items-center '>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <input 
              type='text'
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
              <option value='category' >Category</option>
              <option value='productName' >Product name</option>
            </select>
          </div>
        </div>

        {/* Affichage des catégories */}
        <div className='my-5'>
          {categories.map(cat => {
            delay += 100;
            return (
              <CatProdDelete 
                key={cat.id}
                catProds={cat}
                searchValue={searchValue}
                searchType={searchType}
                onDelete={loadProdsCategorie}
                setMessage={setMessage}
                setMessageStatus={setMessageStatus}
              />
            );
          })}
        </div>
      </div>
    </div>
    
  )
}
