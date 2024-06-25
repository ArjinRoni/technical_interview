import './spinner.css';

const Spinner = ({
  size = 32,
  marginTop = 20,
  extraStyle = {},
  isGray = false,
  isBlack = false,
  isDark = false,
}) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        marginTop,
        ...extraStyle,
      }}
      className={
        isGray
          ? 'spinner-gray'
          : isBlack
            ? 'spinner-black'
            : isDark
              ? 'spinner-dark'
              : 'spinner-white'
      }
    />
  );
};

export default Spinner;
