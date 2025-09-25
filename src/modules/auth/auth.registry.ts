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

const RefreshResponseSchema = z.object({
  accessToken: z.string(),
});

const ForgotPasswordRequestSchema = z.object({
  email: z.string().email().openapi({ example: "user@example.com" }),
});

const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1).openapi({ example: "<reset-token-from-email>" }),
  password: z.string().min(6).openapi({ example: "newStrongPassword123" })
});

authRegistry.register("RegisterRequest", RegisterRequestSchema);
authRegistry.register("User", UserSchema);
authRegistry.register("LoginRequest", LoginRequestSchema);
authRegistry.register("LoginResponse", LoginResponseSchema);
authRegistry.register("RefreshResponse", RefreshResponseSchema);
authRegistry.register("ForgotPasswordRequest", ForgotPasswordRequestSchema);
authRegistry.register("ResetPasswordRequest", ResetPasswordRequestSchema);

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
  method: "post",
  path: "/auth/refresh",
  tags: ["Auth"],
  description: "Reads refresh token from cookie and returns a new access token. Also sets a new refresh token cookie.",
  responses: createApiResponse(
    RefreshResponseSchema,
    "Refreshed tokens"
  ),
});

authRegistry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  description: "Clears the refreshToken cookie. In Swagger UI, also click 'Authorize' → 'Logout' to clear the in-memory bearer token.",
  responses: createApiResponse(
    z.null(),
    "Logged out"
  ),
});

authRegistry.registerPath({
  method: "post",
  path: "/auth/forgot-password",
  tags: ["Auth"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ForgotPasswordRequest" },
      },
    },
  },
  responses: createApiResponse(
    z.null(),
    "If email exists, a reset link has been sent"
  ),
});

authRegistry.registerPath({
  method: "post",
  path: "/auth/reset-password",
  tags: ["Auth"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ResetPasswordRequest" },
      },
    },
  },
  responses: createApiResponse(
    z.null(),
    "Password has been reset successfully"
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
