import "reflect-metadata" 
import { DataSource } from "typeorm"
import { User } from "./entities/User"
import { Code } from "./entities/Code" 

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "cho-oyu.liara.cloud",
    port: 34458,
    username: "root",
    password: "j0RauwtoE5qJvTIZkkRB8fsW",
    database: "postgres",  // ✅ تغییر از "zanova-db" به "postgres"
    synchronize: true,
    logging: true,
    entities: [User, Code],
    // ssl: true,
    // extra: {
    //     ssl: {
    //         rejectUnauthorized: false
    //     }
    // }
})