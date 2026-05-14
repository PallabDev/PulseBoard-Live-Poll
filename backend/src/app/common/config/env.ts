import dotenv from "dotenv";
dotenv.config({
    path: './.env',
    quiet: true,
});

const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'JWT_ACCESS_EXPIRY',
    'JWT_REFRESH_EXPIRY',
    'FRONTEND_URL',
];

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}
