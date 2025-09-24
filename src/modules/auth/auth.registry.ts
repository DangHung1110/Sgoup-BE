import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { createApiResponse } from "../../swagger/openAPIResponseBuilders";

extendZodWithOpenApi(z);
export const authRegistry = new OpenAPIRegistry();

const RegisterRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  age: z.number().optional(),
});

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
});

const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const LoginResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
});

authRegistry.register("RegisterRequest", RegisterRequestSchema);
authRegistry.register("User", UserSchema);
authRegistry.register("LoginRequest", LoginRequestSchema);
authRegistry.register("LoginResponse", LoginResponseSchema);

authRegistry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/RegisterRequest" },
      },
    },
  },
  responses: createApiResponse(
    UserSchema,
    "User registered successfully"
  ),
});

authRegistry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/LoginRequest" },
      },
    },
  },
  responses: createApiResponse(
    LoginResponseSchema,
    "Login successful"
  ),
});

authRegistry.registerPath({
  method: "get",
  path: "/auth/google",
  tags: ["Auth"],
  responses: createApiResponse(
    z.null(),
    "Redirect to Google OAuth"
  ),
});

authRegistry.registerPath({
  method: "get",
  path: "/auth/google/callback",
  tags: ["Auth"],
  responses: createApiResponse(
    LoginResponseSchema,
    "Login with Google successful"
  ),
});

authRegistry.registerPath({
  method: "get",
  path: "/auth/facebook",
  tags: ["Auth"],
  responses: createApiResponse(
    z.null(),
    "Redirect to Facebook OAuth"
  ),
});

authRegistry.registerPath({
  method: "get",
  path: "/auth/facebook/callback",
  tags: ["Auth"],
  responses: createApiResponse(
    LoginResponseSchema,
    "Login with Facebook successful"
  ),
});
