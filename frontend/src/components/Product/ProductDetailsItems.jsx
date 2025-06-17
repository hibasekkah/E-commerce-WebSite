import axios from 'axios';
import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';

export default function ProductDetailsItems({ prod, headVariants, index, setIndex}) {
    const variantLength = headVariants?.length ;

    const gridMap = {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5'
    };

    return (
        <div className="mt-3 border-2 border-gray-600">
            {/* Ligne d'en-têtes des variantes */}
            <div className={`grid grid-cols-1 sm:grid-cols-${variantLength} text-base px-2 py-2 w-full gap-2 border-b-2 border-gray-600 font-semibold  text-primary`}>
            {headVariants?.map((variantName, i) => (
                <span key={i} className="pl-4">{variantName}</span>
            ))}
            </div>

            {/* Les variantes du produit */}
            {prod.items?.map((item, idx) => (
            <div
                onClick={() => setIndex(idx)}
                key={idx}
                className={`${idx === index ? 'bg-primary/40' : ''} cursor-pointer
                             grid grid-cols-1 sm:grid-cols-${variantLength} px-2 py-2 w-full 
                             gap-2 border-b-2 border-gray-600 items-center justify-center`}
            >
                {Object.values(item?.variations || {}).map((element, i) => (
                <span key={i} className={`px-4 ${element ? '' : 'text-yellow-600'}`}>
                    {element || 'Not set'}
                </span>
                ))}
            </div>
            ))}

        </div>  
    );
}

