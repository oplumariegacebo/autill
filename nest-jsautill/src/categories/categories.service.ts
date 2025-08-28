import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Categories } from './entities/category.entity';
import { ILike, Repository, Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Categories) private categoriesRepository: Repository<Categories>,
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
    const take = options.take
    const skip = options.skip

    const filterObject = {};
    if (options.filters != null) {
      Object.entries(options.filters)
        .filter(([key, value]) => value !== null && value !== "" && key !== 'PriceMin' && key !== 'PriceMax')
        .forEach(([key, value]) => (filterObject[key] = value));
    }

    filterObject['IdBusiness'] = options.userId;

    if (options.filters?.PriceMin != null && options.filters?.PriceMax != null) {
      filterObject['Price'] = Between(options.filters.PriceMin, options.filters.PriceMax);
    } else if (options.filters?.PriceMin != null) {
      filterObject['Price'] = Between(options.filters.PriceMin, Number.MAX_SAFE_INTEGER);
    } else if (options.filters?.PriceMax != null) {
      filterObject['Price'] = Between(0, options.filters.PriceMax);
    }

    if (filterObject['Name']) {
      filterObject['Name'] = ILike('%' + filterObject['Name'] + '%');
    }

    const [result, total] = await this.categoriesRepository.findAndCount({
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

  async findCategory(categoryId: number): Promise<any> {
    const category = await this.categoriesRepository.findOne({ where: { Id: categoryId } });
    if (!category) {
      return { success: false, message: 'Categoría no encontrada', data: null };
    }
    return { success: true, message: 'Categoría encontrada', data: category };
  }

  createCategory(newCategory: CreateCategoryDto): Promise<any> {
    return this.categoriesRepository.save(newCategory)
      .then(saved => ({ success: true, message: 'Categoría creada correctamente', data: saved }))
      .catch(() => ({ success: false, message: 'Error al crear la categoría', data: null }));
  }

  async findAll(options: any): Promise<any> {
    try {
      const [data, count] = await this.categoriesRepository.findAndCount({
        where: { IdBusiness: options.userId }
      });
      return { success: true, data, count };
    } catch {
      return { success: false, message: 'Error al obtener categorías', data: [], count: 0 };
    }
  }

  async updateCategory(categoryId: number, newCategory: UpdateCategoryDto): Promise<any> {
    let toUpdate = await this.categoriesRepository.findOne({ where: { Id: categoryId } });

    if (!toUpdate) {
      return { success: false, message: 'Categoría no encontrada', data: null };
    }
    let updated = Object.assign(toUpdate, newCategory);
    try {
      const saved = await this.categoriesRepository.save(updated);
      return { success: true, message: 'Categoría actualizada correctamente', data: saved };
    } catch {
      return { success: false, message: 'Error al actualizar la categoría', data: null };
    }
  }

  async deleteCategory(categoryId: number): Promise<any> {
    const category = await this.categoriesRepository.findOne({ where: { Id: categoryId } });
    if (!category) {
      return { success: false, message: 'Categoría no encontrada' };
    }
    await this.categoriesRepository.delete({ Id: categoryId });
    return { success: true, message: 'Categoría eliminada correctamente' };
  }
}
