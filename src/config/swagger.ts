import swaggerJSDoc from "swagger-jsdoc";
import { env } from "./env.js";

// Full OpenAPI spec is defined inline (apis: []) so no route file needs
// JSDoc annotations. Add paths here when you add endpoints.
const successMessage = {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    message: { type: "string" },
  },
} as const;

const bearer = [{ bearerAuth: [] }];

const emailBody = (extra: Record<string, unknown> = {}) => ({
  required: true,
  content: {
    "application/json": {
      schema: {
        type: "object",
        required: ["email", ...Object.keys(extra)],
        properties: { email: { type: "string", format: "email" }, ...extra },
      },
    },
  },
});

const jsonBody = (schemaRef: string) => ({
  required: true,
  content: { "application/json": { schema: { $ref: `#/components/schemas/${schemaRef}` } } },
});

const responses = {
  ok: (desc: string, schema = "SuccessMessage") => ({
    [200]: { description: desc, content: { "application/json": { schema: { $ref: `#/components/schemas/${schema}` } } } },
  }),
  validation: { 400: { description: "Validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } } } },
  unauthorized: { 401: { description: "Missing or invalid access token", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } } },
};

const definition: swaggerJSDoc.Options["definition"] = {
  openapi: "3.0.3",
  info: {
    title: "Authentication Service API",
    version: "1.0.0",
    description:
      "Production-grade authentication service: registration, JWT auth, refresh-token rotation, session management, email verification and password flows.",
  },
  servers: [{ url: `${env.APP_URL}/api/v1`, description: "Base URL" }],
  tags: [
    { name: "Authentication", description: "Register, login, tokens, current user" },
    { name: "Sessions", description: "List and revoke active sessions" },
    { name: "Password", description: "Forgot / reset / change password" },
    { name: "Email", description: "Email verification" },
    { name: "System", description: "Service health" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      SuccessMessage: successMessage,
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Invalid credentials" },
        },
      },
      ValidationError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Validation failed" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: { path: { type: "string", example: "email" }, message: { type: "string", example: "Invalid email" } },
            },
          },
        },
      },
      AuthTokens: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Login successful" },
          data: {
            type: "object",
            properties: {
              accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsIn..." },
              refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsIn..." },
            },
          },
        },
      },
      RegisterInput: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 3, example: "Ada Lovelace" },
          email: { type: "string", format: "email", example: "ada@example.com" },
          password: { type: "string", minLength: 8, example: "Str0ng!Pass", description: "Min 8 chars, upper, lower, number, symbol" },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "ada@example.com" },
          password: { type: "string", example: "Str0ng!Pass" },
        },
      },
      RefreshInput: {
        type: "object",
        required: ["refreshToken"],
        properties: { refreshToken: { type: "string" } },
      },
      ResetPasswordInput: {
        type: "object",
        required: ["token", "password"],
        properties: { token: { type: "string" }, password: { type: "string", minLength: 8 } },
      },
      ChangePasswordInput: {
        type: "object",
        required: ["currentPassword", "newPassword"],
        properties: { currentPassword: { type: "string" }, newPassword: { type: "string", minLength: 8 } },
      },
      User: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              id: { type: "string", example: "clx123abc" },
              name: { type: "string", example: "Ada Lovelace" },
              email: { type: "string", format: "email", example: "ada@example.com" },
              isEmailVerified: { type: "boolean", example: true },
              createdAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
      Sessions: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", example: "clxSession1" },
                device: { type: "string", example: "Chrome on macOS" },
                ip: { type: "string", nullable: true, example: "203.0.113.5" },
                lastActive: { type: "string", format: "date-time" },
                createdAt: { type: "string", format: "date-time" },
                current: { type: "boolean", example: true },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: { ...responses.ok("Service is running") },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        requestBody: jsonBody("RegisterInput"),
        responses: {
          201: { description: "User registered; verification email queued", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessMessage" } } } },
          409: { description: "Email already exists", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          ...responses.validation,
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Log in (rate limited: 5 requests / 60s)",
        requestBody: jsonBody("LoginInput"),
        responses: {
          200: { description: "Login successful", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthTokens" } } } },
          401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          429: { description: "Too many requests", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          ...responses.validation,
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Authentication"],
        summary: "Rotate refresh token, issue new access token",
        requestBody: jsonBody("RefreshInput"),
        responses: {
          200: { description: "Token refreshed", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthTokens" } } } },
          401: { description: "Invalid or reused refresh token", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          ...responses.validation,
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get the current authenticated user",
        security: bearer,
        responses: {
          200: { description: "Current user", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          ...responses.unauthorized,
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Log out the current session",
        security: bearer,
        responses: { ...responses.ok("Logged out"), ...responses.unauthorized },
      },
    },
    "/auth/logout-all": {
      post: {
        tags: ["Authentication"],
        summary: "Log out of all sessions",
        security: bearer,
        responses: { ...responses.ok("Logged out of all sessions"), ...responses.unauthorized },
      },
    },
    "/auth/sessions": {
      get: {
        tags: ["Sessions"],
        summary: "List active sessions",
        security: bearer,
        responses: {
          200: { description: "Active sessions", content: { "application/json": { schema: { $ref: "#/components/schemas/Sessions" } } } },
          ...responses.unauthorized,
        },
      },
    },
    "/auth/sessions/{id}": {
      delete: {
        tags: ["Sessions"],
        summary: "Revoke a specific session",
        security: bearer,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          ...responses.ok("Session revoked"),
          404: { description: "Session not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          ...responses.unauthorized,
        },
      },
    },
    "/auth/verify-email": {
      post: {
        tags: ["Email"],
        summary: "Verify email with a token",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["token"], properties: { token: { type: "string" } } } } } },
        responses: { ...responses.ok("Email verified"), ...responses.validation, 400: { description: "Invalid or expired token", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } } },
      },
    },
    "/auth/resend-verification": {
      post: {
        tags: ["Email"],
        summary: "Resend the verification email",
        requestBody: emailBody(),
        responses: { ...responses.ok("Verification email sent (if applicable)"), ...responses.validation },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Password"],
        summary: "Request a password reset email",
        requestBody: emailBody(),
        responses: { ...responses.ok("Reset email sent (if applicable)"), ...responses.validation },
      },
    },
    "/auth/reset-password": {
      post: {
        tags: ["Password"],
        summary: "Reset password using a token",
        requestBody: jsonBody("ResetPasswordInput"),
        responses: { ...responses.ok("Password reset"), ...responses.validation, 400: { description: "Invalid or expired token", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } } },
      },
    },
    "/auth/change-password": {
      post: {
        tags: ["Password"],
        summary: "Change password for the current user",
        security: bearer,
        requestBody: jsonBody("ChangePasswordInput"),
        responses: {
          ...responses.ok("Password changed"),
          401: { description: "Current password incorrect / not authenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          ...responses.validation,
        },
      },
    },
  },
};

export const swaggerSpec = swaggerJSDoc({ definition, apis: [] });
