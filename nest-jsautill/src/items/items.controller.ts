import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Items } from './entities/item.entity';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('Items')
@UseGuards(AuthGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.createItem(createItemDto);
  }

  @Post('getList')
  findAllFilter(@Body() options: any): Promise<Items[]> {
    return this.itemsService.findAllFilter(options);
  }

  @Get('')
  findAll(@Body() options: any): Promise<Items[]> {
    return this.itemsService.findAll(options);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemsService.findItem(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemsService.updateItem(+id, updateItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemsService.deleteItem(+id);
  }
}
