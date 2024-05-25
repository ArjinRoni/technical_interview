import React from 'react';
import Link from 'next/link';

import './redirector.css';

const Redirector = ({ href, text }) => {
  return (
    <Link className="redirector" href={href}>
      <p className="redirector-text">{text}</p>
      <img style={{ width: 24, height: 24 }} src="./arrow-right.png" />
    </Link>
  );
};

export default Redirector;
