import { SystemInfo } from "../models";
import { Config } from "../models/config.model";

export interface CommonServiceI {
    getAppConfig(): Promise<Config>;
    getRules(): Promise<any>;
    getActions(): Promise<any>;
    getSystemInformation(valueObject: any): Promise<SystemInfo> ;
    getSerialNumber(): Promise<string> ;
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

export interface RuleServiceI {
    formatNAddRules(rules: Array<any>): Promise<void>;
    addRules(rules: Array<any>): Promise<void>;
    processRules(data: any): Promise<void>;
}

export interface DetectionServiceI {
    startDetection(): Promise<void>;
    stopDetection(): Promise<void>;
}

export interface CameraServiceI {
    takePicture(): Promise<any>;
    shotVideo(seconds: number): Promise<void>;
}