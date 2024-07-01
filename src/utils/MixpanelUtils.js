// server-mixpanel.js
'use server';

const Mixpanel = require('mixpanel');

let mixpanelInstance = null;

export const initMixpanel = () => {
  if (!mixpanelInstance) {
    mixpanelInstance = Mixpanel.init(process.env.MIXPANEL_TOKEN);
  }
  return mixpanelInstance;
};

export const trackServerSideEvent = async (eventName, properties) => {
  const mixpanel = initMixpanel();
  mixpanel.track(eventName, properties);
};
