import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

const CalendarIcon = ({ width, height, color }) => (
  <Svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <Rect 
      x="3" 
      y="4" 
      width="18" 
      height="18" 
      rx="2" 
      stroke={color} 
      strokeWidth="2" 
    />
    <Path 
      d="M8 2V6" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
    />
    <Path 
      d="M16 2V6" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
    />
    <Path 
      d="M3 10H21" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
    />
  </Svg>
);

export default CalendarIcon;
