import React from 'react'
import Category1 from "../../assets/Category/Clothing_Category.png"
import Category2 from "../../assets/Category/Kitchen_Category.png"
import Category3 from "../../assets/Category/Home_Decor_Category.png"
import Category4 from "../../assets/Category/Jewelry_Category.png"
import Category7 from "../../assets/Category/Cosmetics_Category.png"
import Category8 from "../../assets/Category/Food_Category.png"
import CardCategory from './CardCategory'


export default function Category() {
  const CategoryInfo = [
    {
      id:1,
      line1: 'Define',
      line2: 'Your Look',
      line3: 'With Timeless Style',
      ImageCategory:Category1,
      delay: 100
    }, {
      id: 2,
      line1: 'Cook Better',
      line2: 'With',
      line3: 'Artisan Kitchenware',
      ImageCategory:Category2,
      delay: 200
    }, {
      id:3, 
      line1: 'Transform',
      line2: 'Your Space',
      line3: 'With Elegant Decor',
      ImageCategory:Category3,
      delay: 300
    }, {
      id:4,
      line1: 'Shine Bright',
      line2: 'With',
      line3: 'Jewelry & Accessories',
      ImageCategory:Category4,
      delay: 400
    }, {
      id:5,
      line1: 'Glow Naturally',
      line2: 'With',
      line3: 'Natural Cosmetics',
      ImageCategory:Category7,
      delay: 500
    }, {
      id:6,
      line1: 'Spice Up',
      line2: 'Your Taste',
      line3: 'Spices & Food',
      ImageCategory:Category8, 
      delay: 600
    }
  ]

  return (
    <div className=' mt-14 mb-12'>
      {/* Header section */}
      <div className='text-center mb-10 max-w-[600px] mx-auto flex flex-col gap-3'>
        <p className='text-2xl text-primary font-dancing font-bold'>Discover the Heart of Morocco</p>
        <h1 className='text-4xl font-bold '>Browse Our Unique Categories</h1>
        <p className='text-xm text-gray-500'>
          Where Every Piece Tells a Story of Moroccan Heritage and Artistry.
        </p>
      </div>
      <div id="category" className='py-8'>
        <div className='container flex justify-center items-center'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-20'>
            {CategoryInfo.map((Category) => (
              <CardCategory key={Category.id} line1={Category.line1} line2={Category.line2} line3={Category.line3} ImageCategory={Category.ImageCategory} delay={Category.delay}/>
            ))}
          </div>
        </div>
      </div>
    </div>
    
  )
}
