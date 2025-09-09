import { Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Items } from './entities/item.entity';
import { ILike, Repository, Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Items) private itemsRepository: Repository<Items>,
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

  async findAllFilter(options: any): Promise<any> {
    const { take, skip, userId, filters } = options;

    const qb = this.itemsRepository.createQueryBuilder("item");

    qb.where("item.IdBusiness = :userId", { userId });

    if (filters) {
      if (filters.PriceMin != null && filters.PriceMin !== '' && filters.PriceMax != null && filters.PriceMax !== '') {
        qb.andWhere("item.Price BETWEEN :priceMin AND :priceMax", { priceMin: filters.PriceMin, priceMax: filters.PriceMax });
      } else if (filters.PriceMin != null && filters.PriceMin !== '') {
        qb.andWhere("item.Price >= :priceMin", { priceMin: filters.PriceMin });
      } else if (filters.PriceMax != null && filters.PriceMax !== '') {
        qb.andWhere("item.Price <= :priceMax", { priceMax: filters.PriceMax });
      }

      if (filters.Name) {
        qb.andWhere("item.Name ILIKE :name", { name: `%${filters.Name}%` });
      }

      if (filters.StockLimit === true) {
        qb.andWhere("item.Stock < (item.StockLimit * 1.25) AND item.StockLimit > 0");
      }

      if (filters.IdCategory > 0) {
        qb.andWhere("item.IdCategory = :idCategory", { idCategory: filters.IdCategory });
      }

      const speciallyHandledFilters = ['PriceMin', 'PriceMax', 'Name', 'StockLimit', 'IdCategory'];
      Object.entries(filters)
        .filter(([key, value]) =>
          value !== null &&
          value !== "" &&
          !speciallyHandledFilters.includes(key)
        )
        .forEach(([key, value]) => {
          qb.andWhere(`item.${key} = :${key}`, { [key]: value });
        });
    }

    const [result, total] = await qb
      .orderBy("item.Name", "ASC")
      .skip(skip)
      .take(take)
      .getManyAndCount();

    const nfd = (result.length === 0 && options.filters != null) ? 0 : 1;
    return {
      data: result,
      count: total,
      noFilterData: nfd,
      page: this.getPage(options.skip),
    };
  }

  async findItem(itemId: number): Promise<any> {
    const item = await this.itemsRepository.findOne({ where: { Id: itemId } });
    if (!item) {
      return { success: false, message: 'Item no encontrado', data: null };
    }
    return { success: true, message: 'Item encontrado', data: item };
  }

  createItem(newItem: CreateItemDto): Promise<any> {
    console.log(newItem);
    return this.itemsRepository.save(newItem)
      .then(saved => ({ success: true, message: 'Item creado correctamente', data: saved }))
      .catch(() => ({ success: false, message: 'Error al crear el item', data: null }));
  }

  async findAll(options: any): Promise<any> {
    try {
      const [data, count] = await this.itemsRepository.findAndCount({
        where: { IdBusiness: options.userId }
      });
      return { success: true, data, count };
    } catch {
      return { success: false, message: 'Error al obtener items', data: [], count: 0 };
    }
  }

  async updateItem(itemId: number, newItem: UpdateItemDto): Promise<any> {
    let toUpdate = await this.itemsRepository.findOne({ where: { Id: itemId } });

    if (!toUpdate) {
      return { success: false, message: 'Item no encontrado', data: null };
    }
    let updated = Object.assign(toUpdate, newItem);
    try {
      const saved = await this.itemsRepository.save(updated);
      return { success: true, message: 'Item actualizado correctamente', data: saved };
    } catch {
      return { success: false, message: 'Error al actualizar el item', data: null };
    }
  }

  async deleteItem(itemId: number): Promise<any> {
    const item = await this.itemsRepository.findOne({ where: { Id: itemId } });
    if (!item) {
      return { success: false, message: 'Item no encontrado' };
    }
    await this.itemsRepository.delete({ Id: itemId });
    return { success: true, message: 'Item eliminado correctamente' };
  }
}
