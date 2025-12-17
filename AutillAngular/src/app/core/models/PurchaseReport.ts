export interface PurchaseReport {
    Id?: number;
    IdBusiness: number;
    IdSupplier: number;
    DescriptionItems: string;
    Execute: boolean;
    TotalPrice: number | string;
    TotalPriceImp: number | string;
}