import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { SeoService } from './seo.service';

@Public()
@Controller()
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('sitemap.xml')
  async sitemap(@Res() res: Response) {
    res.type('application/xml').send(await this.seoService.generateSitemap());
  }

  @Get('robots.txt')
  robots(@Res() res: Response) {
    res.type('text/plain').send(this.seoService.generateRobots());
  }

  @Get('rss.xml')
  async rss(@Res() res: Response) {
    res.type('application/rss+xml').send(await this.seoService.generateRss());
  }

  @Get('feed.xml')
  async feed(@Res() res: Response) {
    res.type('application/rss+xml').send(await this.seoService.generateRss());
  }
}
