// src/mongoose/mongoose.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongooseService implements OnModuleInit {
  private readonly logger = new Logger(MongooseService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {
    this.logger.log(`MongoDB connection state: ${this.getConnectionStatus()}`);
    this.logger.log(
      `MongoDB connection URL: ${connection.host}:${connection.port}/${connection.name}`,
    );
  }

  async onModuleInit() {
    this.connection.on('connected', () => {
      this.logger.log('MongoDB connected successfully');
    });

    this.connection.on('error', (error) => {
      this.logger.error('MongoDB connection error:', error);
    });

    this.connection.on('disconnected', () => {
      this.logger.warn('MongoDB disconnected');
    });
  }

  getConnectionStatus(): string {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[this.connection.readyState] || 'unknown';
  }

  isConnected(): boolean {
    return this.connection.readyState === 1;
  }

  async closeConnection(): Promise<void> {
    await this.connection.close();
    this.logger.log('MongoDB connection closed');
  }
}
