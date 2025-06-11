import React, { useState } from 'react'

export default function InputDimension({productDetails, onChangeDimensions, errors}) {

    const {category, subCategory} = productDetails;
    const [height, setHeight] = useState();
    const [width, setWidth] = useState();
    const dimensionOptions = [
        "small",
        "medium",
        "large",
        "extra large"
    ];
    const [dimAccessorie, setDimAccessorie] = useState('');
    const [clothingSize, setClothingSize] = useState('');
    const [length, setLength] = useState();
    const [shoesSize, setShoesSize] = useState();
    const [creamWeight, setCreamWeight] = useState();
    const [cosmeticsVolume, setCosmeticsVolume] = useState();
    const [foodVolume, setFoodVolume] = useState();
    const [foodWeight, setFoodWeight] = useState();

    

    const handleChangeInput = (e, inputType) => {
        const value = e.target.value;
        if(inputType === 'height') 
            setHeight(value);
        else if (inputType === 'width')
            setWidth(value);
        else if (inputType === 'dimAccessorie')
            setDimAccessorie(value);
        else if (inputType ==='clothingSize')
            setClothingSize(value);
        else if (inputType === 'length') 
            setLength(value);
        else if (inputType === 'shoesSize')
            setShoesSize(value);
        else if (inputType === 'creamWeight')
            setCreamWeight(value);
        else if (inputType === 'cosmeticsVolume')
            setCosmeticsVolume(value);
        else if (inputType === 'foodVolume')
            setFoodVolume(value);
        else if (inputType === 'foodWeight')
            setFoodWeight(value);

        // met à jour dans le parent
        onChangeDimensions({
            height, width, dimAccessorie, clothingSize, length,
            shoesSize, creamWeight, cosmeticsVolume, foodVolume, foodWeight,
            [inputType]: value, // met à jour la valeur modifiée
        });
        localStorage.setItem(inputType, value);
    }

    const renderContent = () => {
        if(category === 'Home Decor'){
            if(subCategory === 'Home Furniture') {
                return (
                    <>
                        <div className='mb-4'>
                            <input
                                type='number'
                                placeholder='Height (cm)'
                                value={height || ''}
                                onChange={(e) => handleChangeInput(e, 'height')}
                                className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                                dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            />
                            <div className="mb-5 text-primary">
                                {errors.height}
                            </div>
                        </div>
                        <div className='mb-4'>
                            <input
                                type='number'
                                placeholder='Width (cm)'
                                value={width || ''}
                                onChange={(e) => handleChangeInput(e, 'width')}
                                className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                                dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            />
                            <div className="mb-5 text-primary">
                                {errors.width}
                            </div>
                        </div>
                    </>                   
                )
            } else if (subCategory === 'Accessories') {
                return (
                    <div className='mb-4'>
                        <select
                            value={dimAccessorie}
                            onChange={(e) => handleChangeInput(e, 'dimAccessorie')}
                            className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        >
                            <option value="">Select Dimension</option>
                            {dimensionOptions.map((element, index) => (
                                <option key={index} value={element}>{element}</option>
                            ))}
                        </select>
                        <div className="mb-5 text-primary">
                            {errors.dimAccessorie}
                        </div>
                    </div>
                )
            }
        } else if (category === 'Clothing & Textiles') {
            if(subCategory === 'Clothes') {
                const clothingSizes = [
                    "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL",
                    "34", "36", "38", "40", "42", "44", "46", "48", "50"
                ];

                return (
                    <div className='mb-4'>
                        <select
                            value={clothingSize}
                            onChange={(e) => handleChangeInput(e, 'clothingSize')}
                            className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        >
                            <option value="">Select Size</option>
                            {clothingSizes.map((element, index) => (
                                <option key={index} value={element}>{element}</option>
                            ))}
                        </select>
                        <div className="mb-5 text-primary">
                            {errors.clothingSize}
                        </div>
                    </div>
                )
            } else if (subCategory === 'Textiles') {
                return (
                    <div className='mb-4'>
                        <input
                            type='number'
                            placeholder='Length (cm)'
                            value={length  || ''}
                            onChange={(e) => handleChangeInput(e, 'length')}
                            className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                        <div className="mb-5 text-primary">
                            {errors.length}
                        </div>
                    </div>
                )
            } else if (subCategory === 'Shoes') {
                return (
                    <div className='mb-4'>
                        <input
                            type='number'
                            placeholder='Size'
                            value={shoesSize  || ''}
                            onChange={(e) => handleChangeInput(e, 'shoesSize')}
                            className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                        <div className="mb-5 text-primary">
                            {errors.shoesSize}
                        </div>
                    </div>
                )
            }
        } else if (category === 'Natural Cosmetics') {
            if (subCategory === 'Creams and Gels') {
                return (
                    <div className='mb-4'>
                        <input
                            type='number'
                            placeholder='Weight (g)'
                            value={creamWeight  || ''}
                            onChange={(e) => handleChangeInput(e, 'creamWeight')}
                            className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                        <div className="mb-5 text-primary">
                            {errors.creamWeight}
                        </div>
                    </div>
                )
            } else if (subCategory === 'Liquids') {
                return (
                    <div className='mb-4'>
                        <input
                            type='number'
                            placeholder='Volume (ml)'
                            value={cosmeticsVolume || ''}
                            onChange={(e) => handleChangeInput(e, 'cosmeticsVolume')}
                            className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                        <div className="mb-5 text-primary">
                            {errors.cosmeticsVolume}
                        </div>
                    </div>
                )
            }
        } else if (category === 'Food & Spices') {
            if(subCategory === 'Liquids') {
                return (
                    <div className='mb-4'>
                        <input
                            type='number'
                            placeholder='Volume (ml)'
                            value={foodVolume  || ''}
                            onChange={(e) => handleChangeInput(e, 'foodVolume')}
                            className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                        <div className="mb-5 text-primary">
                            {errors.foodVolume}
                        </div>
                    </div>
                )
            } else if (subCategory === 'Solids') {
                return (
                    <div className='mb-4'>
                        <input
                            type='number'
                            placeholder='Weight (g)'
                            value={foodWeight  || ''}
                            onChange={(e) => handleChangeInput(e, 'foodWeight')}
                            className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                            dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                        <div className="mb-5 text-primary">
                            {errors.foodWeight}
                        </div>
                    </div>
                )
            }
        }
    }

    return (<>{renderContent()}</>)
}
