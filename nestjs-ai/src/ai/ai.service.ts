import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { SuggestionsDto, PackingListDto, ItineraryDto } from './dto/ai.dto';

interface CacheEntry {
  data: any;
  expiresAt: number;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: OpenAI;
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
  private readonly MODEL = 'llama-3.3-70b-versatile';

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY || '',
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  private getCached(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, expiresAt: Date.now() + this.CACHE_TTL_MS });
  }

  private cacheKey(type: string, params: object): string {
    return `${type}:${JSON.stringify(params)}`;
  }

  async getSuggestions(dto: SuggestionsDto): Promise<object> {
    const key = this.cacheKey('suggestions', dto);
    const cached = this.getCached(key);
    if (cached) return cached;

    const dateRange =
      dto.startDate && dto.endDate
        ? `from ${dto.startDate} to ${dto.endDate}`
        : dto.startDate
        ? `starting ${dto.startDate}`
        : '';

    const interests =
      dto.interests?.length
        ? `The traveler is interested in: ${dto.interests.join(', ')}.`
        : '';

    const prompt = `You are a knowledgeable travel advisor. Provide practical travel suggestions for a trip to ${dto.destination} ${dateRange}. ${interests}

Return a JSON object with this structure:
{
  "destination": "${dto.destination}",
  "topAttractions": [{ "name": string, "description": string, "category": string }],
  "localTips": [string],
  "bestTimeToVisit": string,
  "budgetEstimate": { "budget": string, "midRange": string, "luxury": string },
  "transportation": string,
  "foodRecommendations": [{ "name": string, "type": string, "description": string }]
}

Return only valid JSON, no markdown, no extra text.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const content = response.choices[0]?.message?.content || '{}';
      const result = JSON.parse(content);
      this.setCache(key, result);
      return result;
    } catch (error) {
      this.logger.error('getSuggestions error', error);
      throw error;
    }
  }

  async getPackingList(dto: PackingListDto): Promise<object> {
    const key = this.cacheKey('packing', dto);
    const cached = this.getCached(key);
    if (cached) return cached;

    const dateRange =
      dto.startDate && dto.endDate
        ? `from ${dto.startDate} to ${dto.endDate}`
        : '';
    const tripType = dto.tripType ? `Trip type: ${dto.tripType}.` : '';

    const prompt = `You are a travel packing expert. Create a comprehensive packing list for a trip to ${dto.destination} ${dateRange}. ${tripType}

Return a JSON object with this structure:
{
  "destination": "${dto.destination}",
  "categories": [
    {
      "name": string,
      "items": [{ "item": string, "essential": boolean, "notes": string }]
    }
  ],
  "generalTips": [string]
}

Categories should include: Clothing, Documents & Money, Electronics, Toiletries, Health & Safety, Miscellaneous.
Return only valid JSON, no markdown, no extra text.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content || '{}';
      const result = JSON.parse(content);
      this.setCache(key, result);
      return result;
    } catch (error) {
      this.logger.error('getPackingList error', error);
      throw error;
    }
  }

  async getItinerary(dto: ItineraryDto): Promise<object> {
    const key = this.cacheKey('itinerary', dto);
    const cached = this.getCached(key);
    if (cached) return cached;

    const dateRange =
      dto.startDate && dto.endDate
        ? `from ${dto.startDate} to ${dto.endDate}`
        : 'for 5 days';
    const style = dto.style ? `Travel style: ${dto.style}.` : '';

    const prompt = `You are a travel itinerary planner. Create a day-by-day itinerary for a trip to ${dto.destination} ${dateRange}. ${style}

Return a JSON object with this structure:
{
  "destination": "${dto.destination}",
  "days": [
    {
      "day": number,
      "date": string,
      "theme": string,
      "morning": { "activity": string, "description": string, "duration": string },
      "afternoon": { "activity": string, "description": string, "duration": string },
      "evening": { "activity": string, "description": string, "duration": string },
      "tips": string
    }
  ],
  "overallTips": [string]
}

Return only valid JSON, no markdown, no extra text.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 3000,
      });

      const content = response.choices[0]?.message?.content || '{}';
      const result = JSON.parse(content);
      this.setCache(key, result);
      return result;
    } catch (error) {
      this.logger.error('getItinerary error', error);
      throw error;
    }
  }
}
