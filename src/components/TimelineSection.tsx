import React, { useRef, useEffect, useState } from "react";
import timelinePart1 from "@/assets/timeline-part1.png";
import timelinePart2 from "@/assets/timeline-part2.png";

const TimelineSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const image1Ref = useRef<HTMLDivElement>(null);
  const image2Ref = useRef<HTMLDivElement>(null);
  const [parallax1, setParallax1] = useState(0);
  const [parallax2, setParallax2] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;

      // Parallax calculations for each image
      if (image1Ref.current) {
        const rect1 = image1Ref.current.getBoundingClientRect();
        const centerOffset1 = (rect1.top + rect1.height / 2 - windowHeight / 2) / windowHeight;
        setParallax1(centerOffset1 * -30);
      }

      if (image2Ref.current) {
        const rect2 = image2Ref.current.getBoundingClientRect();
        const centerOffset2 = (rect2.top + rect2.height / 2 - windowHeight / 2) / windowHeight;
        setParallax2(centerOffset2 * -40);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Timeline Section 1 */}
      {/* <section id="linha-temporal" ref={sectionRef} className="w-full bg-[#0e873d] py-8 md:py-12 overflow-hidden">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
          <div
            ref={image1Ref}
            className="will-change-transform"
            style={{
              transform: `translateY(${parallax1}px)`
            }}
          >
            <img
              src={timelinePart1}
              alt="Linha temporal Cooprosoja - parte 1"
              className="w-full h-auto"
            // loading="lazy"
            />
          </div>
        </div>
      </section> */}

      {/* Wave Divider between sections */}
      <div className="w-full overflow-hidden bg-[#0e873d]">
        <svg
          viewBox="0 0 1440 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          preserveAspectRatio="none"
        >
          <path
            d="M0 20C240 40 480 0 720 20C960 40 1200 0 1440 20V40H0V20Z"
            fill="#81b62d"
          />
        </svg>
      </div>

      {/* Timeline Section 2 */}
      {/* <section className="w-full bg-[#81b62d] py-8 md:py-12 overflow-hidden">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
          <div
            ref={image2Ref}
            className="will-change-transform"
            style={{
              transform: `translateY(${parallax2}px)`
            }}
          >
            <img
              src={timelinePart2}
              alt="Linha temporal Cooprosoja - parte 2"
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        </div>
      </section> */}
    </>
  );
};

export default TimelineSection;
