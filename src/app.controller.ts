import { Controller, Get, Post } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiProperty } from '@nestjs/swagger';

class CreateCatDto {
  @ApiProperty()
  someKey: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    return this.appService.create(createCatDto);
  }
}
