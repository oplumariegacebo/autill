import { TypeOrmModuleOptions } from '@nestjs/typeorm'; 

require('dotenv').config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

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
    return {
      type: 'mysql', 

      host: this.getValue('APP_HOST'), 
      port: parseInt(this.getValue('APP_PORT')),
      username: this.getValue('APP_USER'),
      password: this.getValue('APP_PASSWORD'),
      database: this.getValue('APP_DATABASE'),

      entities: ['dist/**/*.entity.js'], 
      synchronize: true, 
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