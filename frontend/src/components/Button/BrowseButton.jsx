import React from 'react'
import { Link } from 'react-router-dom'

export default function BrowseButton({category_name}) {
  return (
    <Link to={`Category/${category_name}`}>
      <button className='bg-gradient-to-r from-primary to-secondary text-white font-bold py-1 px-4 rounded-full cursor-pointer transform transition-transform duration-200 hover:scale-105'>
        Browse
      </button>
    </Link>
  )
}
