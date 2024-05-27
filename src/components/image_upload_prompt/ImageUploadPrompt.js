import './image_upload_prompt.css';

const ImageUploadPrompt = () => {
  return (
    <div className="image_upload_prompt_div">
      <img style={{ width: 28, height: 28, marginRight: 12 }} src="./camera.png" />
      <p style={{ fontSize: 14, marginRight: 8 }}>
        Help me make a 30-second commercial for my shoe brand
      </p>
      <button className="image_upload_button">
        <p style={{ color: 'black', padding: 8, fontWeight: 500 }}>Go!</p>
      </button>
    </div>
  );
};

export default ImageUploadPrompt;
