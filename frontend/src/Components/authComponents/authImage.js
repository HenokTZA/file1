// src/components/RegisterImage.js
import React from 'react';
import PropTypes from 'prop-types';

const RegisterImage = ({ src, alt }) => (
  <div className="w-full h-60">
    <img 
      src={src} 
      alt={alt} 
      className="object-cover w-full h-full" 
    />
  </div>
);

RegisterImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
};

export default RegisterImage;
