// test-new-connection.js
const { Client } = require('pg');

// لینک جدید با پورت 31785
const connectionString = 'postgresql://root:j0RauwtoE5qJvTIZkkRB8fsW@cho-oyu.liara.cloud:31785/postgres';

// روش‌های مختلف برای تست
const configs = [
    {
        name: "روش 1 - Connection String مستقیم (بدون SSL)",
        config: {
            connectionString: connectionString,
            connectionTimeoutMillis: 10000,
            ssl: false
        }
    },
    {
        name: "روش 2 - Connection String با SSL",
        config: {
            connectionString: connectionString,
            connectionTimeoutMillis: 10000,
            ssl: {
                rejectUnauthorized: false
            }
        }
    },
    {
        name: "روش 3 - تنظیمات جداگانه (بدون SSL)",
        config: {
            host: "cho-oyu.liara.cloud",
            port: 31785,
            user: "root",
            password: "j0RauwtoE5qJvTIZkkRB8fsW",
            database: "postgres",
            connectionTimeoutMillis: 10000,
            ssl: false
        }
    },
    {
        name: "روش 4 - تنظیمات جداگانه با SSL",
        config: {
            host: "cho-oyu.liara.cloud",
            port: 31785,
            user: "root",
            password: "j0RauwtoE5qJvTIZkkRB8fsW",
            database: "postgres",
            connectionTimeoutMillis: 10000,
            ssl: {
                rejectUnauthorized: false
            }
        }
    }
];

async function testConnection(configItem) {
    const client = new Client(configItem.config);
    
    console.log(`\n🔍 در حال تست: ${configItem.name}`);
    console.log(`📡 پورت: ${configItem.config.port || 'از connection string'}`);
    
    try {
        await client.connect();
        console.log(`✅ اتصال برقرار شد!`);
        
        // تست ساده
        const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
        console.log(`📅 زمان دیتابیس: ${result.rows[0].current_time}`);
        
        // لیست کردن جداول
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        console.log(`📋 تعداد جداول: ${tables.rows.length}`);
        if (tables.rows.length > 0) {
            console.log(`   جداول: ${tables.rows.map(t => t.table_name).join(', ')}`);
        }
        
        // تعداد یوزرها (اگر جدول user وجود داشته باشد)
        try {
            const usersCount = await client.query('SELECT COUNT(*) FROM "user"');
            console.log(`👥 تعداد یوزرهای موجود: ${usersCount.rows[0].count}`);
        } catch(e) {
            console.log(`⚠️ جدول user وجود ندارد یا خطا: ${e.message}`);
        }
        
        await client.end();
        console.log(`✅ تست ${configItem.name} با موفقیت انجام شد`);
        return true;
        
    } catch (error) {
        console.log(`❌ خطا در ${configItem.name}:`);
        console.log(`   پیام: ${error.message}`);
        console.log(`   کد: ${error.code || 'N/A'}`);
        
        if (error.code === 'ETIMEDOUT') {
            console.log(`   ⚠️ تایم‌اوت: سرور پاسخ نمی‌دهد`);
        } else if (error.code === 'ECONNREFUSED') {
            console.log(`   ⚠️ اتصال رد شد: پورت بسته است یا فایروال`);
        } else if (error.code === 'ECONNRESET') {
            console.log(`   ⚠️ اتصال قطع شد: سرور اتصال را بست`);
        } else if (error.code === '28P01') {
            console.log(`   ⚠️ رمز عبور اشتباه است`);
        } else if (error.code === '3D000') {
            console.log(`   ⚠️ دیتابیس مورد نظر وجود ندارد`);
        }
        return false;
    }
}

async function runAllTests() {
    console.log("🚀 شروع تست اتصال به دیتابیس لیارا (پورت جدید 31785)");
    console.log("=" .repeat(60));
    
    let successCount = 0;
    let successConfig = null;
    
    for (const configItem of configs) {
        const success = await testConnection(configItem);
        if (success) {
            successCount++;
            if (!successConfig) successConfig = configItem;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log("\n" + "=".repeat(60));
    console.log(`📊 نتیجه نهایی: ${successCount} از ${configs.length} تست موفقیت‌آمیز بود`);
    
    if (successCount > 0) {
        console.log(`\n🟢 اتصال برقرار است!`);
        console.log(`✅ از کانفیگ "${successConfig.name}" در پروژه اصلی استفاده کن`);
        
        if (successConfig.config.ssl) {
            console.log(`\n📝 کانفیگ نهایی برای data-source.ts:`);
            console.log(`
export const AppDataSource = new DataSource({
    type: "postgres",
    host: "${successConfig.config.host || "cho-oyu.liara.cloud"}",
    port: ${successConfig.config.port || 31785},
    username: "root",
    password: "j0RauwtoE5qJvTIZkkRB8fsW",
    database: "postgres",
    synchronize: true,
    logging: true,
    entities: [User, Code],
    ssl: {
        rejectUnauthorized: false
    }
})`);
        }
    } else {
        console.log(`\n🔴 هیچ اتصالی برقرار نشد.`);
        console.log(`\n✅ راه‌حل: با پورت 31785 و SSL وصل شو.`);
    }
}

// اجرای تست
runAllTests().catch(console.error);