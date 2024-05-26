import './button.css';

const Button = ({
  text = 'Next',
  type = 'button',
  borderRadius = 300,
  width = '100%',
  fontSize = 18,
  alignSelf = undefined,
  emoji = null,
  onClick = null,
}) => {
  return (
    <button
      style={{ alignSelf, borderRadius, width }}
      className="button"
      type={type}
      onClick={onClick ? onClick : null}
    >
      <p style={{ fontSize }}>{text}</p>
      {emoji && (
        <img
          style={{ marginLeft: 12 }}
          width={30}
          height={30}
          src={emoji === 'rocket' ? '/rocket.png' : emoji === 'plus' ? '/plus.png' : null}
        />
      )}
    </button>
  );
};

export default Button;
