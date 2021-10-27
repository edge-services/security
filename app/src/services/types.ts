import { SystemInfo } from "../models";
import { Config } from "../models/config.model";

export interface CommonServiceI {
    getSystemDetails(): Promise<any> ;
    getSystemInformation(valueObject: any): Promise<SystemInfo> ;
    getSerialNumber(): Promise<string> ;
    setItemInCache(key: string, content: any): Promise<void>;
    getItemFromCache(key: string): Promise<any>;
}

export interface RadioServiceI {
    initRadio(): void;
    isAvailable(): boolean;
}

export interface SecurityServiceI {
    initSecurity(): void;   
    syncWithCloud(): void;
    getSystemInformation(valueObject: any): Promise<SystemInfo> ;
}

export interface DetectionServiceI {
    startDetection(): Promise<void>;
    stopDetection(): Promise<void>;
}

export interface CameraServiceI {
    takePicture(): Promise<any>;
    shotVideo(seconds: number): Promise<void>;
}

export interface DataFlowServiceI {
    execute(payload: any): Promise<any>;
}

