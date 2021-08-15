const fs = require('fs');
const path = require('path');

(async () => {
    const inDir = '/Users/liuzy/MeiZi';
    const outDir = '/Volumes/Macintosh SD/MeiZi';
    const dirs = fs.readdirSync(inDir);
    for (let i = 0; i < dirs.length; i++) {
        const dir = path.join(inDir, dirs[i]);
        if (dirs[i].indexOf('-') === -1) {
            continue;
        }
        const id = dirs[i].split('-')[0];
        const newId = (Array(5).join('0') + id).slice(-5);
        const files = fs.readdirSync(dir);
        for (let j = 0; j < files.length; j++) {
            const file = path.join(dir, files[j]);
            const idx = (Array(3).join('0') + (j+1)).slice(-3)
            const newName = `${newId}-${idx}${path.extname(file)}`;
            const newFile = path.join(outDir, newName);
            console.log(file, '=>', newFile);
            fs.copyFileSync(file, newFile);
        }
    }
})().catch(err => console.log(err));