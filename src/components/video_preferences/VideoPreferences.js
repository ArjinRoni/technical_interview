import './video_preferences.css';

const VideoPreferences = () => {
  const Preference = ({ title, text }) => {
    return (
      <div>
        <p style={{ marginBottom: 6, opacity: 0.5, fontSize: 12 }}>{title}</p>
        <div className="video_preferences_input_div">
          <p>{text}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="video_preferences_div">
      {/*<div className="video_preferences_div_row">
        <img style={{ width: 30, height: 30, opacity: 0.5 }} src="./video-camera.png" />
        <p style={{ opacity: 0.5 }}>Preferences</p>
  </div>*/}
      <Preference title="Brand Description" text="Istanbul-based luxury shoe brand" />
      <Preference title="Visual Style" text="Misty, dawn, textural elegance, heritage" />
      <Preference title="Target Audience" text="20-40 year old males who like leather" />
    </div>
  );
};

export default VideoPreferences;
