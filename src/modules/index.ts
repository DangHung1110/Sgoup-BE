import { healthCheckRouter } from "./healthCheck/healthCheck.router";
import { healthCheckRegistry } from "./healthCheck/healCheck.registry";
import { AuthRouter } from "./auth/auth.router";
import { authRegistry } from "./auth/auth.registry";

export const Registries = [healthCheckRegistry, authRegistry];

export const modules = {
    AuthRouter,
    healthCheckRouter,
};