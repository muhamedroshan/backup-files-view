import React, { useState } from "react";

const PasswordPrompt = ({ visible, onConfirm, onCancel, title }) => {
  const [password, setPassword] = useState("");

  if (!visible) return null;

  const handleConfirm = () => {
    onConfirm(password);
    setPassword(""); // Clear after use
  };

  const handleCancel = () => {
    onCancel();
    setPassword(""); // Clear after cancel
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4 text-center">{title}</h2>
        <input
          type="password"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordPrompt;
