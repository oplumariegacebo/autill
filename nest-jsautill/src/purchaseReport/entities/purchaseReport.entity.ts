import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PurchaseReports {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  IdBusiness: number;

  @Column()
  IdSupplier: number;

  @Column('text')
  DescriptionItems: string;

  @Column()
  Execute: boolean;

  @Column()
  TotalPrice: number;
}