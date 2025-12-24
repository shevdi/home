import { Roles } from "../common";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Roles
  createdAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  uptime: number;
  timestamp: string;
  environment: string;
}

export interface DatabaseConfig {
  url: string;
  name: string;
  options?: {
    useNewUrlParser?: boolean;
    useUnifiedTopology?: boolean;
  };
}

export * from './drime'
