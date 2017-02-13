const P = require('bluebird');
import isFunction from './isFunction'

export function promisify(fn, module, alwaysResolvable) {
    return function() {
        const args = arguments;
        return new P((resolve, reject) => {
            let narr = unwrapArguments(args);
            narr.push(alwaysResolvable ? alwaysResolvableCallback(resolve) : __generateCallback(resolve, reject));
            fn.apply(module ? module : null, narr);
        });
    }
}

export function promisifyModule(mod) {
    const result = Object.assign({}, mod);
    Object.keys(result).forEach((potentialCandidate) => {
        if(isFunction(result[potentialCandidate]) && !potentialCandidate.endsWith('Sync')) result[potentialCandidate] = promisify(result[potentialCandidate], mod);
    });
    return result;
}

function numSort(a, b) {
    return a - b;
}

function unwrapArguments(args) {
    const aKeys = Object.keys(args).filter(key => args.hasOwnProperty(key)).map(key => Number(key));
    const result = [];
    aKeys.sort(numSort);
    aKeys.forEach(key => result.push(args[key.toString()]));
    return result;
}

function alwaysResolvableCallback(resolve) {
    return function() {
        if(Object.keys(arguments).length == 1) return resolve(arguments['0']);
        return resolve(arguments);
    }
}

function __generateCallback(resolve, reject) {
    return function() {
        if(arguments[0]) return reject(arguments[0]);
        if(Object.keys(arguments).length == 2) return resolve(arguments['1']);
        return resolve(arguments.splice(1, arguments.length));
    }
}