import express, { type Express } from "express";
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import session from 'express-session'

import swaggerUi from "swagger-ui-express"

import { errorMiddleware } from "./shared/middleware/error.middleware.js"
import passport from "./shared/middleware/googlePassport.middleware.js"
import authRoutes from "./modules/auth/auth.routes.js"
import roleRoutes from "./modules/role/role.routes.js"
import userRoutes from "./modules/user/user.routes.js"
import { swaggerSpec } from "./shared/config/swagger.config.js";
import { setupSwagger } from "./docs/swagger.setup.js";


const app: Express = express()

// ── Security middleware
app.use(helmet())
app.use(cors({
  origin: '*', // For testing, or specify your Expo local origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));

// ── Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(compression())
app.use(cookieParser())

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize())
// ── Logging
if (process.env['NODE_ENV'] === 'development') {
  app.use(morgan('dev'))
}


setupSwagger(app)


// Routes
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/role", roleRoutes)
app.use("/api/v1/user", userRoutes)

// app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use(errorMiddleware)

app.get("/", (req, res) => {
  res.send("Auth API running...")
});

export default app; 