import { ServiceBindings } from '../keys';
import { RuleServiceI, CommonServiceI } from './types';
import {bind, inject, BindingScope} from '@loopback/core';
import { Engine, Rule, Event } from 'json-rules-engine';
import fetch from 'cross-fetch';

@bind({scope: BindingScope.APPLICATION})
export class RuleService implements RuleServiceI {

    private engine: Engine;
    private eventsQueue = Array();
   
    constructor(
        @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI
    ) {
        this.engine = new Engine();
     }

    async formatNAddRules(rules: Array<any>): Promise<void>{
        let formatedRules: any = [];
        for(let rule of rules){
            let formatedRule: any = {'conditions': {}};
            if(rule.condition.type == 'all' || rule.condition.type == 'any'){
                formatedRule['conditions'][rule.condition.type] = [];
                for(let child of rule.children){
                    if(child.type == 'fact'){
                        formatedRule['conditions'][rule.condition.type].push({
                            "fact": child.fact.key,
                            "operator": child.fact.operator,
                            "value": child.fact.value,
                            "path": child.fact.path
                        })                       
                    }

                    formatedRules.push(formatedRule);
                }
            }
        }
        
        await this.addRules(formatedRules);

    }

    async addRules(rules: Array<Rule>) {
        if(rules){
            for(let rule of rules){
                this.engine.addRule(rule);                
            } 
        }               
    }

    async processRules(data: any): Promise<void> {    
        try{
                const facts: any = await this.transformNvalidate(data);
                let triggeredEvent;
                if(facts) {
                    if(facts && facts.output){
                        await this.engine
                        .run(facts.output)
                        .then(results => {
                            results.events.map(event => {
                                if(event && event.params){
                                    triggeredEvent = event;                                     
                                }                          
                            });
                        }).catch(err => console.log(err.stack));

                        delete facts['output']['success-events'];
                        if(triggeredEvent){
                            this.actionOnEvent(triggeredEvent, facts['output']);                                   
                        }else{
                            console.log('ALL OK: >> ', facts.output);
                        }
                    }  
                }
            } catch(err){
                console.log("Error in processRules: >>>>>>> ");
                console.error(err);
            }
    }

    private async actionOnEvent(event: Event, data: any){
        const actions = await this.commonService.getActions();
        // console.log('ACTIONS: >> ', actions);
        for(const action of actions){
            if(action.event == event.type){
                if(action.type == 'interval'){
                    await this.processIntervalAction(event, action, data);
                }                
            }
        }        
    }

    private async processIntervalAction(event: Event, action: any, data: any){
        // console.log("Event Triggered for data: ", data, ", Event: ", event);                                   
        const timeNow = new Date();
        this.eventsQueue.push({'time': timeNow, 'event': event});       
        const firstItem = this.eventsQueue[0];
        const seconds: number = (timeNow.getTime() - firstItem.time.getTime()) / 1000;
        if(seconds < action.publish.time){
            if(this.eventsQueue.length == action.publish.frequency){
                console.log(this.eventsQueue.length, ' ', event.type , ' events triggered in last ', seconds, ' seconds with ', data.confidence , ' confidence');
                console.log("PUBLISH EVENT for data: ", data, ", Event: ", event, "\n\n"); 
                this.eventsQueue = new Array(); 
                // await this.publishIFTTTWebhook(event, {'value1': data.confidence}); 
                await this.publishToFlow(event, data);                              
            }else{
                console.log(this.eventsQueue.length, ' ', event.type , ' events triggered in last ', seconds, ' seconds with ', data.confidence , ' confidence');
            }
        }else{
            // Remove first triggered Event from the Queue
            this.eventsQueue.shift();
        }
        
    }

    private async transformNvalidate(data: any): Promise<any>{
        // For eg. data = {'input': {'image': image}, 'output': {'class': 'Fire', 'confidence': 65}}; 
        let func = function transform(data: any){
            // console.log('In Transform function: >> ');
            return data;
        };
      
        var transformFuncStr = String(func);
        //   console.log(JSON.stringify(transformFuncStr));
        let transFunc: Function = new Function ('return ' +transformFuncStr)();

        return transFunc(data);
    }

    private async publishToFlow(event: Event, data: any){
        console.log('IN publishToFlow: >> Event: ', event, ', Data: ', data);
        if(process.env.FLOW_URL){

            let payload = {
                "topic": "detection",
                "metadata": {
                    "deviceId": await this.commonService.getSerialNumber(),
                    "deviceCategory":"RPiCamera",
                    "tenantId": "ibm",
                    "accountId": "3beGT2qPs8SzMNWTaeMN61"
                },
                "event": event,
                "d": data                
            }

            const response = await fetch(process.env.FLOW_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {'Content-Type': 'application/json'} });
              
              if (!response.ok) { 
                  console.log('NO RESPONSE FROM FLOW SERVICE POST');
              }
            
              if (response.body !== null) {
                // console.log(response.body);
              }
        }       
        
    }

    private async publishIFTTTWebhook(event: Event, payload: any){
        const iftt_URL = `https://maker.ifttt.com/trigger/${event.type}/with/key/btF72fQ8puB6rda4-ANVvn`;
        const response = await fetch(iftt_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {'Content-Type': 'application/json'} });
          
          if (!response.ok) { 
              console.log('NO RESPONSE FROM IFTTT WebHook POST');
          }
        
          if (response.body !== null) {
            // console.log(response.body);
          }
    }

}
