import React, { useState } from 'react'
import Item from './Item';
import InputDimension from './InputDimension';

function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

export default function VariantProd() {

  const productDetails = JSON.parse(localStorage.getItem('productDetails'));
  const [dimensions, setDimensions] = useState({});
  const [variants, setVariants] = useState([]);
  const [currentVariant, setCurrentVariant] = useState({});
  const [eCurrentVariant, setECurrentVariant] = useState({});
  let variantDimensions = {};

  console.log(productDetails);
  console.log(variants);

  const removeItem = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    let isValid = true;
    let errors = {};

    setECurrentVariant({});


    if (!currentVariant.price || currentVariant.price <= 0) {
      errors.price = "Please enter a valid positive price.";
      isValid = false;
    }
 
    if (!currentVariant.quantity || currentVariant.quantity <= 0 ) {
      errors.quantity = "Please enter a valid positive quantity.";
      isValid = false;
    }

    if (productDetails.category !== 'Food & Spices') {
      if (!currentVariant.color || currentVariant.color.trim() === "") {
        errors.color = "Please enter a color";
        isValid = false;
      }
    }

    if (productDetails.category === 'Home Decor' && productDetails.subCategory === 'Home Furniture') {
      variantDimensions = {};
      if (!dimensions.height || dimensions.height <= 0) {
        isValid = false;
        errors.height = "Please enter a valid height.";
      } else {
        variantDimensions = {...variantDimensions, Height: dimensions.height};
      }
      if (!dimensions.width || dimensions.width <= 0) {
        isValid = false;
        errors.width = "Please enter a valid width.";
      } else {
        variantDimensions = {... variantDimensions, Width: dimensions.width};
      }
    }

    if(productDetails.category === 'Home Decor' && productDetails.subCategory === 'Accessories'){
      if (!dimensions.dimAccessorie) {
        isValid = false;
        errors.dimAccessorie = "Please enter a valid dimension for accessorie."
      } else {
        variantDimensions = {Dimension:dimensions.dimAccessorie};
      }      
    } 

    if(productDetails.category === 'Clothing & Textiles' && productDetails.subCategory === 'Clothes'){
      if (!dimensions.clothingSize) {
        isValid = false;
        errors.clothingSize = "Please select a clothing size."
      } else {
        variantDimensions = {Size: dimensions.clothingSize};
      }
    } 

    if(productDetails.category === 'Clothing & Textiles' && productDetails.subCategory === 'Textiles') {
      if (!dimensions.length || dimensions.length <= 0) {
        isValid = false;
        errors.length = "Please enter a valid length.";
      } else {
        variantDimensions = {Length: dimensions.length};
      }
    } 

    if(productDetails.category === 'Clothing & Textiles' && productDetails.subCategory === 'Shoes') {
      if (!dimensions.shoesSize || dimensions.shoesSize <= 0) {
        isValid = false;
        errors.shoesSize = "Please enter a valid shoe size.";
      } else {
        variantDimensions = {Size: dimensions.shoesSize};
      }
    }

    if(productDetails.category === 'Natural Cosmetics' && productDetails.subCategory === 'Creams and Gels') {
      if(!dimensions.creamWeight || dimensions.creamWeight <= 0) {
        isValid = false;
        errors.creamWeight = "Please enter a valid weight.";
      } else {
        variantDimensions = {Weight: dimensions.creamWeight}
      }
    }

    if(productDetails.category === 'Natural Cosmetics' && productDetails.subCategory === 'Liquids') {
      if(!dimensions.cosmeticsVolume || dimensions.cosmeticsVolume <= 0) {
        isValid = false;
        errors.cosmeticsVolume = "Please enter a valid volume.";
      } else {
        variantDimensions = {Volume: dimensions.cosmeticsVolume};
      }
    }

    if(productDetails.category === 'Food & Spices' && productDetails.subCategory === 'Liquids') {
      if(!dimensions.foodVolume || dimensions.foodVolume <= 0) {
        isValid = false;
        errors.foodVolume = "Please enter a valid volume.";
      } else {
        variantDimensions = {Volume: dimensions.foodVolume};
      }
    }

    if(productDetails.category === 'Food & Spices' && productDetails.subCategory === 'Solids') {
      if(!dimensions.foodWeight || dimensions.foodWeight <= 0) {
        isValid = false;
        errors.foodWeight = "Please enter a valid weight.";
      } else {
        variantDimensions = {Weight: dimensions.foodWeight}
      }
    }

    const newVariant = {...currentVariant, variantDimensions};

    setCurrentVariant(newVariant);
    setECurrentVariant(errors);

    if (isValid) {
      setVariants((c) => [...c, newVariant]);
      // Réinitialiser currentVariant et erreurs
      setCurrentVariant({});
      setECurrentVariant({});
    }
  };



  return (
    <div className=" dark:bg-gray-900 dark:text-white flex flex-col justify-center w-full">
      <h2 className="text-2xl font-medium mb-8 mt-5 text-center text-secondary">Add Items</h2>
      <div className='grid grid-cols-2 gap-20 mx-20 mb-10'>
        {variants.map((element, index) => (
            <Item 
              key={index} 
              element={element} index={index}
              removeItem={removeItem}
            />
        ))}
        <div className="py-4 px-8 border-2 border-secondary rounded-lg my-5 w-full">
          <div className="mb-4">
            <input
                type="number"
                placeholder="Price"
                value={currentVariant.price || ''}
                onChange={(e) => setCurrentVariant((v) => ({...v,price: Number(e.target.value)}))}
                className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            /> 

            <div className="mb-5 text-primary">
                {eCurrentVariant.price}
            </div>
          </div>
          <div className="mb-4">
            <input
                type="number"
                placeholder="Quantity"
                value={currentVariant.quantity || ''}
                onChange={(e) => setCurrentVariant((v) => ({...v,quantity: Number(e.target.value)}))}
                className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            /> 

            <div className="mb-5 text-primary">
                {eCurrentVariant.quantity}
            </div>
          </div>
          <InputDimension
            productDetails={productDetails}
            onChangeDimensions={(data) => setDimensions(data)}
            errors={eCurrentVariant}
          />

          
          {productDetails.category !== 'Food & Spices' ? 
            <div className='mb-4'>
              <input
                  type="text"
                  placeholder="Color"
                  value={currentVariant.color || ''}
                  onChange={(e) => setCurrentVariant((v) => ({...v,color: e.target.value}))}
                  className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                          dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              />  
              <div className="mb-5 text-primary">
                  {eCurrentVariant.color}
              </div>
            </div> :
            ''
          }
          
          <div className='mb-4'>
            <input
                type="file"
                placeholder="Image"
                onChange={(e) => setCurrentVariant((v) => ({...v,image: e.target.files[0]}))}
                className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            /> 
            <div className="mb-5 text-primary">
                {eCurrentVariant.image}
            </div>
          </div>
          
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-gradient-to-tr from-red-500 to-red-800 text-white hover:from-red-700 hover:to-red-700"
          >
            Save
          </button>
          </div>
        </div>
      </div>
  )
}
