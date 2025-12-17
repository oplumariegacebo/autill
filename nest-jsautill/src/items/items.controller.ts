import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Items } from './entities/item.entity';
import { AuthGuard } from '../auth/auth.guard';


@Controller('Items')
@UseGuards(AuthGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  async create(@Body() createItemDto: CreateItemDto) {
    const result = await this.itemsService.createItem(createItemDto);
    return result;
  }

  @Post('getList')
  async findAllFilter(@Body() options: any) {
    const result = await this.itemsService.findAllFilter(options);
    return result;
  }
  @Post('getItemsLowStock')
  async findAllitemsLowStock(@Body() options: any) {
    const result = await this.itemsService.getAllItemsLowStock(options);
    return result;
  }

  @Get('')
  async findAll(@Body() options: any) {
    const result = await this.itemsService.findAll(options);
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.itemsService.findItem(+id);
    return result;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    const result = await this.itemsService.updateItem(+id, updateItemDto);
    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.itemsService.deleteItem(+id);
    return result;
  }
}
