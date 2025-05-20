import React from 'react'
import image1 from '../../assets/Products/Caftan.jpg'
import image2 from '../../assets/Products/Balgha.jpg'
import image3 from '../../assets/Products/Tarbouche.jpg'
import StarRating from './StarRating';

const Products = [
    {
        image: image1,
        description: "Women's Caftan – Royal Blue Color with Gold and Silver Embroidery",
        rating: 3
    }, {
        image: image2, 
        description: "Men's Babouche – Classic Black Leather",
        rating: 4.5
    }, {
        image: image3, 
        description: "Men's Tarbouche – Traditional Red Fez Hat with Elegant Black Tassel",
        rating: 3.5
    }
];


export default function ProductCard ({image, description, rating}) {


  return (
        <div className='w-[300px] h-[450px] grid grid-rows-[320px_60px_20px] grid-cols-1 bg-gradient-to-br from-primary/40 to-secondary/70 rounded-xl p-5 m-6'>
            <div className="overflow-hidden flex items-center justify-center">
                <img
                src={image}
                alt="image of the product"
                className="h-full object-contain"
                />
            </div>
            <p className='font-semibold overflow-hidden text-ellipsis'>
                {description}
            </p>
            <div className="flex items-center">
                <StarRating rating={rating} />
            </div>
        </div>

  )
}
