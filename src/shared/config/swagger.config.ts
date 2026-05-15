import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Secure Authentication System API",
            version: "1.0.0",
            description: "Authentication system API documentation"
        },
        servers: [
            {
                url: "http://localhost:3000/api/v1",
            }
        ],
        componenets: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    bearer: "bearer",
                    bearerFormat: "JWT"
                },
            },
        },
        security: [
            {
                bearerAuth: []
            },
        ],
    },

    apis: ["./src/modules/**/*routes.ts"]
};

export const swaggerSpec = swaggerJSDoc(options);