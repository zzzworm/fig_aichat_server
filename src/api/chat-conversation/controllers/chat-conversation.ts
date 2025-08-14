/**
 * chat-conversation controller
 */

import { factories } from '@strapi/strapi'
import { v4 as uuidv4 } from 'uuid';

export default factories.createCoreController('api::chat-conversation.chat-conversation', ({ strapi }) => ({
  async createMessage(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized("User not authenticated");
      }

      const data = ctx.request.body.data;
      if (!data || !data.character_id) {
        return ctx.badRequest("Missing character_id field");
      }

      if (!data || !data.query) {
        return ctx.badRequest("Missing query field");
      }

      const query = data.query;
      const characterId = data.character_id;
      console.log("query:", query);
      console.log("characterId:", characterId);
      try {
        // Get AI Character's prompt
        const aiCharacter = await strapi
          .documents("api::ai-character.ai-character")
          .findOne({
            documentId: characterId,
          });

        if (!aiCharacter) {
          return ctx.badRequest("AI Character does not exist");
        }

        const { prompt } = aiCharacter;
        if (!prompt) {
          return ctx.badRequest("AI Character is missing prompt configuration");
        }

        // Create user message record
        const messageId = uuidv4();
        const queryConversation = await strapi
          .documents("api::chat-conversation.chat-conversation")
          .create({
            data: {
              message_id: messageId,
              query: query,
              ai_character: aiCharacter,
              user: user,
            },
          });

        // Call difyCall function
        const { difyCall } = await import('../../../utils/dify');
        
        const { result, task_id } = await difyCall({
          query: query,
          inputs: {
            "prompt": prompt,
          },
          user: user.documentId,
          ctx: ctx,
        });

        // Process dify response results, prioritize returned message_id and conversation_id
        let answer = "";
        let message_id;
        let conversation_id;

        if (Array.isArray(result)) {
          // Streaming response processing
          result.forEach((chunk) => {
            if (chunk.event === "message") {
              message_id = chunk.message_id;
              conversation_id = chunk.conversation_id;
            }
            if (chunk.answer) {
              answer += chunk.answer;
            }
          });
        } else {
          // Non-streaming response processing
          conversation_id = result.conversation_id;
          message_id = result.message_id;
          answer = result.answer;
        }

        console.log(
          "[api::chat-conversation] createMessage, answer:",
          answer,
        );

        // Create AI answer record
        const answerMessageId = message_id;
        const answerCreateData = {
          message_id: answerMessageId,
          query: queryConversation.query,
          answer: answer,
          ai_character: aiCharacter,
          user: user,
          conversation_id: conversation_id,
        };

        console.log("answerCreateData:", answerCreateData);

        const answeredConversation = await strapi
          .documents("api::chat-conversation.chat-conversation")
          .create({
            data: answerCreateData,
            populate: {
              ai_character: true,
              user: true,
            },
          });

        // Handle SSE streaming response
        if (ctx.sse) {
          ctx.sse.sendEnd({
            event: "completed",
            data: JSON.stringify([
              queryConversation,
              answeredConversation,
            ]),
          });
        } else {
          // Non-streaming response
          return ctx.send({
            data: [queryConversation, answeredConversation],
          });
        }

      } catch (error) {
        console.error("Error in connect to dify:", error);
        if (ctx.sse) {
          return ctx.sse.sendEnd({
            event: "error",
            data: error.message,
          });
        } else {
          return ctx.internalServerError(error);
        }
      }

    } catch (error) {
      ctx.status = 500;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorObj = new Error(`Internal server error occurred: ${errorMessage}`);
      errorObj.name = "ServerError";
      return ctx.internalServerError(errorObj);
    }
  },

  async myList(ctx) {
    try {
      // Get current user information from context
      const user = ctx.state.user;
      if (!user) {
        // If user is not authenticated, return 401 error
        return ctx.unauthorized("User not authenticated");
      }

      // Get pagination parameters
      const { page = 1, pageSize = 20 } = ctx.query;
      const paginationLimit = {
        start: (parseInt(page as string) - 1) * parseInt(pageSize as string),
        limit: parseInt(pageSize as string),
      };

      // Get filter conditions
      var filters = (ctx.query.filters as any) || {};

      // Always add user filter condition
      if (filters) {
        filters = {
          ...filters,
          user: {
            id: user.id,
          },
        };
      } else {
        filters = {
          user: {
            id: user.id,
          },
        };
      }

      // Build query parameters
      const querydata = {
        ...ctx.query,
        ...paginationLimit,
        filters: filters,
      };

      console.log("querydata:", querydata);

      // Build query conditions, only query conversations created by current user
      const results = await strapi
        .documents("api::chat-conversation.chat-conversation")
        .findMany({
          ...querydata,
          populate: ["ai_character", "user"],
          sort: [{ createdAt: "desc" }],
        });

      // Get total count for pagination
      const total = await strapi
        .documents("api::chat-conversation.chat-conversation")
        .count({
          ...querydata,
          populate: ["ai_character", "user"],
        });

      // Calculate pagination information
      var pagination: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
      } = {
        page: Math.floor(paginationLimit.start / paginationLimit.limit) + 1,
        pageSize: paginationLimit.limit,
        pageCount: Math.floor(total / paginationLimit.limit) + 1,
        total: total,
      };

      // Get model schema and sanitize output
      const schema = strapi.getModel(
        "api::chat-conversation.chat-conversation",
      );
      const sanitizedResults = await strapi.contentAPI.sanitize.output(
        results,
        schema,
      );

      console.log("sanitizedResults:", sanitizedResults);
      
      // Use transformResponse to return results
      return this.transformResponse(sanitizedResults, { pagination });

    } catch (error) {
      // Handle error, return 500 error
      console.error('Error in myList:', error);
      ctx.status = 500;
      return ctx.internalServerError(error);
    }
  },
}));
