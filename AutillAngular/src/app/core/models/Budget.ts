export interface Budget {
    Id: number;
    IdBusiness: string;
    Name: string;
    ClientId: number;
    ClientName: string;
    Date: string;
    DescriptionItems: string;
    Price: number;
}

export interface BudgetResults {
    results: Budget[];
}