import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string> {
  transform(value: string): string {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`"${value}" is not a valid ObjectId`);
    }
    return value;
  }
}
