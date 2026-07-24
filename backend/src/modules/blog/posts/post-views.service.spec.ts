import { PostViewsService } from './post-views.service';

describe('PostViewsService privacy helpers', () => {
  const config = {
    getOrThrow: jest.fn().mockReturnValue('test-analytics-salt'),
  };
  const service = new PostViewsService(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    config as never,
  );

  it('hashes identifiers deterministically and detects bots', () => {
    expect(service.hash('127.0.0.1')).toHaveLength(64);
    expect(service.hash('127.0.0.1')).toBe(service.hash('127.0.0.1'));
    expect(config.getOrThrow).toHaveBeenCalledWith('ANALYTICS_HASH_SALT');
    expect(service.deviceType('Googlebot/2.1')).toBe('bot');
    expect(service.deviceType('Mozilla/5.0 (iPhone)')).toBe('mobile');
  });
});
