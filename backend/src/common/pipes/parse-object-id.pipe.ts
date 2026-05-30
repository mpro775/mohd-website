import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<any, string> {
  transform(value: any): string {
    const isValid = Types.ObjectId.isValid(value);
    if (!isValid) {
      throw new BadRequestException('معرّف غير صالح (Invalid ObjectId)');
    }
    return value;
  }
}
