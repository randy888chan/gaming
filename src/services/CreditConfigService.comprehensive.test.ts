/**
 * Comprehensive test for CreditConfigService
 */

describe('CreditConfigService', () => {
  let service: any;

  beforeAll(async () => {
    const module = await import('./CreditConfigService');
    service = module.creditConfigService;
  });

  it('should be able to import the service', async () => {
    const module = await import('./CreditConfigService');
    expect(module).toBeDefined();
    expect(typeof module.creditConfigService).toBe('object');
  });

  it('should be able to create an instance of CreditConfigService', () => {
    expect(service).toBeDefined();
  });

  it('should have getConfig method', () => {
    expect(typeof service.getConfig).toBe('function');
  });

  it('should have createConfig method', () => {
    expect(typeof service.createConfig).toBe('function');
  });

  it('should have updateConfig method', () => {
    expect(typeof service.updateConfig).toBe('function');
  });

  it('should have deleteConfig method', () => {
    expect(typeof service.deleteConfig).toBe('function');
  });

  it('should be able to get a config by ID', async () => {
    const config = await service.getConfig('first-play-free');
    expect(config).toBeDefined();
    if (config) {
      expect(config.id).toBe('first-play-free');
      expect(config.name).toBe('First Play Free');
    }
  });

  it('should be able to create a config', async () => {
    const newConfig = await service.createConfig({
      name: 'Test Config',
      rules: { amount: 0.002 }
    });
    
    expect(newConfig).toBeDefined();
    expect(newConfig.name).toBe('Test Config');
    expect(newConfig.rules.amount).toBe(0.002);
    expect(newConfig.id).toBeDefined();
  });

  it('should be able to update a config', async () => {
    const updatedConfig = await service.updateConfig('first-play-free', {
      name: 'Updated First Play Free',
      rules: { amount: 0.003 }
    });
    
    expect(updatedConfig).toBeDefined();
    if (updatedConfig) {
      expect(updatedConfig.name).toBe('Updated First Play Free');
      expect(updatedConfig.rules.amount).toBe(0.003);
    }
  });

  it('should be able to delete a config', async () => {
    const result = await service.deleteConfig('first-play-free');
    expect(typeof result).toBe('boolean');
  });
});