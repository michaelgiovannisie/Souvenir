import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { JwtStrategy } from '../auth/jwt.strategy';

@Module({
  imports: [PassportModule],
  controllers: [AiController],
  providers: [AiService, JwtStrategy],
})
export class AiModule {}
