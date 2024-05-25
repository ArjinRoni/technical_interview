import React from 'react';
import Link from 'next/link';

import './redirector.css';

const Redirector = ({ href, text }) => {
  return (
    <div className="redirector">
      <Link href={href}>
        <p className="redirector-text">{text}</p>
      </Link>
    </div>
  );
};

export default Redirector;
