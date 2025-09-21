import { healthCheckRouter } from "./healthCheck/healthCheck.router.js";
import { healthCheckRegistry } from "./healthCheck/healCheck.registry.js";

export const Registries = [healthCheckRegistry];

export const modules = {
    healthCheckRouter,
};