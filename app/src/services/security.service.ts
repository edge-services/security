// import { SystemInfo } from './../models/system-info.model';
import {bind, inject, BindingScope} from '@loopback/core';
import { ServiceBindings } from '../keys';
import { DetectionServiceI, RadioServiceI, CommonServiceI, SecurityServiceI, RuleServiceI } from './types';
import { SystemInfo } from '../models';

@bind({scope: BindingScope.TRANSIENT})
export class SecurityService implements SecurityServiceI {
  constructor(
    @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI,
    @inject(ServiceBindings.RADIO_SERVICE) private radioService: RadioServiceI,
    @inject(ServiceBindings.DETECTION_SERVICE) private detectionService: DetectionServiceI,
    @inject(ServiceBindings.RULE_SERVICE) private ruleService: RuleServiceI,
  ) {}

  
  async initSecurity(): Promise<void>{
    console.log(' IN SecurityService.initSecurity: >>>>>> ');
    const systemInfo = await this.getSystemInformation({});
    console.log('systemInfo: >> ', systemInfo);
    if(systemInfo && systemInfo.other && systemInfo.other.internetAvailable){
      await this.syncWithCloud();
    }
    await this.radioService.initRadio();
    await this.ruleService.addRules(await this.commonService.getRules());
    await this.detectionService.startDetection();
  }
  
  async syncWithCloud(): Promise<void> {
    // throw new Error("Method not implemented.");
    console.log('FETCH SECURITY SERVICE CONFIGURATIONS: >>> ');
    console.log('FETCH RULES FOR EVENTS TRIGGERING: >>> ');
  }

  async getSystemInformation(valueObject: any): Promise<SystemInfo>{   
    let systemInfo = await this.commonService.getSystemInformation(valueObject);
    if(!systemInfo.other){
      systemInfo.other = {};
    }
    systemInfo.other.radioAvailable = this.radioService.isAvailable();
    delete systemInfo.internet;
    return systemInfo;
  }


}
