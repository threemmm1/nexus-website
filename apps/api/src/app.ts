import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env, corsOrigins } from './config/env';
import { apiRateLimiter } from './middleware/rate-limiter.middleware';
import { errorHandler } from './middleware/error.middleware';
import { requestId } from './middleware/request-id.middleware';
import { checkHealth } from './lib/health';
import { openApiSpec } from './lib/docs/openapi';
import { authRouter } from './routes/auth.routes';
import { usersRouter } from './routes/users.routes';
import { postsRouter } from './routes/posts.routes';
import { feedRouter } from './routes/feed.routes';
import { streamsRouter } from './routes/streams.routes';
import { walletRouter } from './routes/wallet.routes';
import { marketplaceRouter } from './routes/marketplace.routes';
import { messagingRouter } from './routes/messaging.routes';
import { gamingRouter } from './routes/gaming.routes';
import { notificationsRouter } from './routes/notifications.routes';
import { searchRouter } from './routes/search.routes';
import { adminRouter } from './routes/admin.routes';

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: corsOrigins, credentials: true }));
app.set('trust proxy', 1);

// Correlation ID — assigned before logging so every log line can be traced.
app.use(requestId);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging
if (env.NODE_ENV !== 'test') {
  morgan.token('id', (req: express.Request) => req.id);
  const format =
    env.NODE_ENV === 'production'
      ? ':id :remote-addr :method :url :status :response-time ms'
      : 'dev';
  app.use(morgan(format));
}

// Global rate limit
app.use('/api', apiRateLimiter);

// Liveness — is the process up? Always cheap, never touches dependencies.
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV, timestamp: new Date().toISOString() });
});

// Readiness — can this instance actually serve traffic? Probes dependencies.
// Returns 503 when degraded so load balancers stop routing to it.
app.get('/health/ready', async (_req, res) => {
  const report = await checkHealth();
  res.status(report.status === 'ok' ? 200 : 503).json(report);
});

// API Docs — disabled in production
if (env.NODE_ENV !== 'production') {
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, {
      customSiteTitle: 'VESIOH API Docs',
      customCss: '.swagger-ui .topbar { background-color: #0f0f0f; } .swagger-ui .topbar-wrapper img { content: none; }',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
      },
    }),
  );
  // Also expose raw JSON spec for Postman / Insomnia import
  app.get('/docs.json', (_req, res) => res.json(openApiSpec));
}

// Routes — v1
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/feed', feedRouter);
app.use('/api/v1/streams', streamsRouter);
app.use('/api/v1/wallet', walletRouter);
app.use('/api/v1/marketplace', marketplaceRouter);
app.use('/api/v1/messages', messagingRouter);
app.use('/api/v1/gaming', gamingRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/admin', adminRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Error handler (must be last)
app.use(errorHandler);

export { app };
