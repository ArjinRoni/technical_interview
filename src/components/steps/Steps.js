import Step from '../step/Step';
import ImageUploadPrompt from '../image_upload_prompt/ImageUploadPrompt';
import VideoPreferences from '../video_preferences/VideoPreferences';

import './steps.css';

const Steps = () => {
  return (
    <div>
      <div className="steps">
        <Step
          no={1}
          title="Upload images"
          description="Our AI learns your product and visual style to set the stage for your ad."
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginTop: 18,
              gap: 12,
              alignSelf: 'center',
            }}
          >
            <img
              style={{ width: 80, height: 80, borderRadius: 8, alignSelf: 'center' }}
              src="./kundura_1.png"
            />
            <img
              style={{ width: 80, height: 80, borderRadius: 8, alignSelf: 'center' }}
              src="./kundura_2.png"
            />
            <img
              style={{ width: 80, height: 80, borderRadius: 8, alignSelf: 'center' }}
              src="./kundura_3.png"
            />
          </div>
          <ImageUploadPrompt />
        </Step>
        <Step
          no={2}
          title="Customize"
          description="Our virtual assistant helps you tailor the storyboard to your exact needs."
        >
          <VideoPreferences />
        </Step>
        <Step
          no={3}
          title="Generate video"
          description="You get a video ad that embodies your brand and engages your audience."
        >
          <img
            style={{ width: 240, height: 160, borderRadius: 8, alignSelf: 'center', marginTop: 8 }}
            src="./kundura_video.png"
          />
        </Step>
      </div>
    </div>
  );
};

export default Steps;
