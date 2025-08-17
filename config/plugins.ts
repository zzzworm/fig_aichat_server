export default ({ env }) => ({
  "users-permissions": {
    config: {
      jwt: {
        expiresIn: "180d",
      },
      jwtSecret: env("JWT_SECRET"),
  },
},
"strapi-plugin-populate-deep": {
    config: {
      defaultDepth: 3,
    },
  }
});
