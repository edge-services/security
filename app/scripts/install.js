const os = require('os');
var spawn = require('cross-spawn');

//  console.log(os.platform());
 console.log(process.platform);

/*
if (os.platform() === 'win32') {
    spawn.sync('npm', ['run', 'native_build'], {
        input: 'win32 detected. Build native module.',
        stdio: 'inherit'
    });
}
*/

if(process.platform != 'darwin'){
  spawn.sync('npm', ['install', 'edge-sx127x', '1.0.0'], {
      input: 'linux detected. Install edge-sx127x module.',
      stdio: 'inherit'
  });
}
