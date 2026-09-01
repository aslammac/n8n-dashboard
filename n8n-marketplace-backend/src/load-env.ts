// Side-effect import: must be the FIRST import in main.ts.
// Parses the env file into process.env before any @Module is evaluated, so
// import-time flags like REDIS_ENABLED (read in workflows.module.ts) see it.
// @nestjs/config's ConfigModule.forRoot still runs later and is the source of
// truth for injected config; it will not overwrite values already set here.
import { config } from 'dotenv';

config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});
