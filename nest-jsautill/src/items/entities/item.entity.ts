import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Items {
    @PrimaryGeneratedColumn() 
    Id: number;
  
    @Column('text')
    IdBusiness: string;
  
    @Column()
    Name: string;

    @Column('decimal', { precision: 6, scale: 2 })
    Price: number;
}
