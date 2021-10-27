import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, BindingScope} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';

import * as dotenv from "dotenv";
import { ServiceBindings, UtilityBindings } from './keys';
import { DetectionService, CommonService, RadioService, SecurityService, WebcamService, PicamService, DataFlowService } from './services';
import { SimulatorUtility } from './utils/simulator';


export {ApplicationConfig};

export class SecurityApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    dotenv.config();
    let env_path = process.env.NODE_ENV;
    if(env_path){
      dotenv.config({ path: env_path });
    } 

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.bind(UtilityBindings.SIMULATOR_UTILITY).toClass(SimulatorUtility);
    this.bind(ServiceBindings.COMMON_SERVICE).toClass(CommonService).inScope(BindingScope.SINGLETON);;
    this.bind(ServiceBindings.DATAFLOW_SERVICE).toClass(DataFlowService).inScope(BindingScope.APPLICATION);
    this.bind(ServiceBindings.RADIO_SERVICE).toClass(RadioService);
    this.bind(ServiceBindings.DETECTION_SERVICE).toClass(DetectionService);
    this.bind(ServiceBindings.SECURITY_SERVICE).toClass(SecurityService);

    // this.service(RuleService, {interface: RuleServiceI})

    if(process.env.USE_WEBCAM){
      this.bind(ServiceBindings.CAMERA_SERVICE).toClass(WebcamService);
    }else{
      this.bind(ServiceBindings.CAMERA_SERVICE).toClass(PicamService);
    }

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
