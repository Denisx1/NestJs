import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from './schema/auth-model';
import { AuthController } from './auth.controller';
import { AuthService } from './services/authService';
import { AuthRepository } from './repositories/auth.repository';
import { TokenService } from './services/tokenService';
import { PasswordService } from './services/passwordService';
import { jwtAuthGuard } from './guards/auth.guard';
import { UserModule } from 'src/user/user.module';
import { User, UserSchema } from 'src/user/schema/user-model';
import { RolesModule } from 'src/roles/roles.module';
import { ActionToken, ActionTokenSchema } from './schema/action-token-model';
import { ActionTokenRepository } from './repositories/actionTokenRepo';

@Module({
  imports: [
    RolesModule,
    forwardRef(() => UserModule),
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      {
        name: ActionToken.name,
        schema: ActionTokenSchema,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'AUTH_SERVICE',
      useClass: jwtAuthGuard,
    },
    AuthService,
    TokenService,
    PasswordService,
    AuthRepository,
    ActionTokenRepository,
  ],
  exports: [TokenService],
})
export class AuthModule {}
