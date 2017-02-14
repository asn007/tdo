import Trello from 'trello'
import { API_KEY } from '../appvars'
import UserData from '../configreader'
export default function listTasks() {
    const trello = new Trello(API_KEY, UserData.get('user.token'));
}