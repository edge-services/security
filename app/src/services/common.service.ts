import {bind, BindingScope} from '@loopback/core';
import * as si from 'systeminformation';
import * as os from 'os';
import * as fs from 'fs';
import { CommonServiceI } from '.';
import { SystemInfo } from './../models/system-info.model';
import * as configJson from '../config/config.json';
import { Config } from '../models/config.model';
import path from 'path';

const request = require('request');

@bind({scope: BindingScope.SINGLETON})
export class CommonService implements CommonServiceI {

  constructor() {}

  private APP_CONFIG: Config;

  async getAppConfig(): Promise<Config> {  
    if(!this.APP_CONFIG) {
      this.APP_CONFIG = configJson;
    }
    return this.APP_CONFIG;
  }

  async getRules(): Promise<any> {  
    if(!this.APP_CONFIG) {
      this.APP_CONFIG = await this.getAppConfig();
    }
     return this.APP_CONFIG.rules;
  }
  
  async getActions(): Promise<any> {  
    if(!this.APP_CONFIG) {
      this.APP_CONFIG = await this.getAppConfig();
    }
     return this.APP_CONFIG.actions;
  }

  async getSystemInformation(valueObject: any): Promise<SystemInfo> {   
    if(!valueObject) {
      valueObject = {
        "osInfo": "platform, release",
        "mem": "total, free, used"             
      };
    }
    let systemInfo: SystemInfo = await si.get(valueObject);
    systemInfo.internet = await si.inetChecksite('google.com');
    systemInfo.other = {};
    if(systemInfo && systemInfo.internet) {
      systemInfo.other.internetAvailable = systemInfo.internet.ok;
      delete systemInfo.internet;
    }
    systemInfo.other.totalmem = os.totalmem() / (1024 * 1024);
    systemInfo.other.freemem = os.freemem() / (1024 * 1024);
    // systemInfo.cpus = os.cpus();
    systemInfo.other.uptime = os.uptime() / 60;
    systemInfo.other.serialNumber = await this.getSerialNumber();
    systemInfo.other.platform = process.platform;
    return systemInfo;
  }

  async getSerialNumber(): Promise<string> {
		try{
			  let content = fs.readFileSync('/proc/cpuinfo', 'utf8');
		    let cont_array = content.split("\n");
		    let serial_line = cont_array[cont_array.length-3];
		    let serial = serial_line.split(":");
		    return serial[1].slice(1);
//		    return "GG-000-000-001";
		}catch(err){
			console.log("process.platform: >>> ", process.platform);
			if(process.platform == 'darwin'){
				return "000000008c0be72b";
			}else{
				return '';
			}
    }
  }

  async loadConfiguration(): Promise<any>{
    return 
  }

}
