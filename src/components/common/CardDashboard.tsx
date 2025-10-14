import React from "react";
import { useAuth } from "../../context/AuthContext";

const CardDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-md text-center">
        <p className="text-gray-600">Belum ada user yang login.</p>
      </div>
    );
  }

  return (
    <div className="p-6 border-gray-200 bg-white  dark:border-gray-800 dark:bg-white/[0.03] rounded-2xl h-64 shadow-md flex flex-col items-center gap-4">
      {/* Avatar */}
      <div className="flex-shrink-0">
       <div className=" w-44 h-44 overflow-hidden border border-gray-200 dark:border-gray-800 rounded-full">
              <img src="/images/user/profile.png" alt="user" />
            </div>
      </div>

    </div>
  );
};

export default CardDashboard;
