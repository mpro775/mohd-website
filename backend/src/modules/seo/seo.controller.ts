import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { SeoService } from './seo.service';

@Public()
@Controller('public/seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('entries')
  async entries(
    @Query('page') pageValue?: string,
    @Query('limit') limitValue?: string,
  ) {
    const page = Math.max(1, Number(pageValue ?? 1));
    const limit = Math.min(500, Math.max(1, Number(limitValue ?? 200)));
    const result = await this.seoService.getEntries(page, limit);
    return {
      message: 'تم تحميل بيانات SEO',
      data: result.data,
      meta: result.meta,
    };
  }
}
