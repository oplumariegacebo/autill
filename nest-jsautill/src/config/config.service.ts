import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import path from 'path';

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
    // console.log para depurar la ruta
    console.log(`[DEBUG] __dirname en ConfigService: ${__dirname}`);

    // Esta ruta asume que los archivos compilados (.js) están en una estructura similar a la de src
    // por ejemplo, si ConfigService.js está en dist/config/ y Users.entity.js está en dist/users/
    // entonces necesitamos ir "un nivel arriba" para buscar en todas las subcarpetas de dist
    const entitiesPath = path.join(__dirname, '..', '**', '*.entity{.js,.ts}'); // OJO: .ts también para desarrollo local
    
    console.log(`[DEBUG] Ruta de entidades calculada: ${entitiesPath}`);

    return {
      type: 'mysql',

      host: this.getValue('APP_HOST'),
      port: parseInt(this.getValue('APP_PORT')),
      username: this.getValue('APP_USER'),
      password: this.getValue('APP_PASSWORD'),
      database: this.getValue('APP_DATABASE'),

      entities: [entitiesPath],
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