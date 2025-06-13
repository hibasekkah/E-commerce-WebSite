import React from 'react'
import CatProdDelete from './CatProdDelete';

const prods = [
  {
    "success": true,
    "count": 1,
    "results": [
        {
            "id": 2,
            "name": "Organic Argan Oil",
            "description": "Huile premium pressée à froid",
            "category": 14,
            "category_name": "Liquids",
            "status": "ACTIVE",
            "display_order": 3,
            "items_count": 4,
            "created_at": "2025-06-06T15:57:52.125510Z",
            "updated_at": "2025-06-12T20:57:03.198970Z"
        }
    ]
  } , {
    "success": true,
    "count": 1,
    "results": [
        {
            "id": 3,
            "name": "Handmade Wooden Chair",
            "description": "Huile premium pressée à froid",
            "category": 2,
            "category_name": "Liquids",
            "status": "ACTIVE",
            "display_order": 3,
            "items_count": 4,
            "created_at": "2025-06-06T15:57:52.125510Z",
            "updated_at": "2025-06-12T20:57:03.198970Z"
        }
    ]
  } , {
    "success": true,
    "count": 1,
    "results": [
        {
            "id": 4,
            "name": "Traditional Moroccan Slippers",
            "description": "Huile premium pressée à froid",
            "category": 5,
            "category_name": "Liquids",
            "status": "ACTIVE",
            "display_order": 3,
            "items_count": 4,
            "created_at": "2025-06-06T15:57:52.125510Z",
            "updated_at": "2025-06-12T20:57:03.198970Z"
        }
    ]
  } , {
  "success": true,
  "count": 1,
  "results": [
    {
      "id": 5,
      "name": "Silver Berber Necklace",
      "description": "Collier traditionnel berbère en argent pur",
      "category": 12,
      "category_name": "Accessories & Jewelry",
      "status": "ACTIVE",
      "display_order": 1,
      "items_count": 3,
      "created_at": "2025-06-10T12:45:32.000000Z",
      "updated_at": "2025-06-12T20:57:03.000000Z"
    }
  ]
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

const loadProdsCategorie = () => {
  prods.forEach((element) => {
    const product = element.results[0];
    prodsCategories.forEach((category) => {
      if(product.category === category.id) {
        category.products.push(product);
      } else if(category?.content){
        category.content.forEach((subCategory) => {
          if(product.category === subCategory.id){
            subCategory.products.push(product);
          }
        })
      }
    })
  });
}

loadProdsCategorie();

export default function ProdDelete() {

  let delay = 100;
  
  return (
    <div className='my-5'>
      {prodsCategories.map(cat => {
        delay += 100;
        return <CatProdDelete key={cat.id} catProds={cat} />
      })}
    </div>
    
  )
}
