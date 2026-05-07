import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres", // یوزر تو
    password: "123456", // پسورد تو
    database: "zanova_db", // اسم دیتابیسی که ساختی
    synchronize: true, // فقط برای توسعه! تو پروداکشن false کن
    logging: true,
    entities: ["src/entities/**/*.ts"], // مسیر مدل‌ها
    migrations: ["src/migrations/**/*.ts"],
})