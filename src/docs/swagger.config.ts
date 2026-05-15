import swaggerJSDoc from "swagger-jsdoc";

export const swaggerOptions: swaggerJSDoc.Options = {
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
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
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

    apis: [
        "./src/docs/routes/*.ts", // route docs
        "./src/docs/schemas/*.ts"
    ]
};

// import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi"
// import { registry } from "./registry.js"

// import "./routes/auth.docs.js";
// import "./schemas/user.schema.js";

// export const generateSwaggerDoc = () => {
//     const generator = new OpenApiGeneratorV3(registry.definitions)

//     return generator.generateDocument({
//         openapi: "3.0.0",
//         info: {
//             title: "Secure Auth API",
//             version: "1.0.0",
//             description: "Production-grade authentication system",
//         },
//         servers: [
//             {
//                 url: "http://localhost:3000",
//             },
//         ]
//     })
// }