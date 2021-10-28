import { ServiceBindings } from '../keys';
import { CommonServiceI, DataFlowServiceI, RadioServiceI } from './types';
import {bind, inject, BindingScope} from '@loopback/core';
// const moment = require('moment');
import fetch from 'cross-fetch';

@bind({scope: BindingScope.SINGLETON})
export class DataFlowService implements DataFlowServiceI {

    constructor(
        @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI,
        @inject(ServiceBindings.RADIO_SERVICE) private radioService: RadioServiceI,
    ) {
        
    }

    async execute(payload: any): Promise<any>{
        try{
            payload = JSON.parse(payload);
        }catch(error){
            // console.log('INVLAID JSON DATA: >> ', payload);
        }
        try{
            if(payload && payload['output']){
                console.log('IN DataflowService.execute, payload: >> ', payload['output']);
                await this.publish(payload);
             }
            //  return Promise.resolve(payload);
        }catch(error){
            console.error(error);
            return Promise.reject(error);
        } 
        
    }

    private async publish(result: any): Promise<any>{
        // console.log('In PUBLISH: >> ', result.output);
        let payload: any;
        let publish = false;
        const detecting_label = process.env.DETECT;
        if(detecting_label){
            if(detecting_label == result.output.class){
                publish  = true;
            }
        }else{
            publish  = true;
        }

        if(publish){
            payload = {
                "uniqueId": await this.commonService.getItemFromCache("deviceId"),
                "type": "RpiCamera",
                "d": result.output                
            }
            if(process.env.GATEWAY_API){
                return await this.publishToGateway(payload);
            }
    
            // console.log('Radio is available: >> ', this.radioService.isAvailable());
            if(this.radioService.isAvailable()){
                return await this.radioService.send(payload);
            }  
        }
        
        return Promise.resolve("SUCCESS");
    
    }

    private async publishToGateway(payload: any){
        if(payload){
            console.log(payload);
            const response = await fetch(process.env.GATEWAY_API+'/gateway/data-flow', {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {'Content-Type': 'application/json'} });
              
              if (!response.ok) { 
                  console.log('NO RESPONSE FROM GATEWAY SERVICE POST');
                  return Promise.resolve("SUCCESS");
              }
            
              if (response.body !== null) {
                return Promise.resolve();
              }
        }       
        
    }


}
