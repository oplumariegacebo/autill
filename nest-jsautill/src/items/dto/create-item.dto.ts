export class CreateItemDto {
    readonly IdBusiness: string;
    readonly Name: string;
    readonly Price: number;
    readonly Iva?: number;
    readonly Irpf?: number;
    readonly PriceImp?: number;
    readonly OrderPrice?: number;
    readonly OrderIva?: number;
    readonly OrderIrpf?: number;
    readonly OrderPriceImp?: number;
    readonly Stock: number;
    readonly Ref: string;
    readonly IdCategory: number;
    readonly IdSupplier?: number;
    readonly StockLimit?: number;
}
