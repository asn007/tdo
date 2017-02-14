import fs from 'fs'
import os from 'os'
import path from 'path'
import { promisifyModule } from './utils/promisifier'
import { initWizard } from './frames/welcome'
import listTasks from './frames/list-tasks'

import UserInfo from './configreader'

async function main() {
    await UserInfo.load();
    if(!UserInfo.has('user.token'))
        return await initWizard();
    else {
        if (process.argv.length == 2) return await listTasks();
        else {
            // render different commands
        }
    }

}

main();