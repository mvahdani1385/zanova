import "reflect-metadata"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class Code {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    code: string

    @Column()
    length: number

    @Column()
    type: string

    @Column({ default: false })
    isUsed: boolean

    @Column({ nullable: true })
    usedBy: string  // شماره تماس کاربری که کد رو استفاده کرده

    @CreateDateColumn()
    createdAt: Date

    @Column({ nullable: true })
    batchId: string

    @Column({ nullable: true, type: "text" })
    qrCode: string

    // فیلدهای ثبت اطلاعات کاربر (مالک کد)
    @Column({ nullable: true })
    userFirstName: string

    @Column({ nullable: true })
    userLastName: string

    @Column({ nullable: true })
    userPhone: string

    @Column({ nullable: true, type: "text" })
    userDescription: string

    // فیلدهای جدید برای تایید فروشنده
    @Column({ nullable: true })
    confirmedBySellerId: number  // آیدی فروشنده‌ای که تایید کرده

    @Column({ nullable: true })
    confirmedBySellerName: string  // نام فروشنده‌ای که تایید کرده

    @Column({ nullable: true })
    confirmedAt: Date  // تاریخ تایید

    @UpdateDateColumn()
    updatedAt: Date
}