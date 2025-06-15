import React, { useState } from 'react'

export default function InputDimension({productDetails, onChangeDimensions, errors}) {

    const {category, subCategory} = productDetails;
    const [height, setHeight] = useState();
    const [width, setWidth] = useState();
    const [length, setLength] = useState();
    
    const dimensionOptions = [
        "small",
        "medium",
        "large",
        "extra large"
    ];
    const [dimAccessorie, setDimAccessorie] = useState('');
    const [clothingSize, setClothingSize] = useState('');
    const [fabricLength, setFabricLength] = useState();
    const [shoesSize, setShoesSize] = useState();
    const [creamWeight, setCreamWeight] = useState();
    const [cosmeticsVolume, setCosmeticsVolume] = useState();
    const [foodVolume, setFoodVolume] = useState();
    const [foodWeight, setFoodWeight] = useState();

    const weightUnits = ['g', 'kg'];
    const volumeUnits = ['ml', 'l'];
    const lengthUnits = ['cm', 'm'];
    const [selectedUnits, setSelectedUnits] = useState([]);

    const handleChangeUnit = (e, index) => {
        const newSelectedUnits = [...selectedUnits];
        newSelectedUnits[index] = e.target.value;
        setSelectedUnits(newSelectedUnits);
        onChangeDimensions({
            height, width, length, dimAccessorie, clothingSize, fabricLength,
            shoesSize, creamWeight, cosmeticsVolume, foodVolume, foodWeight,
            selectedUnits: newSelectedUnits
        });
    }

    const handleChangeInput = (e, inputType) => {
        const value = e.target.value;
        if(inputType === 'height') 
            setHeight(value);
        else if (inputType === 'width')
            setWidth(value);
        else if (inputType === 'length')
            setLength(value);
        else if (inputType === 'dimAccessorie')
            setDimAccessorie(value);
        else if (inputType ==='clothingSize')
            setClothingSize(value);
        else if (inputType === 'fabricLength') 
            setFabricLength(value);
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
            height, width,length, dimAccessorie, clothingSize, fabricLength,
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
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <div className='flex flex-col'>
                                    <input
                                        type='number'
                                        placeholder='Width'
                                        value={width || ''}
                                        onChange={(e) => handleChangeInput(e, 'width')}
                                        className="border-2 p-2 w-full mb-1 rounded-lg border-primary
                                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    />
                                    <div className="mb-5 text-primary">
                                        {errors.width}
                                    </div>
                                </div>
                                <div className='flex flex-col'>
                                    <select 
                                    value={selectedUnits[0]}
                                    onChange={(e) => handleChangeUnit(e, 0)}
                                    className="border-2 p-2 mb-1 rounded-lg border-primary
                                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    >
                                        <option value="">Select Unit</option>
                                        {lengthUnits.map((element,index) => (
                                            <option key={index} value={element}>
                                                {element}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="text-primary">
                                        {errors?.units?.length > 1 ? errors.units[1] : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='mb-4'>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <div className='flex flex-col'>
                                    <input
                                        type='number'
                                        placeholder='Length'
                                        value={length || ''}
                                        onChange={(e) => handleChangeInput(e, 'length')}
                                        className="border-2 p-2 w-full mb-1 rounded-lg border-primary
                                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    />
                                    <div className="mb-5 text-primary">
                                        {errors.length}
                                    </div>
                                </div>
                                <div className='flex flex-col'>
                                    <select 
                                    value={selectedUnits[1]}
                                    onChange={(e) => handleChangeUnit(e, 1)}
                                    className="border-2 p-2 mb-1 rounded-lg border-primary
                                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    >
                                        <option value="">Select Unit</option>
                                        {lengthUnits.map((element,index) => (
                                            <option key={index} value={element}>
                                                {element}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="text-primary">
                                        {errors?.units?.length > 1 ? errors.units[1] : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='mb-4'>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <div className='flex flex-col'>
                                    <input
                                        type='number'
                                        placeholder='Height'
                                        value={height || ''}
                                        onChange={(e) => handleChangeInput(e, 'height')}
                                        className="border-2 p-2  mb-1 rounded-lg border-primary
                                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    />
                                    <div className="text-primary">
                                        {errors.height}
                                    </div>
                                </div>
                                <div className='flex flex-col'>
                                    <select 
                                    value={selectedUnits[2]}
                                    onChange={(e) => handleChangeUnit(e, 2)}
                                    className="border-2 p-2  mb-1 rounded-lg border-primary
                                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    >
                                        <option value="">Select Unit</option>
                                        {lengthUnits.map((element,index) => (
                                            <option key={index} value={element}>
                                                {element}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="text-primary">
                                        {errors?.units?.length > 0 ? errors.units[2] : ''}
                                    </div>
                                </div>
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
                            className="border-2 p-2 w-full mb-1 rounded-lg border-primary
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
                            className="border-2 p-2 w-full mb-1 rounded-lg border-primary
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
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <div className='flex flex-col'>
                                 <input
                                    type='number'
                                    placeholder='Length'
                                    value={fabricLength  || ''}
                                    onChange={(e) => handleChangeInput(e, 'fabricLength')}
                                    className="border-2 p-2 mb-1 rounded-lg border-primary
                                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                />
                                <div className="mb-5 text-primary">
                                    {errors.fabricLength}
                                </div>
                            </div>
                            <div className='flex flex-col'>
                                <select 
                                value={selectedUnits[0]}
                                onChange={(e) => handleChangeUnit(e, 0)}
                                    className="border-2 p-2 mb-1 rounded-lg border-primary
                                dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                >
                                    <option value="">Select Unit</option>
                                    {lengthUnits.map((element,index) => (
                                        <option key={index} value={element}>
                                            {element}
                                        </option>
                                    ))}
                                </select>
                                <div className="mb-5 text-primary">
                                    {errors?.units?.length ? errors.units[0] : ''}
                                </div>
                            </div>
                             
                            
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
                            className="border-2 p-2 w-full mb-1 rounded-lg border-primary
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
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <div className='flex flex-col'>
                                <input
                                    type='number'
                                    placeholder='Weight'
                                    value={creamWeight  || ''}
                                    onChange={(e) => handleChangeInput(e, 'creamWeight')}
                                    className="border-2 p-2 mb-1 rounded-lg border-primary
                                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                />
                                <div className="mb-5 text-primary">
                                    {errors.creamWeight}
                                </div>
                            </div>
                            <div className='flex flex-col'>
                                <select 
                                value={selectedUnits[0]}
                                onChange={(e) => handleChangeUnit(e, 0)}
                                    className="border-2 p-2 mb-1 rounded-lg border-primary
                                dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                >
                                    <option value="">Select Unit</option>
                                    {weightUnits.map((element,index) => (
                                        <option key={index} value={element}>
                                            {element}
                                        </option>
                                    ))}
                                </select>
                                <div className="mb-5 text-primary">
                                    {errors?.units?.length ? errors.units[0] : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            } else if (subCategory === 'Liquids') {
                return (
                    <div className='mb-4'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <div className='flex flex-col'>
                                <input
                                    type='number'
                                    placeholder='Volume'
                                    value={cosmeticsVolume || ''}
                                    onChange={(e) => handleChangeInput(e, 'cosmeticsVolume')}
                                    className="border-2 p-2 mb-1 rounded-lg border-primary
                                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                />
                                <div className="mb-5 text-primary">
                                    {errors.cosmeticsVolume}
                                </div>
                            </div>
                            <div className='flex flex-col'>
                                <select 
                                value={selectedUnits[0]}
                                onChange={(e) => handleChangeUnit(e, 0)}
                                    className="border-2 p-2 mb-1 rounded-lg border-primary
                                dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                >
                                    <option value="">Select Unit</option>
                                    {volumeUnits.map((element,index) => (
                                        <option key={index} value={element}>
                                            {element}
                                        </option>
                                    ))}
                                </select> 
                                <div className="mb-5 text-primary">
                                    {errors?.units?.length ? errors.units[0] : ''}
                                </div>
                            </div>                            
                        </div>
                    </div>
                )
            }
        } else if (category === 'Food & Spices') {
            if(subCategory === 'Liquids') {
                return (
                    <div className='mb-4'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <div className='flex flex-col'>
                                <input
                                    type='number'
                                    placeholder='Volume'
                                    value={foodVolume  || ''}
                                    onChange={(e) => handleChangeInput(e, 'foodVolume')}
                                    className="border-2 p-2 mb-1 rounded-lg border-primary
                                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                />
                                <div className="mb-5 text-primary">
                                    {errors.foodVolume}
                                </div>
                            </div>
                            <div className='flex flex-col'>
                                 <select 
                                value={selectedUnits[0]}
                                onChange={(e) => handleChangeUnit(e, 0)}
                                    className="border-2 p-2 mb-1 rounded-lg border-primary
                                dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                >
                                    <option value="">Select Unit</option>
                                    {volumeUnits.map((element,index) => (
                                        <option key={index} value={element}>
                                            {element}
                                        </option>
                                    ))}
                                </select>
                                <div className="mb-5 text-primary">
                                    {errors?.units?.length ? errors.units[0] : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            } else if (subCategory === 'Solids') {
                return (
                    <div className='mb-4'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <div className='flex flex-col'>
                                <input
                                    type='number'
                                    placeholder='Weight'
                                    value={foodWeight  || ''}
                                    onChange={(e) => handleChangeInput(e, 'foodWeight')}
                                    className="border-2 p-2 mb-1 rounded-lg border-primary
                                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                />
                                <div className="mb-5 text-primary">
                                    {errors.foodWeight}
                                </div>
                            </div>
                            <div className='flex flex-col'>
                                <select 
                                value={selectedUnits[0]}
                                onChange={(e) => handleChangeUnit(e, 0)}
                                    className="border-2 p-2 mb-1 rounded-lg border-primary
                                dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                >
                                    <option value="">Select Unit</option>
                                    {weightUnits.map((element,index) => (
                                        <option key={index} value={element}>
                                            {element}
                                        </option>
                                    ))}
                                </select>
                                <div className="mb-5 text-primary">
                                    {errors?.units?.length ? errors.units[0] : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        }
    }

    return (<>{renderContent()}</>)
}
