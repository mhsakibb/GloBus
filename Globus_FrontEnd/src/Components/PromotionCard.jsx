import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faShieldAlt,
  faLock,
  faHeadset,
} from "@fortawesome/free-solid-svg-icons";

const PromotionCard = () => {
  const features = [
    {
      id: 1,
      icon: faBolt,
      title: "Instant Delivery",
      description: "1-2 hour express delivery.",
      status: "LIVE TRACKING",
    },
    {
      id: 2,
      icon: faShieldAlt,
      title: "Quality Certified",
      description: "100% authentic products.",
      status: "VERIFIED",
    },
    {
      id: 3,
      icon: faLock,
      title: "Secure Payment",
      description: "Bank-level encryption.",
      status: "ENCRYPTED",
    },
    {
      id: 4,
      icon: faHeadset,
      title: "24/7 Support",
      description: "Round-the-clock support.",
      status: "ONLINE NOW",
    },
  ];

  const [gridState, setGridState] = useState([
    [1, 2],
    [3, 4],
  ]);
  const [currentTitle, setCurrentTitle] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const rotations = [
    {
      grid: [
        [1, 2],
        [3, 4],
      ],
      title: 1,
    },
    {
      grid: [
        [2, 4],
        [1, 3],
      ],
      title: 4,
    },
    {
      grid: [
        [4, 3],
        [2, 1],
      ],
      title: 3,
    },
    {
      grid: [
        [3, 1],
        [4, 2],
      ],
      title: 2,
    },
  ];

  const [rotationIndex, setRotationIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      handleRotate();
    }, 3000);

    return () => clearInterval(interval);
  }, [rotationIndex]);

  const handleRotate = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    // Next rotation state
    const nextIndex = (rotationIndex + 1) % rotations.length;
    const nextRotation = rotations[nextIndex];

    // Update grid and title
    setGridState(nextRotation.grid);
    setCurrentTitle(nextRotation.title);

    setTimeout(() => {
      setRotationIndex(nextIndex);
      setIsAnimating(false);
    }, 1000);
  };

  const getFeatureById = (id) => {
    return features.find((f) => f.id === id);
  };

  const getCurrentFeature = () => {
    return features.find((f) => f.id === currentTitle);
  };

  return (
    <div className="w-full lg:w-52 xl:w-64 2xl:w-80 flex flex-col items-center justify-start gap-2.5 lg:gap-3 xl:gap-6 p-2 lg:p-2.5 xl:p-4">
      {/* 2x2 Rubik's Grid */}
      <div className="relative w-36 h-36 lg:w-36 lg:h-36 xl:w-48 xl:h-48 2xl:w-56 2xl:h-56 grid grid-cols-2 grid-rows-2 gap-2 lg:gap-2.5 xl:gap-3.5 perspective-1000">
        {gridState.flat().map((featureId, index) => {
          const feature = getFeatureById(featureId);
          const row = Math.floor(index / 2);
          const col = index % 2;

          return (
            <div
              key={`${featureId}-${row}-${col}`}
              className={`bg-gradient-to-br from-red-600 to-red-700 rounded-lg lg:rounded-xl border border-red-400 flex items-center justify-center transition-all duration-700 ease-in-out transform ${
                isAnimating ? "rotate-y-180" : ""
              }`}
            >
              <FontAwesomeIcon
                icon={feature.icon}
                className="text-white text-base lg:text-lg xl:text-xl"
              />
            </div>
          );
        })}
      </div>

      {/* Title Display */}
      <div className="w-full max-w-[210px] lg:max-w-[210px] xl:max-w-[280px] bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-2.5 lg:p-3 xl:p-5 shadow-md border border-gray-200 dark:border-gray-700 transform transition-all duration-500">
        <div className="text-center">
          <h3 className="text-sm lg:text-base xl:text-xl font-bold text-gray-800 dark:text-gray-100 mb-0.5 lg:mb-1">
            {getCurrentFeature().title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-[11px] lg:text-xs xl:text-sm mb-1.5 lg:mb-2 line-clamp-2">
            {getCurrentFeature().description}
          </p>
          <div className="flex items-center justify-center space-x-1.5">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-600 text-[10px] lg:text-xs font-medium">
              {getCurrentFeature().status}
            </span>
          </div>
        </div>
      </div>

      {/* Rotation Indicator */}
      <div className="flex space-x-2">
        {rotations.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              rotationIndex === index
                ? "bg-red-600 scale-125"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PromotionCard;
