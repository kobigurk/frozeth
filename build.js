var NwBuilder = require('nw-builder');
var nw = new NwBuilder({
    files: './app/**/**', // use the glob format
    platforms: ['linux32','linux64','osx32', 'osx64', 'win32', 'win64']
});

//Log stuff you want

nw.on('log',  console.log);

// Build returns a promise
nw.build().then(function () {
   console.log('all done!');
}).catch(function (error) {
    console.error(error);
});


