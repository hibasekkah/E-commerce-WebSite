import React, { useState } from 'react';
import Select from 'react-select';
import { Country, State, City } from 'country-state-city';
import axios from 'axios';



export default function MakeOrder() {
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [addresse, setAddresse] = useState('');
    const [error, setError] = useState({});
    const shippingOptions = [
      {
        name: "In-Store Pickup",
        price: "0.00"
      },
      {
        name: "Standard Shipping (5-7 Business Days)",
        price: "4.00"
      },
      {
        name: "Express Shipping (4-5 Business Days)",
        price: "7.50"
      }
    ];

    const [selectedShipping, setSelectedShipping] = useState('1');

    const handleChange = (e) => {
      setSelectedShipping(e.target.value);
    };
      
    const makeOrder = async () => {
    // Reset errors
    setError({});
    
    const newError = {};
    let isValid = true;

    // Validation du pays
    if (!selectedCountry) {
        newError.country = "Please select a country";
        isValid = false;
    }

    // Validation de l'état (si le pays a des états)
    const states = State.getStatesOfCountry(selectedCountry?.value);
    if (states.length > 0 && !selectedState) {
        newError.state = "Please select a state/province";
        isValid = false;
    }

    // Validation de la ville (si des villes sont disponibles)
    const cityValue = selectedCity?.label || city;
    if (!cityValue) {
      newError.city = "Please select or enter a city";
      isValid = false;
    }

    // Validation du code postal
    if (!postalCode.trim()) {
        newError.postalCode = "Postal code is required";
        isValid = false;
    }
    if (!addresse.trim()) {
        newError.address = "Address is required";
        isValid = false;
    }
    if (!selectedShipping) {
      newError.shipping = "Shipping method is required";
      isValid = false;
    }


    if (!isValid) {
        setError(newError);
        return;
    }

    const access_token = localStorage.getItem('access_token');
    if (!access_token) {
      setMessage("Unauthorized: You will be logged out. Please log in again.");
      setMessageStatus(true);
      setTimeout(() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("role");
          localStorage.removeItem("username");
          localStorage.removeItem("email");
          localStorage.removeItem("phone");
          localStorage.removeItem("dob");
          localStorage.removeItem("gender");
          window.location.href = '/';
      }, 2000);
      
      return;
    }
    const orderData = {
      new_shipping_address : {
        country: selectedCountry.label,
        state: selectedState?.label || null,
        city:  cityValue,
        postal_code: postalCode,
        address: addresse
      },
      shipping_method_id: parseInt(selectedShipping)
    };
    console.log("Order data:", orderData);
    
    try {
        const res = await axios.post('http://localhost:8000/api/Orders/', orderData, {
          headers:{
            Authorization:`Bearer ${access_token}` ,
            'Content-Type': 'application/json',
          }
        });
        if(res.status === 201) {
          localStorage.setItem('orderId', res.data.id)
          window.location.href = '/Order/Payment';
        }else {
          console.log('Failed to place order. Please try again.');
        }
    } catch (err) {
        if (err.response) {
          console.log('Error response:', err.response.data);
        } else {
          console.log('Unknown error:', err);
        }
    }
    };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setSelectedCity(null);
    setPostalCode('');
  };

  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedCity(null);
    setPostalCode('');
  };

  const handleCityChange = (value) => {
    setSelectedCity(value);
    setPostalCode('');
  };

  const handlePostalChange = (e) => {
    setPostalCode(e.target.value);
  };

  if (!selectedCountry) {
    return (
      <div className="dark:bg-gray-900 dark:text-white flex justify-center mb-52">
        <div className="py-4 px-8 border-2 border-secondary rounded-lg my-5 mx-4 w-full sm:w-1/3">
          <div className="space-y-4">
            <div>
              <label>Country:</label>
              <Select
                options={Country.getAllCountries().map((country) => ({
                  value: country.isoCode,
                  label: country.name,
                }))}
                onChange={handleCountryChange}
                value={selectedCountry}
                placeholder="Select Country"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get states and cities based on selections
  const states = State.getStatesOfCountry(selectedCountry.value);

  // Case 1: country has states
  // Case 2: country has no states but has cities
  // Case 3: country has no states and no cities

  let cities = [];
  if (states.length > 0) {
    // Case 1: states exist
    cities = selectedState ? City.getCitiesOfState(selectedCountry.value, selectedState.value) : [];
  } else {
    // No states: get cities of country
    cities = City.getCitiesOfCountry(selectedCountry.value);
  }

  return (
    <div className="dark:bg-gray-900 dark:text-white flex justify-center mb-52">
      <div className="py-4 px-8 border-2 border-secondary rounded-lg my-5 mx-4 w-full sm:w-1/3">
        <div className="space-y-4">
          <div>
            <label>Country:</label>
            <Select
              options={Country.getAllCountries().map((country) => ({
                value: country.isoCode,
                label: country.name,
              }))}
              onChange={handleCountryChange}
              value={selectedCountry}
              placeholder="Select Country"
            />
            <div className="mb-5 text-primary">
                {error.country}
            </div>
          </div>

          {/* Show State dropdown only if states exist */}
          {states.length > 0 && (
            <div>
              <label>State:</label>
              <Select
                options={states.map((state) => ({
                  value: state.isoCode,
                  label: state.name,
                }))}
                onChange={handleStateChange}
                value={selectedState}
                placeholder="Select State"
              />
              <div className="mb-5 text-primary">
                {error.state}
              </div>
            </div>
          )}

          {/* Show City dropdown if there are cities */}
          {cities.length > 0 ? (
            (states.length === 0 || selectedState) && (
              <div>
                <label>City:</label>
                <Select
                  options={cities.map((city) => ({
                    value: city.name,
                    label: city.name,
                  }))}
                  onChange={handleCityChange}
                  value={selectedCity}
                  placeholder="Select City"
                />
                <div className="mb-5 text-primary">
                    {error.city}
                </div>
              </div>
            )
          ) : (
            // Case 3: no cities
            <div>
              <label className="block mb-1">City:</label>
                <input
                    type="text"
                    placeholder="Enter City"
                    className="border p-2 w-full"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />
                <div className="mb-5 text-primary">
                    {error.city}
                </div>
            </div>
          )}

          {/* Postal code input if city selected or no cities but country selected */}
          {(selectedCity || city || (cities.length === 0 && !selectedCity)) && (
            <>
                <div>
                <label className="block mb-1">Postal Code:</label>
                <input
                    type="text"
                    placeholder="Enter postal code"
                    className="border p-2 w-full"
                    value={postalCode}
                    onChange={handlePostalChange}
                />
                <div className="mb-5 text-primary">
                    {error.postalCode}
                </div>
                </div>
                <div>
                <label className="block mb-1">Address:</label>
                <input
                    type="text"
                    placeholder="Enter address"
                    className="border p-2 w-full"
                    value={addresse}
                    onChange={(e) => setAddresse(e.target.value)}
                />
                <div className="mb-5 text-primary">
                    {error.address}
                </div>
                </div>
            </>
            
          )}
          <div>
            <label htmlFor="shippingMethod" className="block mb-1">Choose a shipping method:</label>
            <select
              id="shippingMethod"
              name="shippingMethod"
              value={selectedShipping}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            >
              {shippingOptions.map((option, index) => (
                <option key={index} value={index + 1}>
                  {option.name} - {option.price}$
                </option>
              ))}
            </select>
            <div className="mb-5 text-primary">
              {error.shipping}
            </div>
          </div>
          <button
          onClick={makeOrder}
          className="px-4 py-2 w-full rounded bg-gradient-to-tr from-red-500 to-red-800 text-white hover:from-red-700 hover:to-red-700"
          >
              Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
