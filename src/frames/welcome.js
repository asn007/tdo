import art from 'ascii-art'
import { promisify } from '../utils/promisifier'
import inquirer from 'inquirer'

const font = promisify(art.font, art, true);

export async function initWizard() {
    const rendered = await font('TDo', 'Doom');
    console.log(rendered);
    console.log(art.style(`Looks like it's your first time using TDo`, 'bright_green'));
    console.log(art.style(`I'll help you get everything up and running. Follow me!`, 'bright_green'));
    const results = await inquirer.prompt([])
    return true;
}