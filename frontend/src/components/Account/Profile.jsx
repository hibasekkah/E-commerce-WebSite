import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import axios from "axios";

export default function Profile() {

  const [editMode, setEditMode] = useState(false);

  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [email, setEmail] = useState(localStorage.getItem('email'));
  const [phone, setPhone] = useState(localStorage.getItem('phone'));
  const [gender, setGender] = useState(localStorage.getItem('gender') || '');
  const [dob, setDob] = useState(localStorage.getItem('dob') || '');
  const [eUsername, setEUsername] = useState("");
  const [ePhone, setEPhone] = useState("");
  const [message, setMessage] = useState("");
  const [messageStatus, setMessageStatus] = useState(false);
  

  const resetFields = () => {
  setUsername(localStorage.getItem('username') || "");
  setPhone(localStorage.getItem('phone') || "");
  setGender(localStorage.getItem('gender') || "");
  setDob(localStorage.getItem('dob') || "");
};



  const validate = () => {
    let isValid = true;
    const usernameTrim = username.trim();
    const phoneTrim = phone.trim();

    if (!usernameTrim) {
      setEUsername("Please enter your username.");
      isValid = false;
    } else {
      setEUsername("");
    }

    if (!phoneTrim) {
      setEPhone("Please enter a valid phone number.");
      isValid = false;
    } else {
      setEPhone("");
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validate()) return;
    // TODO: send update API call here, then
    const token = localStorage.getItem('access_token');
    if (!token) {
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
    try {
      const cleanValue = (value) => {
        return value === "null" || value === "" ? null : value;
      };

      const payload = {
        username: username.trim(),
        phone: phone.trim(),
        gender: cleanValue(gender),
        dob: cleanValue(dob),
      };

      
      const response = await axios.patch("http://127.0.0.1:8000/api/Users/profile/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });


      if (response.status === 200) {
        const updated = response.data.user;

        // Update localStorage
        localStorage.setItem('username', updated.username || "");
        localStorage.setItem('phone', updated.phone || "");
        localStorage.setItem('gender', updated.gender || "");
        localStorage.setItem('dob', updated.dob || "");

        setEditMode(false);
        setMessage("Profile updated successfully!");
        setMessageStatus(false);

        setTimeout(() => {
          setMessage('');
        }, 2000);
      }

    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile. Please try again.");
      setMessageStatus(true);
    }
};


  return (
    <div className=" dark:bg-gray-900 dark:text-white flex justify-center">
      <div className={`py-4 px-10 border-2 border-secondary rounded-lg my-5 ${editMode ? 'w-1/2' : 'w-2/5'}`}>
        <h2 className="text-2xl font-medium mb-7 text-center text-secondary">My Profile</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="mb-4">
            <label className="block font-semibold mb-3">Username:</label>
            {editMode ? (
              <>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <p className="text-primary">{eUsername}</p>
              </>
            ) : (
              <p>{username}</p>
            )}
          </div>

          <div className={`mb-4 ${editMode ? 'hidden' : ''}`}>
            <label className="block font-semibold mb-3">Email:</label>
            <p>{email}</p>
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-3">Phone:</label>
            {editMode ? (
              <>
                <PhoneInput
                  country={'ma'}
                  value={phone}
                  onChange={phone => setPhone(phone)}
                  inputStyle={{
                    backgroundColor: 'transparent', // on laisse vide ici
                  }}
                  inputClass="!w-full !h-[40px] !pl-[48px] !rounded-md !border !border-gray-300 !bg-white text-black placeholder-gray-500 dark:!bg-gray-700 dark:!border-gray-600 dark:!text-white dark:!placeholder-gray-400"
                  buttonClass="!bg-transparent dark:!bg-gray-700"
                  containerClass="!w-full"
                  dropdownClass="!w-auto !min-w-[200px] dark:!bg-gray-700 dark:!text-white"    
                />
                <p className="text-primary">{ePhone}</p>
              </>
              
            ) : (
              <p>+{phone}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-3">Gender:</label>
            {editMode ? (
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Select Gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            ) : (
              <p>{ (gender && gender !== "null") ? gender : "Not specified" }</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-3">Birthday:</label>
            {editMode ? (
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            ) : (
              <p>{ (dob && dob !== "null") ? dob : "Not specified" }</p>
            )}
          </div>

          
        </div>
        <p className={messageStatus ? 'text-primary' : 'text-blue-600'}>{message}</p>
        <div className="flex justify-between mt-6">
          {editMode ? (
            <>
              <button
                onClick={() => {
                  setEditMode(false);
                  resetFields();
                }}
                className="px-4 py-2 rounded bg-gradient-to-tr from-gray-400 to-gray-700 text-white hover:from-gray-700 hover:to-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-gradient-to-tr from-red-500 to-red-800 text-white hover:from-red-700 hover:to-red-700"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 rounded bg-gradient-to-tr from-blue-500 to-blue-800 hover:from-blue-800 hover:to-blue-800 text-white"
              >
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>
     
    </div>
  );
}
