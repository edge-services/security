import {bind, inject, BindingScope} from '@loopback/core';
import { CameraServiceI } from './types';

import { StillCamera, Flip, ExposureMode, AwbMode } from "pi-camera-connect";
const path = require('path');
const fs = require('fs');

@bind({scope: BindingScope.SINGLETON})
export class PicamService implements CameraServiceI {

    stillCamera: StillCamera = new StillCamera({
        width: 224,
        height: 224,
        flip: Flip.Both,
        brightness: 50,
        sharpness: 0,
        contrast: 0,
        saturation: 0,
        exposureMode: ExposureMode.Auto,
        awbMode: AwbMode.Auto
    });
    
    constructor() { }

    async takePicture(): Promise<any>{    
        try{
            
            return await this.stillCamera.takeImage();

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
