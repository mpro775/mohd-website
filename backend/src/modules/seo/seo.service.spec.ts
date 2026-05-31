import { SeoService } from './seo.service';

describe('SeoService', () => {
  it('generates robots.txt with sitemap URL', () => {
    const service = new SeoService(
      { get: jest.fn().mockReturnValue('https://example.com') } as any,
      {} as any,
      {} as any,
      {} as any,
    );

    expect(service.generateRobots()).toContain(
      'Sitemap: https://example.com/sitemap.xml',
    );
  });
});
