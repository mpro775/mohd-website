import { PostViewsService } from './post-views.service';

describe('PostViewsService privacy helpers', () => {
  const service = Object.create(PostViewsService.prototype) as PostViewsService;

  it('hashes identifiers deterministically and detects bots', () => {
    expect(service.hash('salt:127.0.0.1')).toHaveLength(64);
    expect(service.hash('salt:127.0.0.1')).toBe(service.hash('salt:127.0.0.1'));
    expect(service.deviceType('Googlebot/2.1')).toBe('bot');
    expect(service.deviceType('Mozilla/5.0 (iPhone)')).toBe('mobile');
  });
});
