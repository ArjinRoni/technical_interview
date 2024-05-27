import './spinner.css';

const Spinner = ({ size = 32 }) => {
  return <div style={{ width: size, height: size }} className="spinner" />;
};

export default Spinner;
