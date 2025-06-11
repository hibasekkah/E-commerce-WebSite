import React, { useState } from 'react'
import axios from 'axios';

export default function ChangePassword() {

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [eCurrentPassword, setECurrentPassword] = useState('');
  const [eNewPassword, setENewPassword] = useState('');
  const [eConfirmedPassword, setEConfirmedPassword] = useState('');
  const [eNotEqual, setENotEqual] = useState('');
  const [message, setMessage] = useState("");
  const [messageStatus, setMessageStatus] = useState(false);


  const handleSave = async () => {
    let isValid = true;
    const currentPasswordTrim = currentPassword.trim();
    const newPasswordTrim = newPassword.trim();
    const confirmedPasswordTrim = confirmedPassword.trim();

    if (!currentPasswordTrim) {
      setECurrentPassword('Please enter your current password.')
      isValid = false;
    } else {
      setECurrentPassword('');
    }

    if (!newPasswordTrim) {
      setENewPassword('Please enter your new password.')
      isValid = false;
    } else {
      setENewPassword('');
    }

    if (!confirmedPasswordTrim) {
      setEConfirmedPassword('Please confirm your new password.')
      isValid = false;
    } else {
      setEConfirmedPassword('');
    }

    if (newPasswordTrim && confirmedPasswordTrim && newPasswordTrim !== confirmedPasswordTrim) {
      setENotEqual("Passwords do not match.");
      isValid = false;
    } else {
      setENotEqual("");
    }  

    if (!isValid) return;

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

    const payload = {
      current_password: currentPasswordTrim,
      new_password: newPasswordTrim, 
      confirm_password: confirmedPasswordTrim
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/Users/password/change/", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }});

      if (res.status === 200) {
        setMessage("Your password was updated successfully.");
        setMessageStatus(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmedPassword('');
        setTimeout(()=>{
            setMessage("");
        }, 3000)

      } else {
        setMessage("Failed to update your password. Please try again.");
        setMessageStatus(true);
      }
    } catch (error) {
      let messageError = "Something went wrong.";
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          messageError = error.response.data;
        } else if (error.response.data.detail) {
          messageError = error.response.data.detail;
        } else {
          messageError = Object.values(error.response.data)
            .flat()
            .join("\n");
        }
      }
      setMessage(messageError);
      setMessageStatus(true);
    }
          

  }

  return (
    <div className=" dark:bg-gray-900 dark:text-white flex justify-center">
      <div className="py-4 px-10 border-2 border-secondary rounded-lg my-5 w-2/5">
        <h2 className="text-2xl font-medium mb-7 text-center text-secondary">Change Password</h2>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            /> 

            <div className="mb-5 text-primary">
              {eCurrentPassword}
            </div>
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            /> 

            <div className="mb-5 text-primary">
              {eNewPassword}
            </div>
          </div>
          <div className="mb-8">
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmedPassword}
              onChange={(e) => setConfirmedPassword(e.target.value)}
              className="border-2 p-2 w-full mb-1 rounded-lg border-secondary
                        dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            /> 

            <div className="mb-5 text-primary">
              {eConfirmedPassword ? eConfirmedPassword : eNotEqual}
            </div>
          </div>
          <div className="mb-4 flex flex-col gap-3">
             <p className={messageStatus ? 'text-primary' : 'text-blue-600'}>{message}</p>
            <button
              onClick={handleSave}
              className="px-4 py-2 w-full rounded bg-gradient-to-tr from-red-500 to-red-800 text-white hover:from-red-700 hover:to-red-700"
            >
              Save
            </button>
          </div>
         
      </div>
    </div>
  )
}
