// Object to capture process exits and call app specific cleanup function

function noOp() {};

export class Cleanup {
    constructor(){}

    init(callback: any){
      callback = callback || noOp;   

      process.on('cleanup', callback);

      // do app specific cleaning before exiting
      process.on('exit', function () {
        callback();
      });

      process.on('beforeExit', async () => {
        await callback()
        process.exit(0) // if you don't close yourself this will run forever
      });

      // catch ctrl+c event and exit normally
      process.on('SIGINT', function () {
        console.log('Ctrl-C...');
        process.exit(2);
      });

      //catch uncaught exceptions, trace, then exit normally
      process.on('uncaughtException', function(e) {
        console.log('Uncaught Exception...');
        console.log(e.stack);
        process.exit(99);
      });
    }

}
