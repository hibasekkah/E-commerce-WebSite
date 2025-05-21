import React from 'react'

export default function LoginButton({title, className}) {
  return (
    <button 
    className= {`${className}  bg-gradient-to-r from-blue-500 to-blue-800 text-white font-bold py-2 px-4 cursor-pointer transform transition-transform duration-200 hover:from-blue-900 hover:to-blue-900 
                dark:from-blue-500 dark:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-500`}
    >
      {title}
    </button>
  )
}
