import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { IAuthModuleOptions, PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt'
import { IdentitiesModule } from '~/core/identities/identities.module'
import { JwtStrategy } from '~/core/auth/jwt.strategy'
import { LocalStrategy } from '~/core/auth/local.strategy'
import { EntitiesModule } from '~/core/entities/entities.module'

@Module({
  imports: [
    PassportModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...configService.get<IAuthModuleOptions>('passport.options', {}),
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...configService.get<JwtModuleOptions>('jwt.options', {}),
      }),
    }),
    IdentitiesModule,
    EntitiesModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
  ],
  controllers: [AuthController],
  exports: [
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}
