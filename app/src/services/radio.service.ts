import {bind, inject, BindingScope} from '@loopback/core';
import { ServiceBindings } from '../keys';
import { RadioServiceI, RuleServiceI } from './types';

let RADIO: any;

@bind({scope: BindingScope.TRANSIENT})
export class RadioService implements RadioServiceI {

    radio: any;
    FREQUENCY: string = '433e6';
    private radioAvailable: boolean = false;

    constructor(
      @inject(ServiceBindings.RULE_SERVICE) private ruleService: RuleServiceI
    ) {
        if(process.platform != 'darwin'){
            RADIO = require('edge-sx127x');
        }
    }

  async initRadio(): Promise<void>{    
    try{
        if(this.radio || !RADIO){
            return;
        }
        this.radio = new RADIO({
              frequency: this.FREQUENCY
            });
            this.radio.open((err: any) => {
              console.log('Radio Open: ', err ? err : 'success');
              if (err) {
                  console.log(err);
                  this.radioAvailable = false;
              }
              this.radioAvailable = true;
              this.radio.on('data', (data: any, rssi: any) => {
				        console.log('data:', '\'' + data.toString() + '\'', rssi);
                console.log('\n\nRadio data received: ' + data.toString());  
                this.ruleService.processRules(data);                
              });

              // enable receive mode
              this.radio.receive((err: any) => {
                console.log('LORA In Receive Mode ', err ? err : 'success');
              });
            });

            process.on('SIGINT', () => {
              // close the device
              this.radioAvailable = false;
              this.radio.close(function(err: any) {
                console.log('close', err ? err : 'success');
                process.exit();
              });
            });

        }catch(err){
            this.radioAvailable = false;
            console.log("Error in initRadion: >>>>>>> ");
            console.log(err);
        }
  }

  isAvailable() {
    return this.radioAvailable;
  }


}
