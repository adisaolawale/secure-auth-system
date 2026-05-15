import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// This line is the missing link. It adds the .openapi() method to Zod.
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();