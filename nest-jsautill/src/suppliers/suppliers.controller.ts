import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, UseGuards } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Suppliers } from './entities/supplier.entity';
import { AuthGuard } from '../auth/auth.guard';

@Controller('Suppliers')
@UseGuards(AuthGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.createSupplier(createSupplierDto);
  }

  @Post('getList')
  findAllFilter(@Body() options: any): Promise<Suppliers[]> {
    return this.suppliersService.findAllFilter(options);
  }

  @Get('')
  findAll(@Body() options: any): Promise<Suppliers[]> {
    return this.suppliersService.findAll(options);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.suppliersService.findSupplier(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.suppliersService.updateSupplier(id, updateSupplierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.suppliersService.deleteSupplier(id);
  }
}
