// import { SystemInfo } from './../models/system-info.model';
import {bind, inject, BindingScope} from '@loopback/core';
import { ServiceBindings } from '../keys';
import { DetectionServiceI, RadioServiceI, CommonServiceI, SecurityServiceI } from './types';
import { SystemInfo } from '../models';

@bind({scope: BindingScope.TRANSIENT})
export class SecurityService implements SecurityServiceI {
  constructor(
    @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI,
    @inject(ServiceBindings.RADIO_SERVICE) private radioService: RadioServiceI,
    @inject(ServiceBindings.DETECTION_SERVICE) private detectionService: DetectionServiceI
  ) {}

  
  async initSecurity(): Promise<void>{
    console.log(' IN SecurityService.initSecurity: >>>>>> ');
    const systemInfo = await this.getSystemInformation({});
    console.log('systemInfo: >> ', systemInfo);
    if(systemInfo && systemInfo.other && systemInfo.other.internetAvailable){
      await this.syncWithCloud();
    }

    const deviceId = await this.commonService.getSerialNumber();
    await this.commonService.setItemInCache('deviceId', deviceId);

    if(process.env.USE_RADIO){
      await this.radioService.initRadio();
    }    
    // await this.ruleService.addRules(await this.commonService.getRules());
    await this.detectionService.startDetection();
  }
  
  async syncWithCloud(): Promise<void> {
    // throw new Error("Method not implemented.");
    console.log('FETCH SECURITY SERVICE CONFIGURATIONS: >>> ');
    // console.log('FETCH RULES FOR EVENTS TRIGGERING: >>> ');
  }

  async getSystemInformation(valueObject: any): Promise<SystemInfo>{   
    let systemInfo = await this.commonService.getSystemInformation(valueObject);
    if(!systemInfo.other){
      systemInfo.other = {};
    }
    if(process.env.USE_RADIO){
      systemInfo.other.radioAvailable = this.radioService.isAvailable();
    }else{
      systemInfo.other.radioAvailable = false;
    }
    
    delete systemInfo.internet;
    return systemInfo;
  }


}
