import "reflect-metadata"
import { AppDataSource } from "../src/data-source"  // همین مسیر درسته
import { User } from "../src/entities/User"
import * as bcrypt from "bcrypt"

async function createOwner() {
    try {
        console.log("🔄 در حال اتصال به دیتابیس...")
        await AppDataSource.initialize()
        console.log("✅ متصل شد!")

        const userRepo = AppDataSource.getRepository(User)

        // چک کن مالک وجود داره یا نه
        const existingOwner = await userRepo.findOneBy({ role: "owner" })
        
        if (existingOwner) {
            console.log("⚠️ کاربر مالک قبلاً ایجاد شده است:")
            console.log(`   نام: ${existingOwner.firstName} ${existingOwner.lastName}`)
            console.log(`   شماره: ${existingOwner.phone}`)
            await AppDataSource.destroy()
            return
        }

        // هش کردن رمز عبور
        const hashedPassword = await bcrypt.hash("123456", 10)

        // ایجاد کاربر مالک
        const owner = userRepo.create({
            firstName: "محمد",
            lastName: "وحدانی",
            phone: "09932169402",
            password: hashedPassword,
            role: "owner",
            job: "",
            address: "",
            description: ""
        })

        await userRepo.save(owner)

        console.log("✅ کاربر مالک با موفقیت ایجاد شد:")
        console.log(`   نام: ${owner.firstName} ${owner.lastName}`)
        console.log(`   شماره: ${owner.phone}`)
        console.log(`   رمز: 123456`)
        console.log(`   نقش: ${owner.role}`)

        await AppDataSource.destroy()

    } catch (error) {
        console.error("❌ خطا:", error)
    }
}

createOwner()