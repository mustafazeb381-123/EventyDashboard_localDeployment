// Loader.jsx
import React from 'react';
import './Loader.css'; // Create this CSS file

const Loader = (height:any, width:any) => {
  return (
    <div  className="loader-container">
      <div style={{height, width}} className="spinner"></div>
    </div>
  );
};

export default Loader;
