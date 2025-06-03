import React, { useState } from "react";

export default function Profile() {
  // userData example shape:
  // { username, email, phone, gender, dob }

  const [editMode, setEditMode] = useState(false);

  const [username, setUsername] = useState("Doha");
  const [email, setEmail] = useState("sghirdoha2@gmail.com");
  const [phone, setPhone] = useState("0612547896");
  const [gender, setGender] = useState("Female");
  const [dob, setDob] = useState("");

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!username.trim()) errs.username = "Username is required";
    if (!email.trim() || !email.includes("@")) errs.email = "Valid email required";
    // Add more validation if needed
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    // TODO: send update API call here, then
    setEditMode(false);
    alert("Profile updated!");
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md dark:bg-gray-900 dark:text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">My Profile</h2>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Username:</label>
        {editMode ? (
          <>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
          </>
        ) : (
          <p>{username}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Email:</label>
        {editMode ? (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </>
        ) : (
          <p>{email}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Phone:</label>
        {editMode ? (
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        ) : (
          <p>{phone}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Gender:</label>
        {editMode ? (
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Select Gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        ) : (
          <p>{gender || "Not specified"}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Birthday:</label>
        {editMode ? (
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        ) : (
          <p>{dob || "Not specified"}</p>
        )}
      </div>

      <div className="flex justify-between mt-6">
        {editMode ? (
          <>
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Save
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Edit Profile
            </button>
            <button
              
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
