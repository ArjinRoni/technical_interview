'use client';
import { useInView } from 'react-intersection-observer';
import './step.css';

import { useFont } from '@/contexts/FontContext';

const Step = ({ no = 1, title, description, children }) => {
  const { primaryFont } = useFont();
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true }); // Detect when component is in view
  const delay = (no - 1) * 0.5; // Calculate the delay based on the step number

  return (
    <div
      ref={ref}
      className={`step ${inView ? 'animate' : ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="step-title-row">
        <div className="step-no-circle">
          <p className="step-no" style={{ fontFamily: primaryFont.style.fontFamily }}>
            {no}
          </p>
        </div>
        <p className="step-title" style={{ fontFamily: primaryFont.style.fontFamily }}>
          {title}
        </p>
      </div>
      <p className="step-description">{description}</p>
      {children}
    </div>
  );
};

export default Step;
