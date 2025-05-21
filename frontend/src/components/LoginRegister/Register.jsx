import React, { useState, useRef } from "react";
import { IoClose } from "react-icons/io5";
import LoginButton from "../Button/LoginButton";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ReCAPTCHA from 'react-google-recaptcha';

export default function Register({ onClose, onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
    const recaptchaRef = useRef(null);
  
    const handleCaptchaChange = (token) => {
      setCaptchaToken(token);
    };
  
    const handleRegister = async (e) => {
      e.preventDefault();               // don’t let the form reload the page

      /* ----------------- 1. quick client-side validation ----------------- */
      if (!username || !email || !password || !confirmedPassword || !birthDay) {
        alert("Please fill in all required fields.");
        return;
      }

      if (password !== confirmedPassword) {
        alert("Passwords do not match.");
        return;
      }

      if (!captchaToken) {
        alert("Please complete the reCAPTCHA.");
        return;
      }

      /* ----------------- 2. build request body ----------------- */
      const payload = {
        username,
        email,
        password,
        phone: phoneNumber || null,
        gender: gender || null,
        dob: birthDay,          // Django expects YYYY-MM-DD string → DateField
        recaptcha: captchaToken // name this the way your DRF view expects
      };

      /* ----------------- 3. POST to your Django endpoint ----------------- */
      try {
        const res = await fetch("http://127.0.0.1:8000/api/register/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
          // ✅ registration succeeded
          alert("Account created! You can now log in.");
          // clear the form or switch to the login modal
          onSwitchToLogin();
        } else {
          // ❌ server responded with 4xx/5xx – show details if provided
          const msg =
            data?.detail ||
            Object.values(data).flat().join("\n") || // DRF validation errors
            "Registration failed. Please try again.";
          alert(msg);
        }
      } catch (err) {
        // network / CORS / unexpected error
        console.error(err);
        alert("Something went wrong. Check your connection and try again.");
      } finally {
        /* ----------------- 4. always reset the CAPTCHA widget ------------- */
        if (recaptchaRef.current) recaptchaRef.current.reset();
        setCaptchaToken(null);
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
        className="border p-2 w-full mb-5 rounded-lg
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      />

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
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full mb-5 rounded-lg
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      /> 
      <input
        type="password"
        placeholder="Confirmed Password"
        value={confirmedPassword}
        onChange={(e) => setConfirmedPassword(e.target.value)}
        className="border p-2 w-full mb-5 rounded-lg
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      />

      <input
        type="date"
        placeholder="Birthday"
        value={birthDay}
        onChange={(e) => setBirthDay(e.target.value)}
        className="border p-2 w-full mb-5 rounded-lg 
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      />

      <div className="mb-5">
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


      <select
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        className="border p-2 w-full mb-5 rounded-lg
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      >
        <option value="">Select Gender</option>
        <option value="female">Female</option>
        <option value="male">Male</option>
      </select>

      <div className="mb-5">
        <ReCAPTCHA
          sitekey="6Le3XUErAAAAAIEgf-Sp2SAiVPJc6e0vLP16FwBK"
          onChange={handleCaptchaChange}
          ref={recaptchaRef}
        />
      </div>

      <div className="w-full flex flex-col gap-3 justify-center items-center">
        <LoginButton title="Register" className="w-full" onClick={handleRegister}/>
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
