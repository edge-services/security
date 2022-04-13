// Object to capture process exits and call app specific cleanup function

import path from 'path';
import { CommonServiceI } from '../services';
const fs = require('fs');
// const request = require('request');
const http = require('https');
const zlib = require('zlib');
const tar = require('tar');
const mkdirp = require('mkdirp'); // used to create directory tree

export class FileUtil {
  commonService: CommonServiceI;
    constructor(commonService: CommonServiceI ){
      this.commonService = commonService;
    }

    async download(url: string, tarFilePath: string, dest: string){
      console.log('IN FileUtil.download, URL: ', url);
      var file = fs.createWriteStream(tarFilePath);
      var responseSent = false; // flag to make sure that response is sent only once.
      return http.get(url, (response: any) => {
        response.pipe(file);
        file.on('finish', () =>{
          file.close(() => {
            if(responseSent)  return;
            responseSent = true;
            console.log('DOWNLOAD COMPLETED.....');
            this.uncomress(tarFilePath, dest).then(() => {
                Promise.resolve("SUCCESS");
                console.log('<<<<<<<<<< MODEL FILE DOWNLOADED >>>>>>>>>>> ');
              }, e => console.log('error',e));
          });
        });
      }).on('error', (err: any) => {
          if(responseSent)  return;
          responseSent = true;
          return Promise.reject(err);
      });
    }

    async uncomress(filePath: string, dest: string){
      console.log('In uncomress, filePath: >> ', filePath, ', dest: ', dest);
      let that = this;
      return fs.createReadStream(filePath)
      .on('error', console.log)
      .pipe(zlib.Unzip())
      .pipe(tar.extract({cwd: dest}))
      .on('finish', async function(){
        console.log('<<<<<<<<<< UNCOMPRESS ALL FILES COMPLETED >>>>>>>>>>> ');
        (await that.commonService.getRespEmitter()).emit("MODEL_AVAILABLE", null, "SUCCESS"); 
        // Promise.resolve('SUCCESS');
      });      
    }


}
