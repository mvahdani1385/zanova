import "reflect-metadata"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 100 })
    firstName: string

    @Column({ length: 100 })
    lastName: string

    @Column({ unique: true, length: 11 })
    phone: string

    @Column({ nullable: true })
    job: string

    @Column({ nullable: true })
    address: string

    @Column()
    password: string

    @Column({ nullable: true, type: "text" })
    description: string

    @Column({ 
        type: "enum", 
        enum: ["owner", "admin", "seller"],
        default: "seller"
    })
    role: string  // "owner", "admin", "seller"

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}