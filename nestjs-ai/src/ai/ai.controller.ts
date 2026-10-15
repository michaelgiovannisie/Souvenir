import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuggestionsDto, PackingListDto, ItineraryDto } from './dto/ai.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('health')
  health() {
    return { status: 'ok', service: 'souvenir-ai', timestamp: new Date().toISOString() };
  }

  @UseGuards(JwtAuthGuard)
  @Post('suggestions')
  @HttpCode(HttpStatus.OK)
  async getSuggestions(@Body() dto: SuggestionsDto) {
    const data = await this.aiService.getSuggestions(dto);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard)
  @Post('packing-list')
  @HttpCode(HttpStatus.OK)
  async getPackingList(@Body() dto: PackingListDto) {
    const data = await this.aiService.getPackingList(dto);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard)
  @Post('itinerary')
  @HttpCode(HttpStatus.OK)
  async getItinerary(@Body() dto: ItineraryDto) {
    const data = await this.aiService.getItinerary(dto);
    return { success: true, data };
  }
}
