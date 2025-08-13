export class BudgetDto {
    readonly IdBusiness: string;
    readonly Name: string;
    readonly ClientId: number;
    readonly ClientName: string;
    readonly Date: string;
    readonly DescriptionItems: string;
    readonly Price: string;
    readonly PriceImp?: string;
    readonly CloseIt: boolean;
    readonly Iva?: number;
    readonly Irpf?: number;
  }