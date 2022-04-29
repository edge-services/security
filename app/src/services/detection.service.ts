import { ServiceBindings } from '../keys';
import { DetectionServiceI, CommonServiceI, CameraServiceI, DataFlowServiceI } from './types';
import {bind, inject, BindingScope, service} from '@loopback/core';
import path from 'path';
import * as SCHEDULE from 'node-schedule';
import fetch from 'cross-fetch';
import { FileUtil } from '../utils';

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

    async init(){
      const appConfig = await this.commonService.getItemFromCache('APP_CONFIG');
      const DATA_DIR = appConfig.DATA_DIR || path.join(__dirname, '../assets');  
      const modelDir = path.join(DATA_DIR, 'model');
      const tarFilePath = path.join(DATA_DIR, 'model.tgz');
      // const tarFilePath = appConfig.MODEL_TAR_FILE

      const fileUtil = new FileUtil(this.commonService);

      if (!fs.existsSync(modelDir)){
        console.log('Download and Extract AI Model');
        const URL = appConfig['MODEL_TAR_FILE'];
        const result = await fileUtil.download(URL, tarFilePath, DATA_DIR).catch((err: any) => {
          console.error('error while downloading', err)
        }).finally(async () =>{
            // console.log('DOWNLOAD COMPLETED.....');
            // (await this.commonService.getRespEmitter()).emit("MODEL_AVAILABLE", null, "SUCCESS"); 
        });        
      }else{
        console.log("<<<<<<<<< MODEL IS ALREADY AVAILABLE >>>>>>>>");
        (await this.commonService.getRespEmitter()).emit("MODEL_AVAILABLE", null, "SUCCESS");  
      }
    }

    
    async startDetection(): Promise<void> {    
        try{
                console.log('\n\n<<<<< Starting Events Detection >>>>>> \n\n');
                const appConfig = await this.commonService.getItemFromCache('APP_CONFIG');
                const DATA_DIR = appConfig.DATA_DIR || path.join(__dirname, '../assets');  
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
          const appConfig = await this.commonService.getItemFromCache('APP_CONFIG');
          const LABELS = appConfig.LABELS || ''; 
          const DATA_DIR = appConfig.DATA_DIR || path.join(__dirname, '../assets');  
          this.labels = LABELS.split(',');
          const MODEL_PATH = path.join(DATA_DIR, 'model');
          // const MODEL_PATH = path.join(DATA_DIR, 'seq-mobilenet.h5');
          console.log('MODEL_PATH: >> ', MODEL_PATH);
          if (!this.model) {
             this.model = await tf.node.loadSavedModel(MODEL_PATH, ['serve'], 'serving_default');
            // this.model = await tf.node.loadSavedModel(MODEL_PATH);
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
        const tfimage = tf.node.decodeImage(imageBuffer, 3);
        const img =  tf.tidy(() => tfimage.expandDims(0).toFloat().div(255).sub(1));
        const processedImg = tf.image.resizeBilinear(img, [224, 224]); 
        // console.log(processedImg);
        // image.dispose();
        return processedImg;
    }

    private async predict(image: any): Promise<any> {
          try{
            const processedImg = await this.processImage(image);
            if(processedImg && this.model){
              let predictions = await this.model.predict(processedImg);
              const predicted_index = await predictions.as1D().argMax().data();  
              const score = await predictions.as1D().softmax().max().data();
              // const confidence = Math.round(await predictions.as1D().max().data() * 100); 
              const confidence = Math.round(score[0] * 100); 
              const result = {'input': {'image': image}, 'output': {'class': this.labels[predicted_index], 'confidence': confidence}}; 
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
