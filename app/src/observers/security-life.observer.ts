import { SimulatorUtilityI } from '../utils/types';
import {
  inject, Application, CoreBindings,
  lifeCycleObserver, // The decorator
  LifeCycleObserver
} from '@loopback/core';
import { Cleanup } from '../utils/cleanup';
import { ServiceBindings, UtilityBindings } from '../keys';
import { SecurityServiceI } from '../services/types';
// import { juggler } from '@loopback/repository';

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('')
export class SecurityLifeObserver implements LifeCycleObserver {
  constructor(
    // inject `app` if you need access to other artifacts by `await this.app.get()`
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
    @inject(ServiceBindings.SECURITY_SERVICE) private securityService: SecurityServiceI,
    @inject(UtilityBindings.SIMULATOR_UTILITY) private simulatoreUtility: SimulatorUtilityI,
  ) {}

  async boot(): Promise<void> {
    console.log('\n\n<<<<<<<<< Security Service Booted >>>>>>>>>>>\n\n');    
  }

  /**
   * This method will be invoked when the application starts
   */
  async start(): Promise<void> {
    console.log('\n\n<<<<<<<<< Security Service Started >>>>>>>>>>>\n\n');
    let cleanup = new Cleanup();
    cleanup.init(this.cleanupOnExit);
    await this.securityService.initSecurity();
    // if(process.env.SIMULATE && process.env.SIMULATE.toLowerCase() === 'true'){
    //   await this.simulatoreUtility.simulate({});
    // }    
  }

  /**
   * This method will be invoked when the application stops
   */
  async stop(): Promise<void> {
    console.log('\n\n<<<<<<<<<<<< Security Service Stopped >>>>>>>>>>>>> \n\n');
  }

  cleanupOnExit(){
		console.log('\n\n<<<<<<<<< CALLING CLEANUP PROCESS ON EXIT >>>>>>>>> \n\n');
//		sensortagHandler.disconnectSensorTags();
		// FACTORY.GatewayHandler().destroyGPIOs(function(err, result){
		// 	console.log("<<<<<<< Security Stopped, Good Bye >>>>>>>>\n");
		// });
  }


}
