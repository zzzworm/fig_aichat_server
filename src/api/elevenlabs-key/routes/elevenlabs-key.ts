export default {
  routes: [
    {
      method: "GET",
      path: "/elevenlabs-key",
      handler: "elevenlabs-key.getElevenLabsKey",
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
};
