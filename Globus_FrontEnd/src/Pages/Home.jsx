import React, { useState } from "react";
import Header from "../Components/Header";
import AdvBanner from "../Components/AdvBanner";
import Footer from "../Components/Footer";
import MenuItem from "../Components/MenuItem";
import PromotionCard from "../Components/PromotionCard";
import Timer from "../Components/Timer";
import ContactUs from "../Components/ContactUs";
import Products from "../Components/Products";
import Newsletter from "../Components/Newsletter";

const INITIAL_SECTION_COUNT = 4; // Up to Electronics
const TOTAL_SECTION_COUNT = 9;

const Home = () => {
  const [visibleSectionCount, setVisibleSectionCount] = useState(INITIAL_SECTION_COUNT);

  const isAllSectionsVisible = visibleSectionCount >= TOTAL_SECTION_COUNT;

  const handleToggleFeed = () => {
    if (!isAllSectionsVisible) {
      // Reveal 1 more section at a time
      setVisibleSectionCount((prev) => Math.min(TOTAL_SECTION_COUNT, prev + 1));
    } else {
      // Reset back to initial Electronics state and scroll smoothly to top
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setVisibleSectionCount(INITIAL_SECTION_COUNT);
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0 justify-center items-center lg:items-start mx-2 md:mx-20 px-4 md:px-6 mt-6">
        <div className="flex flex-col ">
          <MenuItem></MenuItem>
          <Timer></Timer>
        </div>
        <AdvBanner></AdvBanner>
        <PromotionCard></PromotionCard>
      </div>
      <Products visibleSectionCount={visibleSectionCount} />
      <Newsletter
        isAllSectionsVisible={isAllSectionsVisible}
        onToggleFeed={handleToggleFeed}
      />
    </>
  );
};

export default Home;
