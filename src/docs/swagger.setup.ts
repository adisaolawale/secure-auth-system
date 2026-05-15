import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { swaggerOptions } from "./swagger.config.js";

const swaggerSpec = swaggerJsdoc(swaggerOptions)

export const setupSwagger = (app: any) => {
    app.use(
        "/api/v1/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            explorer: true,
            customSiteTitle: "Secure auth system"
        })
    )
}


// import { generateSwaggerDoc } from "./swagger.config.js"

// export const setupSwagger = (app: any) => {
//     const swaggerSpec = generateSwaggerDoc()
//     app.use(
//         "/api/v1/api-docs",
//         swaggerUi.serve,
//         swaggerUi.setup(swaggerSpec, {
//             explorer: true,
//             customSiteTitle: "Secure auth system"
//         })
//     )
// }