import axios from 'axios';
import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';

export default function ProductRow({ prod, headVariants, setMessage, setMessageStatus}) {
    const [showVariations, setShowVariations] = useState(false);
    const variantLength = headVariants?.length + 1;

    // Créer un tableau pour stocker les quantités (initialisé à 0 pour chaque variation)
    const [quantities, setQuantities] = useState(
        prod.variations?.map(() => '') || []
    );

    const [eQuantities, setEQuantities] = useState(
        prod.variations?.map(() => '') || []
    );

    

    const handleQuantityChange = (index, value) => {
        const updatedQuantities = [...quantities];
        updatedQuantities[index] = value;
        setQuantities(updatedQuantities);
    };

    const handleQuantityErrorChange = (index, value) => {
        const updatedQuantities = [...eQuantities];
        updatedQuantities[index] = value;
        setEQuantities(updatedQuantities);
    };


    const addQuantity = async (indexQuantiy, idVariation) => {
        if (quantities[indexQuantiy] === '' || quantities[indexQuantiy] <= 0) {
            handleQuantityErrorChange(indexQuantiy, 'Please enter a valid quantity.');
        } else {
            handleQuantityErrorChange(indexQuantiy, '');
            try{
                const res = await axios.post(`http://localhost:8000/api/product-items/${idVariation}/adjust-stock/`, {
                    "adjustment": quantities[indexQuantiy]
                });
                if(res.status === 200) {
                    setMessage("Quantity successfully added.");
                    setMessageStatus(false);
                    handleQuantityChange(indexQuantiy, '');
                } else {
                    setMessage("An error occurred while updating the stock.");
                    setMessageStatus(true);

                }
            }catch{
                setMessage("An error occurred while updating the stock.");
                setMessageStatus(true);

            }
            setTimeout(() => {
                setMessage('');
            }, 2000);
        }
    }

    const gridMap = {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    };

    return (
        <tr className=''>
            <td className=''>
                <div className='flex flex-col'>
                    <div
                        className='border-b-2  border-primary px-3 py-2 cursor-pointer flex justify-between items-center'
                        onClick={() => setShowVariations(prev => !prev)}
                    >
                        {prod.name}
                        <span className='text-gray-600 font-bold text-xl'>
                            {showVariations ? '▲' : '▼'}
                        </span>
                    </div>

                    {showVariations ? (
                    <div className="mt-3">
                        {/* Ligne d'en-têtes des variantes */}
                        <div className={`grid grid-cols-1 sm:grid-cols-${variantLength} text-base px-2 py-2 w-full gap-2 border-b-2 border-primary font-semibold  text-primary`}>
                        {headVariants?.map((variantName, i) => (
                            <span key={i} className="pl-4">{variantName}</span>
                        ))}
                        <span>Quantity</span>
                        </div>

                        {/* Les variantes du produit */}
                        {prod.variations?.map((variante, idx) => (
                        <div key={idx} className={`grid grid-cols-1 sm:grid-cols-${variantLength} px-2 w-full gap-2 border-b-2 border-primary items-center justify-center`}>
                            {variante
                            ?.filter((element, index) => index !== 0)
                            .map((element, i) => (
                                <span key={i} className={`pl-4 ${element ? '' : 'text-yellow-600'}`}>{element ? element : 'Not set'}</span>
                            ))}
                            <div className=''>
                                <div className='flex justify-center items-center w-full max-w-full'>
                                    <input
                                        type="number"
                                        value={quantities[idx]}
                                        onChange={(e) => handleQuantityChange(idx, e.target.value)}
                                        placeholder="Quantity to add"
                                        className="border-2 p-1 my-2 border-primary text-base dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white flex-grow min-w-0"
                                    />
                                    <button
                                        className="p-2 w-12 flex justify-center bg-gradient-to-tr from-red-500 to-red-800 text-white hover:from-red-700 hover:to-red-700"
                                        style={{ height: '2.2rem' }}
                                        onClick={() => addQuantity(idx, variante[0])}
                                    >
                                        <FiPlus size={20} />
                                    </button>
                                </div>
                                <p className="text-primary">{eQuantities[idx]}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                    ) : null}

                </div>
            </td>

        </tr>
    );
}

