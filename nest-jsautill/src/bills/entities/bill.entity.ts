import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Bills {
  @PrimaryGeneratedColumn() 
  Id: number;

  @Column('text')
  IdBusiness: string;

  @Column()
  Name: string;

  @Column() 
  ClientId: number;

  @Column()
  ClientName: string;

  @Column()
  Date: string;

  @Column('text')
  DescriptionItems: string;

  @Column()
  Price: number;

  @Column()
  IdBudget: number;

  @Column()
  Cashed: boolean;
}