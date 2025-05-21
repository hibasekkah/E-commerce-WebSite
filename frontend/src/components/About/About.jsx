import React from 'react'
import Ceramics from "../../assets/Ceramics.webp"

export default function About() {
  return (
    <div className='container sm:min-h-[600px] sm:grid sm:place-items-center mb-[80px] px-4 sm:px-10'>
      <div className='grid grid-cols-1 sm:grid-cols-2 place-items-center gap-10'>
        <div>
          <img src={Ceramics} alt=""  
          data-aos='zoom-in-up'/>
        </div>
        <div>
          <div className='space-y-5 sm:p-16 pb-6'>
            <p className='text-xl text-primary font-dancing font-bold' data-aos='fade-up' delay='100'>A journey through Moroccan craftsmanship</p>
            <h1 className='text-3xl sm:text-4xl font-bold' data-aos='fade-up' delay='200'>
              About Us
            </h1>
            <p className='text-xl text-gray-500' data-aos='fade-up' delay='300'>From Our Culture to Your Home</p>
            <p data-aos='slide-up' delay='400'>
             MorocAntik is more than just a marketplace — it’s a celebration of Morocco’s rich cultural heritage. As proud Moroccans, our mission is to promote our artisanal traditions and share them with the world. From handwoven carpets and intricate ceramics to authentic leather goods and culinary delights, every item we offer tells a story — a story rooted in generations of craftsmanship, creativity, and cultural pride.
            </p>
            <p data-aos='slide-up' delay='500'>
              We work closely with local artisans across Morocco to ensure that their work is recognized, valued, and accessible. Through MorocAntik, we invite you to discover the true soul of Moroccan culture, one handcrafted piece at a time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
