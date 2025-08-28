import { Injectable } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Suppliers } from './entities/supplier.entity';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SuppliersService {

  constructor(
    @InjectRepository(Suppliers) private suppliersRepository: Repository<Suppliers>,
  ) { }

  getPage(initialElement) {
    let PAGINATION = [
      { page: 1, initialElement: 0, finalElement: 10, },
      { page: 2, initialElement: 10, finalElement: 20 },
      { page: 3, initialElement: 20, finalElement: 30 },
      { page: 4, initialElement: 30, finalElement: 40 },
      { page: 5, initialElement: 40, finalElement: 50 },
      { page: 6, initialElement: 50, finalElement: 60 },
      { page: 7, initialElement: 60, finalElement: 70 },
      { page: 8, initialElement: 70, finalElement: 80 },
      { page: 9, initialElement: 80, finalElement: 90 },
      { page: 10, initialElement: 90, finalElement: 100 },
      { page: 11, initialElement: 100, finalElement: 110 },
      { page: 12, initialElement: 110, finalElement: 120 },
      { page: 13, initialElement: 120, finalElement: 130 },
      { page: 14, initialElement: 130, finalElement: 140 },
      { page: 15, initialElement: 140, finalElement: 150 }
    ];

    return PAGINATION[PAGINATION.map(e => e.initialElement).indexOf(initialElement)];
  }

  createSupplier(newSupplier: CreateSupplierDto) {
    return this.suppliersRepository.save(newSupplier);
  }

  async findAllFilter(options: any): Promise<any> {
    const take = options.take
    const skip = options.skip

    const filterObject = {};
    if (options.filters != null) {
      Object.entries(options.filters)
        .filter(([key, value]) => value !== null && value !== "" && key !== 'PriceMin' && key !== 'PriceMax')
        .forEach(([key, value]) => (filterObject[key] = value));
    }

    filterObject['IdBusiness'] = options.userId;

    if (filterObject['Name']) {
      filterObject['Name'] = ILike('%' + filterObject['Name'] + '%');
    }

    const [result, total] = await this.suppliersRepository.findAndCount({
      where: filterObject,
      order: { Name: "ASC" },
      take,
      skip
    })

    let nfd = 1;
    if (result.length === 0 && options.filters != null) {
      nfd = 0;
    }

    return {
      data: result,
      count: total,
      noFilterData: nfd,
      page: this.getPage(options.skip)
    }
  }

  async findAll(options: any): Promise<any> {
    return await this.suppliersRepository.findAndCount({
      where: { IdBusiness: options.userId }
    });
  }

  async findSupplier(supplierId: number): Promise<any> {
    const supplier = await this.suppliersRepository.findOne({ where: { Id: supplierId } });
    if (!supplier) {
      return { success: false, message: 'Proveedor no encontrado', data: null };
    }
    return { success: true, message: 'Proveedor encontrado', data: supplier };
  }

  async deleteSupplier(supplierId: number): Promise<any> {
    const supplier = await this.suppliersRepository.findOne({ where: { Id: supplierId } });
    if (!supplier) {
      return { success: false, message: 'Proveedor no encontrado' };
    }
    await this.suppliersRepository.delete({ Id: supplierId });
    return { success: true, message: 'Proveedor eliminado correctamente' };
  }

  async updateSupplier(supplierId: number, newSupplier: UpdateSupplierDto): Promise<any> {
    let toUpdate = await this.suppliersRepository.findOne({ where: { Id: supplierId } });
    if (!toUpdate) {
      return { success: false, message: 'Proveedor no encontrado', data: null };
    }
    let updated = Object.assign(toUpdate, newSupplier);
    try {
      const saved = await this.suppliersRepository.save(updated);
      return { success: true, message: 'Proveedor actualizado correctamente', data: saved };
    } catch {
      return { success: false, message: 'Error al actualizar el proveedor', data: null };
    }
  }
}
