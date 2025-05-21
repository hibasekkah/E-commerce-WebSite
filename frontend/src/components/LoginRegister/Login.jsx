import React, { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import LoginButton from "../Button/LoginButton";

export default function Login({ onClose, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        className="border p-2 w-full mb-5 rounded-lg
                dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      />

      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full mb-10 rounded-lg
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      />

      <div className="w-full flex flex-col gap-3 justify-center items-center">
        <LoginButton title="Login" className="w-full" />
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
