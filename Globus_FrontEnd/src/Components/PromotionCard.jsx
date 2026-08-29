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
  const [flipped, setFlipped] = useState(false);

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger entry animation shortly after mount
    const mountTimer = setTimeout(() => {
      setMounted(true);
    }, 100);

    const interval = setInterval(() => {
      handleRotate();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(mountTimer);
    };
  }, [rotationIndex, flipped]); // Include flipped to get latest state

  const handleRotate = () => {
    // Next rotation state
    const nextIndex = (rotationIndex + 1) % rotations.length;
    const nextRotation = rotations[nextIndex];

    // Toggle the flip state to trigger the CSS transition
    setFlipped(!flipped);

    // Update grid and title exactly halfway through the 700ms animation (when the card is at 90 degrees and invisible)
    setTimeout(() => {
      setGridState(nextRotation.grid);
      setCurrentTitle(nextRotation.title);
      setRotationIndex(nextIndex);
    }, 350);
  };

  const getFeatureById = (id) => {
    return features.find((f) => f.id === id);
  };

  const getCurrentFeature = () => {
    return features.find((f) => f.id === currentTitle);
  };

  return (
    <div className="w-full lg:w-52 xl:w-64 2xl:w-80 flex flex-col items-center justify-start gap-4 sm:gap-6 lg:gap-3 xl:gap-6 p-4 sm:p-6 lg:p-2.5 xl:p-4 2xl:p-6">
      {/* 2x2 Rubik's Grid */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-36 lg:h-36 xl:w-48 xl:h-48 2xl:w-64 2xl:h-64 grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4 lg:gap-2.5 xl:gap-3.5 2xl:gap-4 perspective-1000">
        {gridState.flat().map((featureId, index) => {
          const feature = getFeatureById(featureId);
          const row = Math.floor(index / 2);
          const col = index % 2;

          return (
            <div
              key={`grid-cell-${row}-${col}`} // Fixed key so React reuses the DOM element for smooth transitions
              className={`transition-all duration-700 ease-out transform ${
                mounted
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-6 scale-75"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div
                className={`w-full h-full bg-gradient-to-br from-red-600 to-red-700 rounded-xl sm:rounded-2xl lg:rounded-xl 2xl:rounded-2xl border-2 lg:border border-red-400 2xl:border-2 flex items-center justify-center transition-all duration-700 ease-in-out transform ${
                  flipped ? "rotate-y-180" : ""
                }`}
              >
                <FontAwesomeIcon
                  icon={feature.icon}
                  className="text-white text-3xl sm:text-4xl lg:text-lg xl:text-xl 2xl:text-2xl"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Title Display */}
      <div className="w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[210px] xl:max-w-[280px] 2xl:max-w-xs bg-white dark:bg-gray-800 rounded-2xl lg:rounded-xl xl:rounded-2xl p-4 sm:p-5 lg:p-3 xl:p-5 2xl:p-6 shadow-lg lg:shadow-md 2xl:shadow-xl border border-gray-200 dark:border-gray-700 transform transition-all duration-500">
        <div className="text-center">
          <h3 className="text-lg sm:text-xl lg:text-base xl:text-xl 2xl:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1 lg:mb-1 2xl:mb-2">
            {getCurrentFeature().title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-xs xl:text-sm 2xl:text-base mb-2 lg:mb-2 2xl:mb-3 line-clamp-2">
            {getCurrentFeature().description}
          </p>
          <div className="flex items-center justify-center space-x-2 lg:space-x-1.5 2xl:space-x-2">
            <div className="w-2 h-2 lg:w-1.5 lg:h-1.5 2xl:w-2 2xl:h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-600 text-xs sm:text-sm lg:text-[10px] xl:text-xs 2xl:text-sm font-medium">
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
