import type { Roles } from '@shevdi-home/shared';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Roles
  createdAt?: string;
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
