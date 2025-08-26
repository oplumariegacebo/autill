import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from '../auth/auth.guard';


@Controller('Categories')
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const result = await this.categoriesService.createCategory(createCategoryDto);
    return result;
  }

  @Post('getList')
  async findAllFilter(@Body() options: any) {
    const result = await this.categoriesService.findAllFilter(options);
    return result;
  }

  @Get('')
  async findAll(@Body() options: any) {
    const result = await this.categoriesService.findAll(options);
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.categoriesService.findCategory(+id);
    return result;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    const result = await this.categoriesService.updateCategory(+id, updateCategoryDto);
    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.categoriesService.deleteCategory(+id);
    return result; 
  }
}
