import { config } from './config';
import app from './app';

app.listen(config.port, () => {
  console.log(`Staff backend v2 running on http://localhost:${config.port}`);
  console.log(`  Legacy API:  http://localhost:${config.port}/api/staff`);
  console.log(`  Refactored:  http://localhost:${config.port}/api/v2`);
});
