import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import type { LoginDto as ILoginDto } from '@annota/shared';

export class LoginDto implements ILoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
