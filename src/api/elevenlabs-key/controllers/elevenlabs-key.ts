/**
 * elevenlabs-key controller
 */

import { factories } from "@strapi/strapi";

export default {
  async getElevenLabsKey(ctx) {
    try {

      return ctx.send({
        api_key: process.env.ELEVENLABS_API_KEY,
      });
    } catch (error) {
      console.error("Error getting ElevenLabs key:", error);
      return ctx.badRequest("get ElevenLabs key failed");
    }
  },
};
