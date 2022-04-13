import { SystemInfo } from "../models";
// import { Config } from "../models/config.model";
const EventEmitter = require('events');
class ResponseEmitter extends EventEmitter {};

export interface CommonServiceI {
    init(): Promise<void> ;
    getSystemDetails(): Promise<any> ;
    getSystemInformation(valueObject: any): Promise<SystemInfo> ;
    getSerialNumber(): Promise<string> ;
    setItemInCache(key: string, content: any): Promise<void>;
    getItemFromCache(key: string): Promise<any>;
    getRespEmitter(): Promise<ResponseEmitter>;
}

export interface RadioServiceI {
    initRadio(): void;
    isAvailable(): boolean;
    send(payload: any): Promise<any>;
}

export interface SecurityServiceI {
    initSecurity(): void;   
    syncWithCloud(): void;
    getSystemInformation(valueObject: any): Promise<SystemInfo> ;
}

export interface DetectionServiceI {
    init(): Promise<void>;
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

