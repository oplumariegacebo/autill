import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import path from 'path';
import * as fs from 'fs';

require('dotenv').config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) { }

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach(k => this.getValue(k, true));
    return this;
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    const entitiesPath = path.join(__dirname, '..', '**', '*.entity{.js,.ts}');

    // LOGS DE DIAGNÓSTICO
    console.log('DB_USER:', this.getValue('APP_USER'));
    const pwd = this.getValue('APP_PASSWORD');
    console.log('DB_PASSWORD:', pwd ? '***' : '(vacío)');
    console.log('DB_HOST:', this.getValue('APP_HOST'));
    console.log('DB_PORT:', this.getValue('APP_PORT'));
    console.log('DB_DATABASE:', this.getValue('APP_DATABASE'));
    // FIN LOGS

    return {
      type: 'mysql',
      host: this.getValue('APP_HOST'),
      port: parseInt(this.getValue('APP_PORT')),
      username: this.getValue('APP_USER'),
      password: this.getValue('APP_PASSWORD'),
      database: this.getValue('APP_DATABASE'),

      extra: {
        authPlugins: {
          mysql_native_password: () => () => Buffer.from(''),
          caching_sha2_password: () => () => Buffer.from(''),
        },
      },
      ssl: {
        ca: process.env.DB_SSL_CA ? Buffer.from(process.env.DB_SSL_CA, 'utf-8') : undefined,
        rejectUnauthorized: true,
      },

      autoLoadEntities: true,
      entities: [entitiesPath],
      synchronize: false,
    };

  }
}

const configService = new ConfigService(process.env).ensureValues([
  'APP_HOST',
  'APP_PORT',
  'APP_USER',
  'APP_PASSWORD',
  'APP_DATABASE',
]);

export { configService };