export class CreateItemDto {
    readonly Id: number;
    readonly IdBusiness: string;
    readonly Name: string;
    readonly Price: number;
    readonly Iva: number;
    readonly Irpf: number;
    readonly PriceImp: number;
    readonly Stock: number;
    readonly Ref: string;
    readonly IdCategory: number;
}
