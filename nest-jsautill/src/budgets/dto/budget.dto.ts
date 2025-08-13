export class BudgetDto {
    readonly IdBusiness: string;
    readonly Name: string;
    readonly ClientId: number;
    readonly ClientName: string;
    readonly Date: string;
    readonly DescriptionItems: string;
    readonly Price: number;
    readonly PriceImp?: number;
    readonly CloseIt: boolean;
    readonly Iva?: number;
    readonly Irpf?: number;
  }