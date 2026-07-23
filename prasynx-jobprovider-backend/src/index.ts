import { config } from './config';
import app from './app';

app.listen(config.port, () => {
  console.log(`Job Provider backend running on http://localhost:${config.port}`);
  console.log(`  API: http://localhost:${config.port}/api/job-provider`);
});
