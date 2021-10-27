import { ServiceBindings } from '../keys';
import { CommonServiceI, DataFlowServiceI } from './types';
import {bind, inject, BindingScope} from '@loopback/core';
// const moment = require('moment');
import fetch from 'cross-fetch';

@bind({scope: BindingScope.SINGLETON})
export class DataFlowService implements DataFlowServiceI {

    constructor(
        @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI
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
                await this.publishToGateway(payload);
             }
            //  return Promise.resolve(payload);
        }catch(error){
            console.error(error);
            return Promise.reject(error);
        } 
        
    }

    private async publishToGateway(result: any){
        let publish = false;
        const detecting_label = process.env.DETECT;

        if(detecting_label){
            if(detecting_label == result.output.class){
                publish  = true;
            }
        }else{
            publish  = true;
        }

        if(publish && process.env.GATEWAY_API){
            // console.log('IN publishToFlow: >> , Result: ', result.output);
            let payload = {
                "uniqueId": await this.commonService.getItemFromCache("deviceId"),
                "type": "RpiCamera",
                "d": result.output                
            }
            console.log(payload);
            const response = await fetch(process.env.GATEWAY_API+'/gateway/data-flow', {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {'Content-Type': 'application/json'} });
              
              if (!response.ok) { 
                  console.log('NO RESPONSE FROM GATEWAY SERVICE POST');
              }
            
              if (response.body !== null) {
                // console.log(response.body);
              }
        }       
        
    }


}
