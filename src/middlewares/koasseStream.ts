import sse, { SseOptions } from "koa-sse-stream";
import { Context } from "koa";

// 定义中间件配置类型
interface KoaSseStreamConfig extends SseOptions {
  maxClients?: number;
  pingInterval?: number;
  closeEvent?: string;
  matchQuery?: string;
}

// module.exports = ({ strapi }) => {
//   return {
//     initialize() {
//       const config: KoaSseStreamConfig = {
//         maxClients: 1,
//         pingInterval: 10000,
//         closeEvent: "close",
//         matchQuery: "stream",
//       };
//       strapi.app.use(sse(config));
//       strapi.app.use(async (ctx: Context, next: () => Promise<any>) => {
//         const start = Date.now();
//         // 继续执行下一个中间件
//         await next();
//         const delta = Math.ceil(Date.now() - start);
//         ctx.set("X-Response-Time", delta + "ms");
//         // console.log("sse", sse);
//         console.log("middleware ctx", ctx);
//       });
//     },
//   };
// };

export default () => {
  const config: KoaSseStreamConfig = {
    maxClients: 1,
    pingInterval: 10000,
    closeEvent: "close",
    matchQuery: "stream",
  };
  return async (ctx, next) => {
    const start = Date.now();
    await sse(config)(ctx, next);
    //await next();
    const delta = Math.ceil(Date.now() - start);
    ctx.set("X-Response-Time", delta + "ms");
  };
};
