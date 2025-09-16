import axios from 'axios';
import config from '../config';
import {
  IServiceConfig,
  IHealthCheckResult,
  ISystemHealth,
  EServiceStatus
} from '../types';

export class HealthService {
  private static instance: HealthService;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private readonly services = config.services;

  public static getInstance(): HealthService {
    if (!HealthService.instance) {
      HealthService.instance = new HealthService();
    }
    return HealthService.instance;
  }

  public async checkServiceHealth(serviceName: string): Promise<IHealthCheckResult> {
    const service = this.services[serviceName];
    const startTime = Date.now();

    if (!service) {
      return {
        service: serviceName,
        status: EServiceStatus.UNKNOWN,
        error: 'Service configuration not found',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const response = await axios.get(`${service.url}${service.healthPath}`, {
        timeout: service.timeout,
        headers: {
          'User-Agent': 'API-Gateway/1.0 Health-Check',
          'X-Health-Check': 'true',
        },
      });

      const responseTime = Date.now() - startTime;
      const isHealthy = response.status === 200;

      // Update service health status
      service.isHealthy = isHealthy;
      service.lastHealthCheck = new Date();

      return {
        service: serviceName,
        status: isHealthy ? EServiceStatus.HEALTHY : EServiceStatus.UNHEALTHY,
        responseTime,
        timestamp: new Date().toISOString(),
      };

    } catch (error: any) {
      console.warn(`[Health Check] Service ${serviceName} health check failed:`, error.message);

      // Update service health status
      service.isHealthy = false;
      service.lastHealthCheck = new Date();

      const responseTime = Date.now() - startTime;

      return {
        service: serviceName,
        status: EServiceStatus.UNHEALTHY,
        responseTime,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  public async checkAllServices(): Promise<IHealthCheckResult[]> {
    const serviceNames = Object.keys(this.services);
    const healthPromises = serviceNames.map(name => this.checkServiceHealth(name));

    try {
      return await Promise.all(healthPromises);
    } catch (error) {
      console.error('[Health Check] Error checking all services:', error);
      return serviceNames.map(name => ({
        service: name,
        status: EServiceStatus.UNKNOWN,
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      }));
    }
  }

  public async getSystemHealth(): Promise<ISystemHealth> {
    const serviceResults = await this.checkAllServices();

    const healthyCount = serviceResults.filter(r => r.status === EServiceStatus.HEALTHY).length;
    const totalCount = serviceResults.length;

    let systemStatus: 'healthy' | 'degraded' | 'unhealthy';

    if (healthyCount === totalCount) {
      systemStatus = 'healthy';
    } else if (healthyCount > totalCount / 2) {
      systemStatus = 'degraded';
    } else {
      systemStatus = 'unhealthy';
    }

    return {
      status: systemStatus,
      services: serviceResults,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  public startHealthCheckInterval(intervalMs: number = 30000): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    console.log(`[Health Service] Starting health checks every ${intervalMs}ms`);

    this.healthCheckInterval = setInterval(async () => {
      try {
        const results = await this.checkAllServices();
        const healthyServices = results.filter(r => r.status === EServiceStatus.HEALTHY);

        console.log(`[Health Check] ${healthyServices.length}/${results.length} services healthy`);

        // Log unhealthy services
        const unhealthyServices = results.filter(r => r.status !== EServiceStatus.HEALTHY);
        if (unhealthyServices.length > 0) {
          console.warn('[Health Check] Unhealthy services:',
            unhealthyServices.map(s => `${s.service}: ${s.error || s.status}`));
        }
      } catch (error) {
        console.error('[Health Service] Health check interval error:', error);
      }
    }, intervalMs);
  }

  public stopHealthCheckInterval(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('[Health Service] Health check interval stopped');
    }
  }

  public getServiceStatus(serviceName: string): boolean {
    const service = this.services[serviceName];
    return service ? service.isHealthy : false;
  }

  public getAllServiceStatuses(): { [serviceName: string]: boolean } {
    const statuses: { [serviceName: string]: boolean } = {};

    Object.keys(this.services).forEach(name => {
      statuses[name] = this.services[name].isHealthy;
    });

    return statuses;
  }

  public async waitForService(serviceName: string, timeout: number = 30000): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const result = await this.checkServiceHealth(serviceName);

      if (result.status === EServiceStatus.HEALTHY) {
        return true;
      }

      // Wait 1 second before next check
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return false;
  }

  public async waitForAllServices(timeout: number = 60000): Promise<boolean> {
    const startTime = Date.now();
    const serviceNames = Object.keys(this.services);

    while (Date.now() - startTime < timeout) {
      const results = await this.checkAllServices();
      const healthyCount = results.filter(r => r.status === EServiceStatus.HEALTHY).length;

      if (healthyCount === serviceNames.length) {
        console.log('[Health Service] All services are healthy');
        return true;
      }

      console.log(`[Health Service] Waiting for services: ${healthyCount}/${serviceNames.length} healthy`);

      // Wait 2 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.warn('[Health Service] Timeout waiting for all services to be healthy');
    return false;
  }
}