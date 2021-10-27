import { ServiceBindings } from '../keys';
import { DetectionServiceI, CommonServiceI, CameraServiceI, DataFlowServiceI } from './types';
import {bind, inject, BindingScope, service} from '@loopback/core';
import path from 'path';
import * as SCHEDULE from 'node-schedule';

const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

@bind({scope: BindingScope.SINGLETON})
export class DetectionService implements DetectionServiceI {

    model: any;
    labels: string[];
    predictionCount = 0;
    detecting: boolean = false; 
    
    constructor(
        @inject(ServiceBindings.COMMON_SERVICE) private commonService: CommonServiceI,
        @inject(ServiceBindings.CAMERA_SERVICE) private cameraService: CameraServiceI,
        @inject(ServiceBindings.DATAFLOW_SERVICE) private dataflowService: DataFlowServiceI,      
    ) {
        
     }

    async startDetection(): Promise<void> {    
        try{
                console.log('\n\n<<<<< Starting Events Detection >>>>>> \n\n');
                const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../assets');  
                const framesDir = path.join(DATA_DIR, 'frames');
                if (!fs.existsSync(framesDir)){
                    fs.mkdirSync(framesDir);
                }

                if(!this.detecting){
                    await this.loadModel();
                    let s = SCHEDULE.scheduleJob('*/5 * * * * *', async () => {
                        const result = await this.predictFrame();
                        await this.dataflowService.execute(result);                      
                        this.detecting = true;                      
                    }); 
                }else{
                    console.log('Event Already detecting...');
                } 


            } catch(err){
                console.log("Error in startDetection: >>>>>>> ");
                console.error(err);
            }
    }

    async stopDetection(): Promise<void> {    
        try{
                
            } catch(err){
                console.log("Error in stopDetection: >>>>>>> ");
                console.error(err);
            }
    }

    private async loadModel(): Promise<void> {
        try {
          const LABELS = process.env.LABELS || ''; 
          const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../assets');  
          console.log('DATA_DIR: >> ', DATA_DIR);
          this.labels = LABELS.split(',');
          const MODEL_PATH = path.join(DATA_DIR, 'model');
          if (!this.model) {
             this.model = await tf.node.loadSavedModel(MODEL_PATH, ['serve'], 'serving_default');
            //  objectDetectionModelInfo = await tf.node.getMetaGraphsFromSavedModel(path);
            console.log('AI Model Loaded...');
          }
        } catch (e) {
          console.log(e);    
        }
    }

    private async processImage(image: any): Promise<any> {
        let imageBuffer;
        if(Buffer.isBuffer(image)){
          imageBuffer = image;
        }else{
          imageBuffer = fs.readFileSync(image);
        }
        const tfimage = tf.node.decodeImage(imageBuffer);
        const processedImg =  tf.tidy(() => tfimage.expandDims(0).toFloat().div(224).sub(1));
        // imageBuffer.dispose();
        return processedImg;
    }

    private async predict(image: any): Promise<any> {
          try{
            const processedImg = await this.processImage(image);
            if(processedImg && this.model){
              let outputTensor = this.model.predict(processedImg);
              // console.log(outputTensor);
              const predictedClass = await outputTensor.as1D().argMax().data();
              const confidence = Math.round(await outputTensor.as1D().max().data() * 100); 
              const result = {'input': {'image': image}, 'output': {'class': this.labels[predictedClass[0]], 'confidence': confidence}}; 
              // const result = {'image': image, 'class': this.labels[predictedClass[0]], 'confidence': confidence}; 
              return result;      
            }    
          }catch(err){
              console.error('Error to predict: >>> ', err);
          }
      }

    private async predictFrame(): Promise<any> {
        // console.log(tf.getBackend());
        try{
          const image = await this.cameraService.takePicture();
          if(image){
            return await this.predict(image);           
          }else{
              console.log('NO IMAGE TO PROCESS: >>> ');
          }
        }catch(error){
          console.error(error);
        }       
    }

}
