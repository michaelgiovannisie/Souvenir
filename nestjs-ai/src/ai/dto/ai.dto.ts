import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class SuggestionsDto {
  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];
}

export class PackingListDto {
  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  tripType?: string;
}

export class ItineraryDto {
  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  style?: string;
}
