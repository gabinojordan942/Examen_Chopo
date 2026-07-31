import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

if (!process.env['NODE_ENV'] || process.env['NODE_ENV'] === 'development') {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
}

const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(AppComponent, config, context);

export default bootstrap;
