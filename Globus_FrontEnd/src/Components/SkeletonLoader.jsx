import React from "react";

const SkeletonLoader = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex flex-col space-y-3"
        >
          <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="flex justify-between items-center pt-2">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
