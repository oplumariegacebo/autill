import { Injectable } from '@nestjs/common';
import { PurchaseReportDto } from './dto/purchaseReport.dto';
import { PurchaseReports } from './entities/purchaseReport.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, Between } from 'typeorm';
import { ItemsService } from '../items/items.service';

@Injectable()
export class PurchaseReportService {
    constructor(
        @InjectRepository(PurchaseReports) private purchaseReportRepository: Repository<PurchaseReports>,
        private itemsService: ItemsService,
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

    async findAll(options: any): Promise<any> {
        const take = options.take
        const skip = options.skip

        const filterObject = {};
        if (options.filters != null) {
            Object.entries(options.filters)
                .filter(([, value]) => value !== null && value !== "")
                .forEach(([key, value]) => (filterObject[key] = value));
        }

        filterObject['IdBusiness'] = options.userId;

        const [result, total] = await this.purchaseReportRepository.findAndCount({
            where: filterObject,
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

    async findPurchaseReport(purchaseReportId: number): Promise<PurchaseReports> {
        return await this.purchaseReportRepository.findOne({ where: { Id: purchaseReportId } });
    }

    async createPurchaseReport(newPurchaseReport: PurchaseReportDto) {
        return this.purchaseReportRepository.save(newPurchaseReport);
    }

    async orderReceived(idReport: number, reportToConfirm: { Id: number, toOrder: number }[]): Promise<{ success: boolean, message: string }> {
        const dbReport = await this.purchaseReportRepository.findOne({ where: { Id: idReport } });

        if (!dbReport) {
            return { success: false, message: 'Reporte de compra no encontrado.' };
        }

        try {
            for (const item of reportToConfirm) {
                const dbItemResponse = await this.itemsService.findItem(item.Id);
    
                if (dbItemResponse.success && dbItemResponse.data && item.toOrder > 0) {
                    const itemToUpdate = dbItemResponse.data;
                    itemToUpdate.Stock = (itemToUpdate.Stock || 0) + item.toOrder;
                    await this.itemsService.updateItem(itemToUpdate.Id, itemToUpdate);
                }
            }
            dbReport.Execute = true;
            await this.purchaseReportRepository.save(dbReport);
            return { success: true, message: 'El stock ha sido actualizado y el reporte marcado como ejecutado.' };
        } catch (error) {
            console.error(`Error processing order for report ${idReport}:`, error);
            return { success: false, message: 'Ocurrió un error al procesar la orden.' };
        }
    }

    async deletePurchaseReport(purchaseReportId: number): Promise<any> {
        const PurchaseReport = await this.purchaseReportRepository.findOne({ where: { Id: purchaseReportId } });

        if (PurchaseReport) {
            const items = JSON.parse(PurchaseReport.DescriptionItems);
            for (let item of items) {
                let dbItem = await this.itemsService.findItem(item.Id);
                if (dbItem.success && dbItem.data.Stock != null && item.Units > 0) {
                    dbItem.data.Stock += item.Units;
                    await this.itemsService.updateItem(dbItem.data.Id, dbItem.data);
                }
            }
        }

        return await this.purchaseReportRepository.delete({ Id: purchaseReportId });
    }

    async updatePurchaseReport(purchaseReportId: number, newPurchaseReport: PurchaseReportDto) {
        const oldPurchaseReport = await this.purchaseReportRepository.findOne({ where: { Id: purchaseReportId } });

        if (oldPurchaseReport) {
            const oldItems = JSON.parse(oldPurchaseReport.DescriptionItems);
            for (let item of oldItems) {
                let dbItem = await this.itemsService.findItem(item.Id);
                if (dbItem.success && dbItem.data.Stock != null && item.Units > 0) {
                    dbItem.data.Stock += item.Units;
                    await this.itemsService.updateItem(dbItem.data.Id, dbItem.data);
                }
            }
        }

        const newItems = JSON.parse(newPurchaseReport.DescriptionItems);
        for (let item of newItems) {
            let dbItem = await this.itemsService.findItem(item.Id);
            if (dbItem.success && dbItem.data.Stock != null && item.Units > 0) {
                dbItem.data.Stock -= item.Units;
                await this.itemsService.updateItem(dbItem.data.Id, dbItem.data);
            }
        }
        let toUpdate = await this.purchaseReportRepository.findOne({ where: { Id: purchaseReportId } });

        let updated = Object.assign(toUpdate, newPurchaseReport);

        return this.purchaseReportRepository.save(updated);
    }
}
