import art from 'ascii-art'
import { promisify } from '../utils/promisifier'
import inquirer from 'inquirer'

const font = promisify(art.font, art, true);
const authURL = `https://trello.com/1/authorize?scope=${encodeURIComponent('read,write')}&expiration=never&name=TDo&return_url=${encodeURIComponent('https://tdo.github.io/auth/index.html')}&key=12be0167fc6844967b5f86b7f8dede89&callback_method=fragment`;
export async function initWizard() {
    const rendered = await font('TDo', 'Doom');
    console.log(rendered);
    console.log(art.style(`Looks like it's your first time using TDo`, 'bright_green'));
    console.log(art.style(`I'll help you get everything up and running. Follow me!`, 'bright_green'));
    console.log(art.style(authURL, 'bright_blue'));
    const results = await inquirer.prompt([
        {type: 'input', name: 'token', message: `Open the URL above in your browser, authenticate TDo and paste token here: \n`}
    ]);
    console.log(art.style(`Token `, 'bright_blue') + art.style(results.token, 'bright_green') + art.style(` has been saved`, 'bright_blue'));
    return true;
}