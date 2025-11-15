// import Sequelize from "sequelize";

// // DB configuration (merged)
// const dbConfig = {
//   development: {
//     username: process.env.DB_USER || "root",
//     password: process.env.DB_PASSWORD || null,
//     database: process.env.DB_NAME || "dev_db",
//     host: process.env.HOST || "localhost",
//     port: 3306,
//     dialect: "mysql",
//     dialectOptions: {
//       charset: "utf8mb4",
//     },
//     define: {
//       charset: "utf8mb4",
//       collate: "utf8mb4_unicode_ci",
//     },
//   },
//   production: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     host: process.env.HOST || "localhost",
//     port: 3306,
//     dialect: "mysql",
//     dialectOptions: {
//       charset: "utf8mb4",
//     },
//     define: {
//       charset: "utf8mb4",
//       collate: "utf8mb4_unicode_ci",
//     },
//   },
//   test: {
//     username: "root",
//     password: null,
//     database: "database_test",
//     host: "127.0.0.1",
//     dialect: "mysql",
//   },
// };

// // Determine environment
// const env = process.env.NODE_ENV || "development";
// console.log(`🌐 Current host: ${dbConfig[env].host}`);
// console.log(`🌐 Current username: ${dbConfig[env].username}`);
// console.log(`🌐 Current password: ${dbConfig[env].password}`);
// console.log(`🌐 Current database: ${dbConfig[env].database}`);

// const config = dbConfig[env];

// if (!config) {
//   console.error(`❌ Database configuration for "${env}" not found.`);
//   // process.exit(1);
// }

// let sequelize;

// try {
//   sequelize = new Sequelize(config);

//   // Test DB connection
//   await sequelize.authenticate();
//   console.log(`✅ Successfully connected to the database (${env})`);
// } catch (error) {
//   console.error(`❌ Database connection failed (${env}):`, error.message);
//   // process.exit(1);
// }

// export { sequelize };
// export default sequelize;
