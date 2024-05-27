import './spinner.css';

const Spinner = ({ size = 32, marginTop = 20, isGray = false }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        marginTop,
      }}
      className={isGray ? 'spinner-gray' : 'spinner-white'}
    />
  );
};

export default Spinner;
