import serverlessHttp from 'serverless-http';
import app from '../app.js';

// Wrap Express app for Lambda
export const handler = serverlessHttp(app);
