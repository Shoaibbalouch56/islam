import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot() {
    const appName = process.env.APP_NAME ?? 'Door-to-Door Islam';
    return {
      message: `Welcome to ${appName}`,
      tagline:
        process.env.APP_TAGLINE ??
        'Illuminate your path with guidance, wisdom & daily reflections',
      apiDocs: '/api',
      roles: ['USER', 'STUDENT', 'TEACHER'],
    };
  }
}
