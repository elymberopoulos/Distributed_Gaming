const jsnes = require('jsnes');
const fs = require('fs');
//Require the emulator and FS for loading rom data from path.

function loadRom() {

    var nes = new jsnes.NES({

    });

    var romData = fs.readFileSync('./rom/Legend_of_Zelda.nes', { encoding: 'binary' });

    nes.loadROM(romData);
    nes.frame();
}


