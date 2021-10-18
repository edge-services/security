import {ApplicationConfig, SecurityApplication} from './application';
import * as dotenv from "dotenv";

export * from './application';

export async function main(options: ApplicationConfig = {}) {


  dotenv.config();
  let env_path = process.env.NODE_ENV;
  if(env_path){
    dotenv.config({ path: env_path });
  } 

  const PORT = process.env.PORT || 3000;
  console.log('PORT: >> ', process.env.PORT);
  if(!options || !options['rest']){
    options = {
      rest: {
        port: PORT,
        openApiSpec: { setServersFromRequest: true }       
      },
    }
  }

  options.rest.port = PORT;  
  options.rest.openApiSpec = { setServersFromRequest: true };
  options.rest.requestBodyParser = {json: {limit: '2mb'}};
  options.rest.cors = {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      maxAge: 86400,
      credentials: true     
  }


  const app = new SecurityApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  main().catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
