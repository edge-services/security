import {bind, inject, BindingScope} from '@loopback/core';
import { RadioServiceI } from './types';

let RADIO: any;

@bind({scope: BindingScope.TRANSIENT})
export class RadioService implements RadioServiceI {

    radio: any;
    FREQUENCY: string = '433e6';
    private radioAvailable: boolean = false;

    constructor(
      // @inject(ServiceBindings.DATAFLOW_SERVICE) private dataflowService: DataFlowServiceI
    ) {
        if(process.platform != 'darwin'){
            RADIO = require('edge-sx127x');
        }
    }

  async initRadio(): Promise<void>{    
    try{

      if(!process.env.USE_RADIO){
          return Promise.resolve();
      }

        if(this.radio || !RADIO){
          return Promise.resolve();
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
                // this.dataflowService.execute(data);                
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

            return Promise.resolve();

        }catch(err){
            this.radioAvailable = false;
            console.log("Error in initRadion: >>>>>>> ");
            console.log(err);
        }
  }

  isAvailable() {
    return this.radioAvailable;
  }

  async send(payload: any): Promise<any> {
    if(this.radio && this.radioAvailable && payload){
      const buffer = Buffer.from(JSON.stringify(payload)).toString('base64');
      this.radio.write(buffer, function(err: any){
          if(err){
            console.error(err);
          }else{
            console.log('SUCCESS');
          }
      });
    }
  }


}
