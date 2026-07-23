import { config } from './config';
import app from './app';

app.listen(config.port, () => {
  console.log(`Student backend v2 running on http://localhost:${config.port}`);
  console.log(`  Legacy API:  http://localhost:${config.port}/api/student`);
  console.log(`  Refactored: http://localhost:${config.port}/api/v2`);
});
