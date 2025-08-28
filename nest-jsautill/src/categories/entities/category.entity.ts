import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Categories {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column('text')
    IdBusiness: string;

    @Column()
    Name: string;
}
