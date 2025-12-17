export interface Item {
    Id: number;
    Name: string;
    Price: number;
    PriceImp: number;
    Stock: number;
    Ref: string;
    displayName?: string;
    StockLimit: number;
    IdCategory: number;
    IdSupplier: number;
    [key: string]: any;
    OrderPrice: string;
    OrderPriceImp: string;
    toOrder: number;
}
