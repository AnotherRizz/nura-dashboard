import React from "react";

interface DeviceSkeletonProps {
  count?: number; // biar optional
}

const DeviceSkeleton: React.FC<DeviceSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse p-6 border rounded-xl bg-gray-100 dark:bg-gray-800 h-40"
        >
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
};

export default DeviceSkeleton;
