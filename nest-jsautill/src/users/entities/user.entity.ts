import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  Nif: string;

  @Column()
  FullName: string;

  @Column('text')
  Address: string;

  @Column()
  PhoneNumber: number;

  @Column()
  Region: string;

  @Column()
  Country: string;

  @Column()
  PostalCode: number;

  @Column('text')
  Logo: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  Email: string;

  @Column({ type: 'varchar', nullable: false })
  Password: string;

  @Column()
  DataComplete: boolean;
}