import React, { useState, useEffect } from "react";

const Timer = () => {
  const calculateTimeLeft = () => {
    const now = new Date();
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );
    const difference = endOfMonth - now;

    if (difference <= 0) return null;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const updatedTime = calculateTimeLeft();
      setTimeLeft(updatedTime);
      if (!updatedTime) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!timeLeft)
    return (
      <div className="text-center text-xl font-bold p-4">
        Month End Deals are over!
      </div>
    );

  return (
    <>
      <div className="oswald text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-gray-900 dark:text-gray-100 flex text-center justify-center mt-3 lg:mt-4">
        <h1 className="text-gray-900 dark:text-gray-100">Monthly Deals</h1>
      </div>

      <div className="text-center bg-red-600 text-white font-bold mt-2.5 lg:mt-3 p-2 lg:p-2.5 xl:p-3 rounded-lg w-full lg:w-52 xl:w-64 2xl:w-80 mx-auto flex justify-around shadow-md gap-1">
        <div className="bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-md px-1 py-1 lg:px-1.5 lg:py-1.5 2xl:px-2 flex flex-col items-center flex-1 max-w-[48px] xl:max-w-[56px] 2xl:max-w-[60px]">
          <span className="text-sm lg:text-base xl:text-xl font-bold">{timeLeft.days}</span>
          <div className="text-[9px] lg:text-[10px] xl:text-xs">Days</div>
        </div>

        <div className="bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-md px-1 py-1 lg:px-1.5 lg:py-1.5 2xl:px-2 flex flex-col items-center flex-1 max-w-[48px] xl:max-w-[56px] 2xl:max-w-[60px]">
          <span className="text-sm lg:text-base xl:text-xl font-bold">{timeLeft.hours}</span>
          <div className="text-[9px] lg:text-[10px] xl:text-xs">Hours</div>
        </div>

        <div className="bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-md px-1 py-1 lg:px-1.5 lg:py-1.5 2xl:px-2 flex flex-col items-center flex-1 max-w-[48px] xl:max-w-[56px] 2xl:max-w-[60px]">
          <span className="text-sm lg:text-base xl:text-xl font-bold">{timeLeft.minutes}</span>
          <div className="text-[9px] lg:text-[10px] xl:text-xs">Min</div>
        </div>

        <div className="bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-md px-1 py-1 lg:px-1.5 lg:py-1.5 2xl:px-2 flex flex-col items-center flex-1 max-w-[48px] xl:max-w-[56px] 2xl:max-w-[60px]">
          <span className="text-sm lg:text-base xl:text-xl font-bold">{timeLeft.seconds}</span>
          <div className="text-[9px] lg:text-[10px] xl:text-xs">Sec</div>
        </div>
      </div>
    </>
  );
};

export default Timer;
