import { Controller, All, HttpException, HttpStatus } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';

@Public()
@Controller([
  'projects',
  'blog/posts',
  'blog/categories',
  'blog/tags',
  'services',
  'technologies',
  'links',
  'profile',
  'contact',
])
export class DeprecatedController {
  @All()
  handleDeprecatedRoot() {
    this.throwGone();
  }

  @All('*')
  handleDeprecatedSub() {
    this.throwGone();
  }

  private throwGone() {
    throw new HttpException(
      'This endpoint is deprecated. Use /api/public/... or /api/admin/...',
      HttpStatus.GONE,
    );
  }
}
