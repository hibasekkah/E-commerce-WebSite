import React, { useState } from 'react'
import CatProdAddQ from './CatProdAddQ';

const prods = [
    {
        "id": 4,
        "name": "tchirt",
        "description": "tchirt",
        "category": 5,
        "status": "ACTIVE",
        "display_order": 0,
        "items": [
            {
                "id": 50,
                "price": "122.00",
                "stock_quantity": 133,
                "display_order": 0,
                "status": "ACTIVE",
                "images": [
                    {
                        "id": 68,
                        "image_url": "/media/products/50/DSC09606_2048x.webp",
                        "alt_text": "",
                        "is_primary": true,
                        "display_order": 0
                    }
                ],
                "variations": {
                    "ClotheSize": "XL",
                    "Color": "Red"
                }
            },  {
                "id": 51,
                "price": "122.00",
                "stock_quantity": 133,
                "display_order": 0,
                "status": "ACTIVE",
                "images": [
                    {
                        "id": 68,
                        "image_url": "/media/products/50/DSC09606_2048x.webp",
                        "alt_text": "",
                        "is_primary": true,
                        "display_order": 0
                    }
                ],
                "variations": {
                    "ClotheSize": "XL",
                    "Color": "black"
                }
            },  {
                "id": 50,
                "price": "122.00",
                "stock_quantity": 133,
                "display_order": 0,
                "status": "ACTIVE",
                "images": [
                    {
                        "id": 68,
                        "image_url": "/media/products/50/DSC09606_2048x.webp",
                        "alt_text": "",
                        "is_primary": true,
                        "display_order": 0
                    }
                ],
                "variations": {
                    "ClotheSize": "L",
                    "Color": "Yellow"
                }
            }
        ],
        "created_at": "2025-06-13T15:03:43.003107Z",
        "updated_at": "2025-06-13T15:03:43.003107Z"
    }, {
        "id": 5,
        "name": "tchirt2",
        "description": "tchirt",
        "category": 5,
        "status": "ACTIVE",
        "display_order": 0,
        "items": [
            {
                "id": 50,
                "price": "122.00",
                "stock_quantity": 133,
                "display_order": 0,
                "status": "ACTIVE",
                "images": [
                    {
                        "id": 68,
                        "image_url": "/media/products/50/DSC09606_2048x.webp",
                        "alt_text": "",
                        "is_primary": true,
                        "display_order": 0
                    }
                ],
                "variations": {
                    "ClotheSize": "XL",
                    "Color": "Red"
                }
            },  {
                "id": 51,
                "price": "122.00",
                "stock_quantity": 133,
                "display_order": 0,
                "status": "ACTIVE",
                "images": [
                    {
                        "id": 68,
                        "image_url": "/media/products/50/DSC09606_2048x.webp",
                        "alt_text": "",
                        "is_primary": true,
                        "display_order": 0
                    }
                ],
                "variations": {
                    "ClotheSize": "XL",
                    "Color": "black"
                }
            },  {
                "id": 50,
                "price": "122.00",
                "stock_quantity": 133,
                "display_order": 0,
                "status": "ACTIVE",
                "images": [
                    {
                        "id": 68,
                        "image_url": "/media/products/50/DSC09606_2048x.webp",
                        "alt_text": "",
                        "is_primary": true,
                        "display_order": 0
                    }
                ],
                "variations": {
                    "ClotheSize": "L",
                    "Color": "Yellow"
                }
            }
        ],
        "created_at": "2025-06-13T15:03:43.003107Z",
        "updated_at": "2025-06-13T15:03:43.003107Z"
    } , {
        "id": 4,
        "name": "tchirt",
        "description": "tchirt",
        "category": 12,
        "status": "ACTIVE",
        "display_order": 0,
        "items": [
            {
                "id": 50,
                "price": "122.00",
                "stock_quantity": 133,
                "display_order": 0,
                "status": "ACTIVE",
                "images": [
                    {
                        "id": 68,
                        "image_url": "/media/products/50/DSC09606_2048x.webp",
                        "alt_text": "",
                        "is_primary": true,
                        "display_order": 0
                    }
                ],
                "variations": {
                    "Color": "Red"
                }
            },  {
                "id": 51,
                "price": "122.00",
                "stock_quantity": 133,
                "display_order": 0,
                "status": "ACTIVE",
                "images": [
                    {
                        "id": 68,
                        "image_url": "/media/products/50/DSC09606_2048x.webp",
                        "alt_text": "",
                        "is_primary": true,
                        "display_order": 0
                    }
                ],
                "variations": {
                    "Color": ""
                }
            },  {
                "id": 50,
                "price": "122.00",
                "stock_quantity": 133,
                "display_order": 0,
                "status": "ACTIVE",
                "images": [
                    {
                        "id": 68,
                        "image_url": "/media/products/50/DSC09606_2048x.webp",
                        "alt_text": "",
                        "is_primary": true,
                        "display_order": 0
                    }
                ],
                "variations": {
                    "Color": "Yellow"
                }
            }
        ],
        "created_at": "2025-06-13T15:03:43.003107Z",
        "updated_at": "2025-06-13T15:03:43.003107Z"
    }
]

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

const loadProdsCategorie = () => {
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
};

loadProdsCategorie();

export default function AddQuantityProd() {
    let delay = 100;
    const [searchValue, setSearchValue] = useState('');
    const [searchType, setSearchType] = useState('');
    
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
