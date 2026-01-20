import React from 'react'

interface ChainHoistIconProps {
  className?: string
  size?: number
}

export const ChainHoistIcon: React.FC<ChainHoistIconProps> = ({ 
  className = "", 
  size = 200 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 300"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top Hook */}
      <path
        d="M85 20 C85 15, 90 10, 100 10 C110 10, 115 15, 115 20 L115 35 C115 40, 110 45, 100 45 C90 45, 85 40, 85 35 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M100 10 C100 5, 105 0, 115 0 C125 0, 130 5, 130 15 C130 25, 125 30, 115 30"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* Main Housing */}
      <rect
        x="70"
        y="45"
        width="60"
        height="80"
        rx="8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* Housing Details */}
      <circle
        cx="100"
        cy="85"
        r="20"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Gear teeth inside circle */}
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <path d="M85 75 L90 80 L85 85" />
        <path d="M90 70 L95 75 L90 80" />
        <path d="M95 68 L100 73 L95 78" />
        <path d="M105 68 L110 73 L105 78" />
        <path d="M110 70 L115 75 L110 80" />
        <path d="M115 75 L110 80 L115 85" />
        <path d="M115 90 L110 95 L115 100" />
        <path d="M110 95 L105 100 L110 105" />
        <path d="M100 102 L95 97 L100 92" />
        <path d="M90 95 L85 100 L90 105" />
        <path d="M85 90 L90 95 L85 100" />
      </g>

      {/* Side Handle */}
      <rect
        x="130"
        y="75"
        width="25"
        height="8"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle
        cx="160"
        cy="79"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* Load Chain - Left Side */}
      <g stroke="currentColor" strokeWidth="2" fill="none">
        {/* Chain links going down */}
        <ellipse cx="85" cy="135" rx="4" ry="8" />
        <ellipse cx="85" cy="150" rx="4" ry="8" />
        <ellipse cx="85" cy="165" rx="4" ry="8" />
        <ellipse cx="85" cy="180" rx="4" ry="8" />
        <ellipse cx="85" cy="195" rx="4" ry="8" />
        <ellipse cx="85" cy="210" rx="4" ry="8" />
        <ellipse cx="85" cy="225" rx="4" ry="8" />
        <ellipse cx="85" cy="240" rx="4" ry="8" />
      </g>

      {/* Load Chain - Right Side (Hand Chain) */}
      <g stroke="currentColor" strokeWidth="2" fill="none">
        {/* Chain links going down */}
        <ellipse cx="115" cy="135" rx="4" ry="8" />
        <ellipse cx="115" cy="150" rx="4" ry="8" />
        <ellipse cx="115" cy="165" rx="4" ry="8" />
        <ellipse cx="115" cy="180" rx="4" ry="8" />
        <ellipse cx="115" cy="195" rx="4" ry="8" />
        <ellipse cx="115" cy="210" rx="4" ry="8" />
        <ellipse cx="115" cy="225" rx="4" ry="8" />
        <ellipse cx="115" cy="240" rx="4" ry="8" />
        <ellipse cx="115" cy="255" rx="4" ry="8" />
        <ellipse cx="115" cy="270" rx="4" ry="8" />
      </g>

      {/* Bottom Hook */}
      <path
        d="M75 250 C75 245, 80 240, 90 240 C100 240, 105 245, 105 250 L105 265 C105 270, 100 275, 90 275 C80 275, 75 270, 75 265 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M90 275 C90 280, 85 285, 75 285 C65 285, 60 280, 60 270 C60 260, 65 255, 75 255"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* Housing mounting points */}
      <circle cx="80" cy="55" r="2" fill="currentColor" />
      <circle cx="120" cy="55" r="2" fill="currentColor" />
      <circle cx="80" cy="115" r="2" fill="currentColor" />
      <circle cx="120" cy="115" r="2" fill="currentColor" />

      {/* Load block */}
      <rect
        x="75"
        y="230"
        width="30"
        height="15"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Load block sheave */}
      <circle
        cx="90"
        cy="237"
        r="5"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  )
}

export default ChainHoistIcon
