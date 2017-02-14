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

export function promisifyClass(cls) {
    const result = Object.assign({}, cls);
    getAllMethods(cls).forEach((potentialCandidate) => {
        if(isFunction(cls[potentialCandidate]) && !potentialCandidate.endsWith('Sync')) result[potentialCandidate] = promisify(cls[potentialCandidate], cls);
    });
    return result;
}

// http://stackoverflow.com/a/35033472
export const getAllMethods = (obj) => {
    let props = [];
    do {
        const l = Object.getOwnPropertyNames(obj)
            .concat(Object.getOwnPropertySymbols(obj).map(s => s.toString()))
            .sort()
            .filter((p, i, arr) =>
                typeof obj[p] === 'function' &&  //only the methods
                p !== 'constructor' &&           //not the constructor
                (i == 0 || p !== arr[i - 1]) &&  //not overriding in this prototype
                props.indexOf(p) === -1          //not overridden in a child
            );
        props = props.concat(l)
    }
    while (
    (obj = Object.getPrototypeOf(obj)) &&   //walk-up the prototype chain
    Object.getPrototypeOf(obj)              //not the the Object prototype methods (hasOwnProperty, etc...)
        );

    return props
};

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
        return resolve(unwrapArguments(arguments));
    }
}

function __generateCallback(resolve, reject) {
    return function() {
        if(arguments[0]) return reject(arguments[0]);
        if(Object.keys(arguments).length == 2) return resolve(arguments['1']);
        return resolve(unwrapArguments(arguments).splice(1, arguments.length));
    }
}