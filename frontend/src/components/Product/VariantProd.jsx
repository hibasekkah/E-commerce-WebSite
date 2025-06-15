import React, { useState } from 'react'
import InputDimension from './InputDimension';
import Item from './Item'
import axios from 'axios';

function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

export default function VariantProd() {

  const productDetails = JSON.parse(localStorage.getItem('productDetails'));
  const [dimensions, setDimensions] = useState({});
  const [variants, setVariants] = useState([]);
  const [currentVariant, setCurrentVariant] = useState({});
  const [eCurrentVariant, setECurrentVariant] = useState({units: ['', '']});
  let variantDimensions = {};
  const [inputKey, setInputKey] = useState(0);
  const productId = JSON.parse(localStorage.getItem('productId'));
  const [message, setMessage] = useState("");
  const [messageStatus, setMessageStatus] = useState(false);
  

  const removeItem = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    let isValid = true;
    let errors = {units: ['', '']};

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
      if (!dimensions.length || dimensions.length <= 0 || !dimensions?.selectedUnits?.length || !dimensions.selectedUnits[0]) {
        isValid = false;
        if(!dimensions.length || dimensions.length <= 0) {
          errors.length = "Please enter a valid length.";
        } 
        if(!dimensions?.selectedUnits?.length || !dimensions.selectedUnits[0]) {
          errors.units[0] = "Please select a unit."
        }
      } else {
        variantDimensions = {...variantDimensions, Length: `${dimensions.length} ${dimensions.selectedUnits[0]}`};
      }
      if (!dimensions.width || dimensions.width <= 0 || !dimensions?.selectedUnits?.length || !dimensions.selectedUnits[1]) {
        isValid = false;
        if(!dimensions.width || dimensions.width <= 0) {
          errors.width = "Please enter a valid width.";
        } 
        if(!dimensions?.selectedUnits?.length || !dimensions.selectedUnits[1]) {
          errors.units[1] = "Please select a unit."
        }
      } else {
        variantDimensions = {... variantDimensions, Width: `${dimensions.width} ${dimensions.selectedUnits[1]}`};
      }
      let height = null;
      if (dimensions.height !== undefined && dimensions.height !== null && dimensions.height !== "") {
        if (dimensions.height <= 0) {
          isValid = false;
          errors.height = "Please enter a valid height.";
        }
        if (!dimensions?.selectedUnits?.length || !dimensions.selectedUnits[2]) {
          isValid = false;
          errors.units[2] = "Please select a unit.";
        } else if (dimensions.height > 0) {
          // Ajout seulement si tout est bon
          height = `${dimensions.height} ${dimensions.selectedUnits[2]}`;
        }
      }

      variantDimensions = {
        ...variantDimensions,
        Height: height,
      };


    }

    if(productDetails.category === 'Home Decor' && productDetails.subCategory === 'Accessories'){
      if (!dimensions.dimAccessorie) {
        isValid = false;
        errors.dimAccessorie = "Please enter a valid dimension for accessorie."
      } else {
        variantDimensions = {Size:dimensions.dimAccessorie};
      }      
    } 

    if(productDetails.category === 'Clothing & Textiles' && productDetails.subCategory === 'Clothes'){
      if (!dimensions.clothingSize) {
        isValid = false;
        errors.clothingSize = "Please select a clothing size."
      } else {
        variantDimensions = {ClotheSize: dimensions.clothingSize};
      }
    } 

    if(productDetails.category === 'Clothing & Textiles' && productDetails.subCategory === 'Textiles') {
      if(!dimensions.fabricLength || dimensions.fabricLength <= 0 || !dimensions?.selectedUnits?.length || !dimensions.selectedUnits[0]) {
        isValid = false;
        if (!dimensions.fabricLength || dimensions.fabricLength <= 0) {
          errors.fabricLength = "Please enter a valid length.";
        } 
        if (!dimensions?.selectedUnits?.length || !dimensions.selectedUnits[0]) {
          errors.units[0] = "Please select a unit."
        } 
      }
      else {
        variantDimensions = {FabricLength: `${dimensions.fabricLength} ${dimensions.selectedUnits[0]}`};
      }
    } 

    if(productDetails.category === 'Clothing & Textiles' && productDetails.subCategory === 'Shoes') {
      if (!dimensions.shoesSize || dimensions.shoesSize <= 0) {
        isValid = false;
        errors.shoesSize = "Please enter a valid shoe size.";
      } else {
        variantDimensions = {ShoeSize: dimensions.shoesSize};
      }
    }

    if(productDetails.category === 'Natural Cosmetics' && productDetails.subCategory === 'Creams and Gels') {
      if(!dimensions.creamWeight || dimensions.creamWeight <= 0 || !dimensions?.selectedUnits?.length || !dimensions.selectedUnits[0]) {
        isValid = false;
        if (!dimensions.creamWeight || dimensions.creamWeight <= 0) {
          errors.creamWeight = "Please enter a valid length.";
        } 
        if (!dimensions?.selectedUnits?.length || !dimensions.selectedUnits[0]) {
          errors.units[0] = "Please select a unit."
        } 
      }
      else {
        variantDimensions = {Weight: `${dimensions.creamWeight} ${dimensions.selectedUnits[0]}`};
      }
    }

    if(productDetails.category === 'Natural Cosmetics' && productDetails.subCategory === 'Liquids') {
      if(!dimensions.cosmeticsVolume || dimensions.cosmeticsVolume <= 0 || !dimensions?.selectedUnits?.length || !dimensions.selectedUnits[0]) {
        isValid = false;
        if(!dimensions.cosmeticsVolume || dimensions.cosmeticsVolume <= 0) { 
          errors.cosmeticsVolume = "Please enter a valid volume.";
        }
        if (!dimensions?.selectedUnits?.length || !dimensions.selectedUnits[0]) {
          errors.units[0] = "Please select a unit."
        }
      }
       else {
        variantDimensions = {Volume: `${dimensions.cosmeticsVolume} ${dimensions.selectedUnits[0]}`};
      }
    }

    if(productDetails.category === 'Food & Spices' && productDetails.subCategory === 'Liquids') {
      if (!dimensions.foodVolume || dimensions.foodVolume <= 0 || !dimensions?.selectedUnits?.length || !dimensions.selectedUnits[0]) {
        isValid = false;
        if(!dimensions.foodVolume || dimensions.foodVolume <= 0) {
          errors.foodVolume = "Please enter a valid volume.";
        } 
        if (!dimensions?.selectedUnits?.length || !dimensions.selectedUnits[0]) {
          isValid = false;
          errors.units[0] = "Please select a unit."
        } 
      }
      else {
        variantDimensions = {Volume: `${dimensions.foodVolume} ${dimensions.selectedUnits[0]}`};
      }
    }

    if(productDetails.category === 'Food & Spices' && productDetails.subCategory === 'Solids') {
      if (!dimensions.foodWeight || dimensions.foodWeight <= 0 || !dimensions?.selectedUnits?.length || !dimensions.selectedUnits[0]) {
        isValid = false;
        if (!dimensions.foodWeight || dimensions.foodWeight <= 0) {
            errors.foodWeight = "Please enter a valid weight.";
        }
        if (!dimensions?.selectedUnits?.length || !dimensions.selectedUnits[0]) {
            errors.units[0] = "Please select a unit.";
        }
      } else {
          variantDimensions = { Weight: `${dimensions.foodWeight} ${dimensions.selectedUnits[0]}` };
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
      setDimensions({});
      setInputKey(prev => prev + 1);
    }
  };

  const save = async () => {
    let valide = true;
    for (const element of variants){

      const formData = new FormData();
      formData.append("product", productId);
      formData.append("price", element.price);
      formData.append("stock_quantity", element.quantity);
      formData.append("images", element.image); // fichier image

      const configurations = Object.entries(element.variantDimensions).map(
        ([key, value]) => ({
          variation_name: key,
          value: value,
        })
      );
      configurations.push({variation_name:'Color', value: element.color});
      // Pour les configurations : JSON.stringify + append
      formData.append("configurations", JSON.stringify(configurations));
      try {
        // Register the user
        const res = await axios.post("http://localhost:8000/api/items/", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }});

        if (res.status !== 201 && res.status !== 200) { //200 OK, 201 created
            valide = false;
        } 
        } catch (error) {
        valide = false;
      }
    };

    if(valide) {
      setVariants([]);
      setMessage("Items added successfully.");
      setMessageStatus(false);
    }else {
      setMessage("Failed to add items. Please try again.");
      setMessageStatus(true);
    }
    setTimeout(() => {
      setMessage('');
    }, 2000);
  }



  return (
    <div className=" dark:bg-gray-900 dark:text-white flex flex-col justify-center w-full">
      <div className='flex justify-center'>
        <div className="py-4 px-8 border-2 border-primary rounded-lg my-8 w-1/3">
          <div className="mb-4">
            <input
                type="number"
                placeholder="Price"
                value={currentVariant.price || ''}
                onChange={(e) => setCurrentVariant((v) => ({...v,price: Number(e.target.value)}))}
                className="border-2 p-2 w-full mb-1 rounded-lg border-primary
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
                className="border-2 p-2 w-full mb-1 rounded-lg border-primary
                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            /> 

            <div className="mb-5 text-primary">
                {eCurrentVariant.quantity}
            </div>
          </div>
          <InputDimension
            key={inputKey}
            productDetails={productDetails}
            onChangeDimensions={(data) => setDimensions(data)}
            errors={eCurrentVariant}
          />

          
          {!(
                (productDetails.category === 'Natural Cosmetics' &&
                (productDetails.subCategory === 'Creams and Gels' || productDetails.subCategory === 'Liquids')) ||
                productDetails.category === 'Food & Spices'
            )
            ? 
            <div className='mb-4'>
              <input
                  type="text"
                  placeholder="Color"
                  value={currentVariant.color || ''}
                  onChange={(e) => setCurrentVariant((v) => ({...v,color: e.target.value}))}
                  className="border-2 p-2 w-full mb-1 rounded-lg border-primary
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
                className="border-2 p-2 w-full mb-1 rounded-lg border-primary
                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            /> 
            <div className="mb-5 text-primary">
                {eCurrentVariant.image}
            </div>
          </div>
          <div className="mb-4 flex flex-col gap-3">
            <p className={messageStatus ? 'text-primary' : 'text-blue-600'}>{message}</p>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            <button
              onClick={handleAddItem}
              className="px-4 py-2 rounded bg-gradient-to-tr from-red-500 to-red-700 text-white hover:from-red-700 hover:to-red-700"
            >
              Add Item
            </button>
            <button
              className="px-4 py-2 rounded bg-gradient-to-tr from-red-500 to-red-700 text-white hover:from-red-700 hover:to-red-700"
              onClick={save}
            >
              Save Items
            </button>
          </div>
          </div>
          
          
        </div>
      </div>
      {variants.length ? 
        <>
          <h2 className="text-2xl font-medium mb-8 mt-5 text-center text-primary border-primary border-t-4 pt-3">Product Items</h2>
          <div className='mx-10 mb-10 grid grid-cols-1 sm:grid-cols-2 gap-10'>
            {variants.map((element, index) => {
                return (
                    <Item 
                      key={index} 
                      element={element} index={index}
                      removeItem={removeItem}
                    />
                )
            })}
            
          </div> 
        </>
        :
        ''
      }
      
    </div>
  )
}
