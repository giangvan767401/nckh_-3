const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { PredictionsService } = require('./dist/predictions/predictions.service');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const predictionsService = app.get(PredictionsService);
  
  try {
    const results = await predictionsService.runBatchInference('6588699e-87e6-497c-b684-b55fc0c90911', 'instructor-id');
    console.log(JSON.stringify(results, null, 2));
  } catch(e) {
    console.error("Test Error", e);
  }
  await app.close();
}
bootstrap();
