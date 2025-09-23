export class PurchaseReportDto {
    readonly Id: number;
    readonly IdSupplier: number;
    readonly IdBusiness: number;
    readonly DescriptionItems: string;
    readonly Execute: boolean;
    readonly TotalPrice: number;
    readonly TotalPriceImp: number;
  }