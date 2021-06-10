import {bind, inject, BindingScope} from '@loopback/core';
import { CameraServiceI } from './types';

const NodeWebcam = require( "node-webcam" );
const path = require('path');

@bind({scope: BindingScope.SINGLETON})
export class WebcamService implements CameraServiceI {

    camera: any;

    webcam_opts = {
        width: 264,
        height: 264,
        quality: 100,
        frames: 60,
        delay: 0,
        saveShots: true,
        output: "jpeg",
        device: false,
        callbackReturn: "buffer",
        verbose: false
      };

      webcam = NodeWebcam.create( this.webcam_opts );
    
    constructor() { }

    async takePicture(): Promise<any>{    
        try{
                const imgPath = path.join(process.env.DATA_DIR, 'frames', 'frame.jpg');        
                // const imgPath = path.join('/tmp', 'frame.jpg');
                // return await this.webcam.capture( imgPath, async function( err: any, imageBuffer: any ) {
                //     if(err){
                //         console.error(err);
                //         return err;
                //     }
                //     return imageBuffer;        
                // });

                return new Promise((resolve, reject) => {
                    try {
                        this.webcam.capture( imgPath, async function( err: any, imageBuffer: any ) {
                        if(err){
                          console.error(err);
                          return reject(err);
                        }
                        resolve(imageBuffer);        
                      });
                    } catch (err) {
                        console.error(err);
                        return reject(err);
                    }    
                  });

            }catch(err){
                console.log("Error in takePicture: >>>>>>> ");
                console.log(err);
            }
    }

    async shotVideo(seconds: number): Promise<void>{    
        try{
            

            }catch(err){
                
                console.log("Error in shotVideo: >>>>>>> ");
                console.log(err);
            }
    }


}
