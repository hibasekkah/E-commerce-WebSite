import React, { useState, useRef } from "react";
import { IoClose } from "react-icons/io5";
import LoginButton from "../Button/LoginButton";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import axios from "axios"

export default function Register({ onClose, onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [eUsername, setEUsername] = useState("");
  const [eEmail, setEEmail] = useState("");
  const [ePassword, setEPassword] = useState("");
  const [eConfirmedPassword, setEConfirmedPassword] = useState("");
  const [eNotEqual, setENotEqual] = useState("");
  const [ePhone, setEPhone] = useState("");
  const [message, setMessage] = useState("");
  const [messageStatus, setMessageStatus] = useState(false);

  
  const handleRegister = async () => {
    // Basic validation
    let isValid = true;
    const usernameTrim = username.trim();
    const emailTrim = email.trim();
    const passwordTrim = password.trim();
    const confirmedPasswordTrim = confirmedPassword.trim();
    const phoneTrim = phoneNumber.trim();

    if (!usernameTrim) {
      setEUsername("Please enter your username.");
      isValid = false;
    } else {
      setEUsername("");
    }

    if (!emailTrim) {
      setEEmail("Please enter a valid email address.");
      isValid = false;
    } else {
      setEEmail("");
    }

    if (!passwordTrim) {
      setEPassword("Please enter your password.");
      isValid = false;
    } else {
      setEPassword("");
    }

    if (!confirmedPasswordTrim) {
      setEConfirmedPassword("Please confirm your password.");
      isValid = false;
    } else {
      setEConfirmedPassword("");
    }

    if (passwordTrim && confirmedPasswordTrim && passwordTrim !== confirmedPasswordTrim) {
      setENotEqual("Passwords do not match.");
      isValid = false;
    } else {
      setENotEqual("");
    }

    if (!phoneTrim) {
      setEPhone("Please enter a valid phone number.");
      isValid = false;
    } else {
      setEPhone("");
    }

    // Stop if any validation failed
    if (!isValid) return;

    const payload = {
      username: usernameTrim,
      email: emailTrim,
      password: passwordTrim,
      phone: phoneTrim,
      gender: gender || null,
      dob: birthDay || null,
    };

    try {
      // Register the user
      const res = await axios.post("http://127.0.0.1:8000/api/Users/register/", payload);

      if (res.status === 201 || res.status === 200) { //200 OK, 201 created
        setMessage(" Account created successfully! Redirecting...");
        setMessageStatus(false);
        setTimeout(async () => {
          const payload = {
            email,
            password,
          };

          try {
            const res = await axios.post("http://127.0.0.1:8000/api/Users/login/", payload);

            if (res.status === 200) {
              const { access, refresh, role, 
                      username, email, phone,
                      dob, gender } = res.data;
            
              // Store tokens if needed
              localStorage.setItem("access_token", access);
              localStorage.setItem("refresh_token", refresh);
              localStorage.setItem("role", role);
              localStorage.setItem("username", username);
              localStorage.setItem("email", email);
              localStorage.setItem("phone", phone);
              localStorage.setItem("dob", dob);
              localStorage.setItem("gender", gender);

              setMessage("Login successful!");
              setMessageStatus(false);
              setTimeout(()=>{
                  onClose();
                  setMessage("");
              }, 2000)
              // Optionally close the login modal
            } else {
              setMessage("Login failed. Please try again.");
              setMessageStatus(true);
            }
          } catch (error) {
            console.error("Login error:", error);
            const messageError =
              error.response?.data?.detail ||
              Object.values(error.response?.data || {}).flat().join("\n") ||
              "Something went wrong.";
            setMessage(messageError);
            setMessageStatus(true);
          }
        }, 2000);
      } else {
        setMessage("Registration failed. Please try again.");
        setMessageStatus(true);
      }
    } catch (error) {
      const messageError =
        error.response?.data?.detail ||
        Object.values(error.response?.data || {}).flat().join("\n") ||
        "Something went wrong.";
      setMessage(messageError);
      setMessageStatus(true);
    }
  };



  return (
    <div className="bg-white shadow-lg w-96 p-10 rounded-xl dark:bg-gray-900 dark:text-white">
      <div className="flex justify-between items-center text-xl font-bold relative">
        <h2 className="mx-auto text-blue-900 dark:text-blue-500">Register</h2>
        <div className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer absolute right-0" onClick={onClose}>
          <IoClose />
        </div>
      </div>

      <hr className="border-blue-900 dark:border-blue-500 my-8" />

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2 w-full mb-1 rounded-lg
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      />
      <div className="mb-5 text-primary">
        {eUsername}
      </div>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full mb-1 rounded-lg
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      />
      <div className="mb-5 text-primary">
        {eEmail}
      </div>

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full mb-1 rounded-lg
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      /> 
      <div className="mb-5 text-primary">
        {ePassword}
      </div>

      <input
        type="password"
        placeholder="Confirmed Password"
        value={confirmedPassword}
        onChange={(e) => setConfirmedPassword(e.target.value)}
        className="border p-2 w-full mb-1 rounded-lg
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      />
      <div className="mb-5 text-primary">
        {eConfirmedPassword ? eConfirmedPassword : eNotEqual}
      </div>

      <div className="mb-1">
        <PhoneInput
          country={'ma'}
          value={phoneNumber}
          onChange={phone => setPhoneNumber(phone)}
          inputStyle={{
            backgroundColor: 'transparent', // on laisse vide ici
          }}
          inputClass="!w-full !h-[40px] !pl-[48px] !rounded-md !border !border-gray-300 !bg-white text-black placeholder-gray-500 dark:!bg-gray-700 dark:!border-gray-600 dark:!text-white dark:!placeholder-gray-400"
          buttonClass="!bg-transparent dark:!bg-gray-700"
          containerClass="!w-full"
          dropdownClass="!w-auto !min-w-[200px] dark:!bg-gray-700 dark:!text-white"    
        />
      </div>
      <p className="mb-5 text-primary">
        {ePhone}
      </p>
      

      <input
        type="date"
        placeholder="Birthday"
        value={birthDay}
        onChange={(e) => setBirthDay(e.target.value)}
        className="border p-2 w-full mb-5 rounded-lg 
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      />

      <select
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        className="border p-2 w-full mb-5 rounded-lg
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      >
        <option value="">Select Gender</option>
        <option value="Female">Female</option>
        <option value="Male">Male</option>
      </select>


      <div className="w-full flex flex-col gap-3 justify-center items-center">
        <LoginButton title="Register" className="w-full" onClick={handleRegister}/>
        <p className={messageStatus ? 'text-primary' : 'text-blue-600'}>{message}</p>
        <p className="mt-3">
          Already got an account ? 
          <span className="text-blue-600 cursor-pointer hover:text-blue-900 hover:font-semibold
                          dark:text-blue-400 dark:hover:text-blue-300" 
                onClick={onSwitchToLogin}>
            Sign in here
          </span>
        </p>
      </div>

    </div>
  );
}
