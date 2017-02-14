import art from 'ascii-art'
import { promisify, promisifyClass, getAllMethods } from '../utils/promisifier'
import inquirer from 'inquirer'
import { API_KEY } from '../appvars'
import Trello from 'trello'
import P from 'bluebird'

import UserData from '../configreader'

export async function addBoard(me) {
    const trello = new Trello(API_KEY, UserData.get('user.token'));
    console.log(art.style('> Fetching organizations board data...', 'white'));
    const allOrganizational = [];
    const organizationFetcherPromise = [];
    const orgInfoFetcherPromise = [];
    const orgBoards = {
        'personal': []
    };
    const orgData = {
        'personal': { displayName: 'Personal' }
    };

    me.idOrganizations.forEach(id => organizationFetcherPromise.push(trello.getOrgBoards(id)));
    let orgs = await P.all(organizationFetcherPromise);
    orgs.filter(org => org.length > 0).forEach(org => {
        const id = org[0].idOrganization;
        orgInfoFetcherPromise.push(trello.makeRequest('get', '/1/organizations/' + id).then(org => orgData[org.id] = org));
        orgBoards[id] = org;
        org.forEach(board => allOrganizational.push(board.id));
    });
    console.log(art.style('> Fetching personal board data...', 'white'));
    const boardFetcherPromise = [];
    const personalBoards = me.idBoards.filter(current => {
        return allOrganizational.filter(currentA => currentA === current).length == 0;
    });
    personalBoards.forEach(id => boardFetcherPromise.push(trello.makeRequest('get', '/1/boards/' + id)));
    orgBoards.personal = await P.all(boardFetcherPromise);
    console.log(art.style('> Fetching organizations information...'));
    let organizations = await P.all(orgInfoFetcherPromise);
    const choices = [];
    Object.keys(orgBoards).forEach(key => {
        if(orgBoards[key].length > 0) {
            choices.push(new inquirer.Separator(`-- ${orgData[key].displayName}:`));
            orgBoards[key].forEach(item => choices.push({ name: item.name, value: item.id, short: orgData[key].displayName + ': ' + item.name}));
        }
    });

    const { board } = await inquirer.prompt([{
        type: 'list',
        name: 'board',
        message: `Choose a board you'd like TDo to attach to:`,
        choices,
        default: 0
    }]);

    console.log(`> Saving...`);
    if(!UserData.get('boards')) UserData.set('boards', []);
    UserData.get('boards').push(board);

    await UserData.save();
}