import art from 'ascii-art'
import { promisify, promisifyClass, getAllMethods } from '../utils/promisifier'
import inquirer from 'inquirer'
import { API_KEY } from '../appvars'
import Trello from 'trello'
import { addBoard } from './add-board'
import P from 'bluebird'
import UserData from '../configreader'

const font = promisify(art.font, art, true);
const authURL = `https://trello.com/1/authorize?scope=${encodeURIComponent('read,write')}&expiration=never&name=TDo&return_url=${encodeURIComponent('https://asn007.github.io/tdo/auth/index.html')}&key=${API_KEY}&callback_method=fragment`;
export async function initWizard() {
    const rendered = await font('TDo', 'Doom');
    console.log(rendered);
    console.log(art.style(`Looks like it's your first time using TDo`, 'bright_green'));
    let me = null;
    let token = '';
    while(!me) {
        token = await connectToTrello();
        try {
            me = await tryFetchMe(token);
            if(typeof me === 'string') {
                console.log(art.style(`Error: Trello returned us this message: `, 'red') + art.style(me, 'white'));
                console.log(art.style(`I guess we should try again, shouldn't we?`, 'red'));
                me = null;
            }
        } catch(e) {}
    }
    console.log(art.style(`Connected to the Trello API! Hello and welcome to TDo, ${me.username}`, 'bright_green'));
    console.log(art.style('Some additional setup is needed, just one last step, I promise!'));
    UserData.set('user.token', token);
    return addBoard(me);
}

async function tryFetchMe(token) {
    const trello = new Trello(API_KEY, token);
    try {
        return await trello.getMember('me');
    } catch(e) {
        throw e;
    }
}

async function connectToTrello() {
    console.log(art.style(`I'll help you get everything up and running. Follow me!`, 'bright_green'));
    console.log(art.style(authURL, 'bright_blue'));
    const { token } = await inquirer.prompt([
        {type: 'input', name: 'token', message: `Open the URL above in your browser, authenticate TDo and paste token here: \n`}
    ]);
    console.log(art.style(`Token `, 'bright_blue') + art.style(token, 'bright_green') + art.style(` has been saved`, 'bright_blue'));
    console.log(art.style(`Connecting to Trello...`, 'bright_blue'));
    return token.trim();
}