import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Clients {
  @PrimaryGeneratedColumn() 
  Id: number;

  @Column()
  IdBusiness: number;

  @Column()
  Name: string;

  @Column() 
  Nif: string;

  @Column('text')
  Address: string;

  @Column()
  City: string;

  @Column()
  Region: string;

  @Column()
  Country: string;

  @Column()
  PostalCode: number;

  @Column()
  PhoneNumber: number;

  @Column()
  Email: string;
}