import React, { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import LoginButton from "../Button/LoginButton";
import axios from "axios";

export default function Login({ onClose, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [eEmail, setEEmail] = useState("");
  const [ePassword, setEPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageStatus, setMessageStatus] = useState(false);

  const handleLogin = async () => {
    // Basic validation
    let isValid = true;

    if (!email.trim()) {
      setEEmail("Please enter a valid email address.");
      isValid = false;
    } else {
      setEEmail("");
    }

    if (!password.trim()) {
      setEPassword("Please enter your password.");
      isValid = false;
    } else {
      setEPassword("");
    }

    if (!isValid) return;

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
        }, 2500)
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
  };


  return (
    <div className="bg-white shadow-lg w-96 p-10 rounded-xl dark:bg-gray-900 dark:text-white">
      <div className="flex justify-between items-center text-xl font-bold relative">
        <h2 className="mx-auto text-blue-900 dark:text-blue-500">Log in</h2>
        <div className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer absolute right-0" onClick={onClose}>
          <IoClose />
        </div>
      </div>

      <hr className="border-blue-900 dark:border-blue-500 my-8" />

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
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full mb-1 rounded-lg
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      />
      <div className="mb-10 text-primary">
        {ePassword}
      </div>

      

      <div className="w-full flex flex-col gap-3 justify-center items-center">
        <LoginButton title="Login" className="w-full" onClick={handleLogin} />
        <p className={messageStatus ? 'text-primary' : 'text-blue-600'}>{message}</p>
        <p className="mt-3">
          Not a member ?   
          <span className="text-blue-600 cursor-pointer hover:text-blue-900 hover:font-semibold
                          dark:text-blue-400 dark:hover:text-blue-300" 
                onClick={onSwitchToRegister}>
            Create an account
          </span>
        </p>
      </div>

    </div>
  );
}
