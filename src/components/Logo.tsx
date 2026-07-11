import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-32 h-32",
  };

  const textMap = {
    sm: "text-xs",
    md: "text-base",
    lg: "text-xl font-bold",
    xl: "text-4xl font-extrabold",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeMap[size]} relative flex items-center justify-center crown-logo`}>
        {/* Geometric Hexagon and Crown Shape */}
        <svg
          viewBox="0 0 42 42"
          className="w-full h-full text-gold drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hexagon Border */}
          <path
            d="M21 4L37 12V30L21 38L5 30V12L21 4Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Crown Peaks */}
          <rect x="15" y="8" width="3" height="5" fill="currentColor" rx="0.5" />
          <rect x="19.5" y="6" width="3" height="5" fill="currentColor" rx="0.5" />
          <rect x="24" y="8" width="3" height="5" fill="currentColor" rx="0.5" />
          
          {/* Golden Lettering BB inside */}
          <text
            x="21"
            y="28"
            textAnchor="middle"
            fill="currentColor"
            className="font-display font-black"
            style={{ fontSize: "12px", letterSpacing: "-0.5px" }}
          >
            BB
          </text>
        </svg>
      </div>
      
      {size === "xl" && (
        <div className="mt-4 text-center">
          <h1 className="text-2xl font-display font-black tracking-widest text-gold drop-shadow-[0_2px_10px_rgba(255,215,0,0.3)]">
            BB RULE MANAGER
          </h1>
          <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold font-sans">
            System Designed By Dream Tech Solution
          </p>
        </div>
      )}
    </div>
  );
}
