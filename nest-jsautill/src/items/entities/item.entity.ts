import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Items {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column('text')
    IdBusiness: string;

    @Column()
    Name: string;

    @Column('decimal', { precision: 10, scale: 2 })
    Price: number;

    @Column('decimal', { precision: 10, scale: 2 })
    PriceImp: number;

    @Column('decimal', { precision: 10, scale: 2 })
    Iva: number;

    @Column('decimal', { precision: 10, scale: 2 })
    Irpf: number;

    @Column('decimal', { precision: 10, scale: 2 })
    OrderPrice: number;

    @Column('decimal', { precision: 10, scale: 2 })
    OrderPriceImp: number;

    @Column('decimal', { precision: 10, scale: 2 })
    OrderIva: number;

    @Column('decimal', { precision: 10, scale: 2 })
    OrderIrpf: number;

    @Column()
    Stock: number;

    @Column()
    Ref: string;

    @Column()
    IdCategory: number;

    @Column()
    IdSupplier: number;

    @Column()
    StockLimit: number;
}
