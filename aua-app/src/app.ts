import * as express from 'express';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as listEndpoints from 'express-list-endpoints';
import * as cors from 'cors';
import * as path from 'path';
import * as fileUpload from 'express-fileupload';
import * as YAML from 'yamljs';
import { connector } from 'swagger-routes-express';
import * as api from './api';
import { securityAdminAuthMiddleware, securityBusinessAuthMiddleware, securityIndividualAuthMiddleware } from './middlewares/securityAdminAuthMiddleware';
import { authMiddleware } from './middlewares/authMiddleware';
import * as cookieParser from 'cookie-parser';
import { logError } from './utils/logger';

function errorHandler(err, req, res, next) {
  if (err && !/^4/.test(res.status)) {
    logError(err, req, res);
  }
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  res.json(err);
}

function connectSwaggerRoutes(app, ymlFile) {
  const apiDefinition = YAML.load(ymlFile);
  const connect = connector(api, apiDefinition, {
    security: {
      admin: securityAdminAuthMiddleware,
      business: securityBusinessAuthMiddleware,
      individual: securityIndividualAuthMiddleware
    }
  });
  connect(app);

  return app;
}

const staticWwwDir = path.resolve(__dirname, '..', 'www');

// create and setup express app
export function createAppInstance() {
  const app = express();
  app.use(cors());
  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '4mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  app.use(fileUpload({
    createParentPath: true
  }));

  // // Redirect HTTP to HTTPS
  // app.all('*', (req, res, next) => {
  //   if (req.secure) {
  //     return next();
  //   }
  //   res.redirect(`https://${req.hostname}${httpsPort === 443 ? '' : `:${httpsPort}`}${req.url}`);
  // });
  // connectPassport(app);

  app.use(authMiddleware);

  app.use(compression({ filter: (req, res) => !req.headers['x-no-compression'] && compression.filter(req, res) }));
  // Connect to /api/v*/ with the swagger file
  connectSwaggerRoutes(app, `${__dirname}/_assets/api.yml`);


  app.get('/healthcheck', (req, res) => res.send('OK'));

  app.get('/reset_password/:token', (req, res) => res.redirect(`/api/v1/auth/reset_password/${req.params.token}`));
  // app.get('/env', (req, res) => res.json(process.env));
  // app.get('/routelist', (req, res) => res.json(listEndpoints(app)));
  app.use('/', express.static(staticWwwDir));

  app.use(errorHandler);

  // Debounce to frontend routing
  app.get('*', (req, res) => res.sendFile(`${staticWwwDir}/index.html`));

  console.log(listEndpoints(app));

  return app;
}

