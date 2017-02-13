import fs from 'fs'
import os from 'os'
import path from 'path'
import { promisifyModule } from './utils/promisifier'
import { initWizard } from './frames/welcome'

const asyncFs = promisifyModule(fs);

async function main() {
    let exists = false;
    try {
        await asyncFs.access(path.join(os.homedir(), '.trellodo.json'));
        exists = true;
    } catch (e) {}
    if(!exists)
        return await initWizard();
    else
        console.dir(process.argv);
}

main();