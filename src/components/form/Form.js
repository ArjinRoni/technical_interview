'use client';
import React, { useContext } from 'react';
import './form.css';

import { FontContext } from '@/contexts/FontContext';

const Form = ({ title, onSubmit, children }) => {
  const { primaryFont } = useContext(FontContext);

  return (
    <form className="form" onSubmit={onSubmit}>
      <p className="form-title" style={{ fontFamily: primaryFont.style.fontFamily }}>
        {title}
      </p>
      {children}
    </form>
  );
};

export default Form;
