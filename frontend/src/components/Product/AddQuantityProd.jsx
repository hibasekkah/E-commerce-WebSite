import React, { useState, useEffect} from 'react'
import CatProdAddQ from './CatProdAddQ';
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
        headVariants: ['Height', 'Width', 'Length', 'Color'],
        products: []
      }, {
        id: 3,
        name: 'Accessories',
        headVariants: ['Size', 'Color'],
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
        headVariants: ['Size', 'Color'],
        products: []
      }, {
        id: 6,
        name: 'Textiles',
        headVariants: ['Length', 'Color'],
        products: []
      }, {
        id: 7,
        name: 'Shoes',
        headVariants: ['Size', 'Color'],
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
        headVariants: ['Weight'],
        products: []
      }, {
        id: 10,
        name: 'Liquids',
        headVariants: ['Volume'],
        products: []
      }, {
        id: 11,
        name: 'Others',
        headVariants: ['Color'],
        products: []
      }
    ]
  }, {
    id: 12,
    name: 'Accessories & Jewelry',
    headVariants: ['Color'],
    products: []
  }, {
    id: 13,
    name: 'Food & Spices',
    content: [
      { 
        id: 14, 
        name: 'Liquids',
        headVariants: ['Volume'],
        products: []
      }, {
        id: 15,
        name: 'Solids',
        headVariants: ['Weight'],
        products: []
      }
    ]
  }
]



export default function AddQuantityProd() {
    let delay = 100;
    const [searchValue, setSearchValue] = useState('');
    const [searchType, setSearchType] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
      const loadProdsCategorie =async () => {
        const prods = await loadProdsFromDB();
        prodsCategories.forEach(category => {
        if(category.products) category.products = [];
        if(category.content) {
          category.content.forEach(subCat => {
            if(subCat.products) subCat.products = [];
          });
        }
        });
        prods.forEach((product) => {
        prodsCategories.forEach((category) => {
          if (product.category === category.id) {
            const newProduct = { id: product.id, name: product.name };
            const variations = [];

            product.items.forEach((item) => {
              const variation = [item.id];
              let i = 1;
              for (const key in item.variations) {
                variation[i] = item.variations[key]; // Ex: ClotheSize, Color, etc.
                i++;
              }
              variations.push(variation);
            });

            newProduct.variations = variations;
            category.products.push(newProduct);

          } else if (category?.content) {
            category.content.forEach((subCategory) => {
              if (product.category === subCategory.id) {
                const newProduct = { id: product.id, name: product.name };

                const variations = [];

                product.items.forEach((item) => {
                    const variation = [item.id];
                    let i = 1;
                    for (const key in item.variations) {
                    variation[i] = item.variations[key];
                    i++;
                    }
                    variations.push(variation);
                });

                newProduct.variations = variations;
                

                subCategory.products.push(newProduct);
              }
            });
          }
        });
      });
        setIsLoading(false);
      };
  
      loadProdsCategorie();
    }, [])
  
    if(isLoading) 
      return <p className="text-center mt-10 text-primary">Loading...</p>;
    
    return (
      <div className='mt-5'>
        <div className='flex flex-col justify-center items-center'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 w-1/2'>
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
        
        <div className='my-5'>
          {prodsCategories.map(cat => {
            delay += 100;
            return <CatProdAddQ key={cat.id} catProds={cat} 
                    searchValue={searchValue} searchType={searchType} 
                    />
          })}
        </div>
      </div>
    )
}
