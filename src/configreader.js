import { promisifyModule } from './utils/promisifier'
import fs from 'fs'
import path from 'path'
import os from 'os'

const asyncFs = promisifyModule(fs);

class ConfigurationFileReader {
    constructor(path) {
        this.path = path;
    }

    has(key) {
        return !!this._store[key];
    }

    get(key) {
        return this._store[key];
    }

    set(key, value) {
        this._store[key] = value;
    }

    async save() {
        return await asyncFs.writeFile(this.path, JSON.stringify(this._store), 'utf-8');
    }

    async load() {
        let exists = false;
        try {
            await asyncFs.access(this.path);
            exists = true;
        } catch (e) {}
        if(!exists) this._store = {};
        else {
            try {
                let contents = await asyncFs.readFile(this.path, 'utf-8');
                this._store = JSON.parse(contents);
            } catch(e) {
                console.log(e);
            }
        }
    }
}

const cfgReader = new ConfigurationFileReader(path.join(os.homedir(), '.trellodo.json'));

export default cfgReader;