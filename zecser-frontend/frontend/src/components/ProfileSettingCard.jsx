import React from "react";
import { Pencil } from "lucide-react";

const ProfileSettingsCard = () => {
  return (
    <div className="w-full bg-white shadow-md rounded-xl p-6 border border-gray-200">
      {/* Profile Language */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">Profile language</h3>
          <p className="text-gray-600 text-sm">English</p>
        </div>
        <Pencil className="text-gray-500 cursor-pointer hover:text-blue-600" size={18} />
      </div>

      <hr className="my-2" />

      {/* Public Profile URL */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-800">Public profile & URL</h3>
          <p className="text-gray-600 text-sm">
            www.linkedin.com/in/
          </p>
        </div>
        <Pencil className="text-gray-500 cursor-pointer hover:text-blue-600" size={18} />
      </div>
    </div>
  );
};

export default ProfileSettingsCard;
