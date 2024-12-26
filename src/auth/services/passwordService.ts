import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ApiError } from 'src/errors/errorhandler';

@Injectable()
export class PasswordService {
  async doesPasswordSame(
    hashPassword: string,
    password: string,
  ): Promise<boolean> {
    const isSame = await bcrypt.compare(password, hashPassword);
    if (!isSame) {
      throw new ApiError(`wrong password`, 401);
    }
    return isSame;
  }
  async hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  }
}
