import React, { useState } from 'react';

const appState = {};
const storeIdContainer = {};
let componentStateHandler = {};
let store = {};
const setImmutableObject = (state, newState) => Object.assign({}, state, newState);

/*
* this function has been extracted from ReactJS, <component.prototype.setState> function.
*/
const getEnqueueStateHandler = scope => {
    const enqueueStateHandler = function (partialState, callback) {
        this.updater.enqueueSetState(
            this,
            partialState,
            callback,
            "setState"
        );
    }.bind(scope)
    const onStoreUpdateHandler = function (branch) {
        this.onStoreUpdate(appState[branch]);
    }.bind(scope)
    return { enqueueStateHandler, onStoreUpdateHandler }
}

const setStateHandler = (scope, branch, state) => {
    scope.state = { __rootzStateHandlerVariable: 0 };
    componentStateHandler = setImmutableObject(componentStateHandler, {
        [branch]: {
            type: "class",
            state: scope.state,
            stateHandler: getEnqueueStateHandler(scope)
        }
    });
    updateAppState(branch, state);
}

const setStateHandlerForHook = (WrapperComponent, branch, initialstate) => {
    const stateHandlerVariable = { __rootzStateHandlerVariable: 0 };
    const WrapperComponentFunc = props => {
        const [state, setState] = useState({ ...stateHandlerVariable });

        componentStateHandler[branch] = setImmutableObject(componentStateHandler[branch], {
            stateHandler: setState
        });

        return <WrapperComponent props={props} state={appState[branch]} />
    }
    componentStateHandler = setImmutableObject(componentStateHandler, {
        [branch]: {
            type: "function",
            state: stateHandlerVariable
        }
    });
    updateAppState(branch, initialstate);

    return WrapperComponentFunc;
}

const updateAppState = (branch, newState) => {
    appState[branch] = setImmutableObject(appState[branch], newState);
}

const executeHandler = (newState, branch) => {
    const requestedBranch = componentStateHandler[branch];
    const rootzStateHandlerVariable = requestedBranch.state.__rootzStateHandlerVariable;
    updateAppState(branch, newState);
    if (!requestedBranch.hasOwnProperty("stateHandler")) {
        console.error(`Property "${branch}" is defined in @rootzjs/store but not used, Please comment / remove the definition.`);
        return;
    }
    requestedBranch.stateHandler.onStoreUpdateHandler(branch);
    requestedBranch.stateHandler.enqueueStateHandler({ __rootzStateHandlerVariable: rootzStateHandlerVariable + 1 });
}

const executeHandlerForHook = (newState, branch) => {
    const requestedBranch = componentStateHandler[branch];
    const rootzStateHandlerVariable = requestedBranch.state.__rootzStateHandlerVariable;
    updateAppState(branch, newState);
    debugger;
    if (!requestedBranch.hasOwnProperty("stateHandler")) {
        console.error(`Property "${branch}" is defined in @rootzjs/store but not used, Please comment / remove the definition.`);
        return;
    }
    requestedBranch.stateHandler({ __rootzStateHandlerVariable: rootzStateHandlerVariable + 1 });
}

/*
* Intrinsic Functions - End
*/

store.add = function (scope, state, id = null) {
    if (typeof scope === "function") {
        // function
        if (id === null) {
            id = scope.name;
        }
        if (appState.hasOwnProperty(id)) {
            console.error(`property "${id}" already exists in @rootzjs/store, Use "id" param from store.add(scope, state, id) { }, to provide a unique name / id`);
            return;
        }
        return setStateHandlerForHook(scope, id, state);
    } else {
        // class
        if (id === null) {
            id = scope.constructor.name;
        }
        if (appState.hasOwnProperty(id)) {
            console.error(`property "${id}" already exists in @rootzjs/store, Use "id" param from store.add(scope, state, id) { }, to provide a unique name / id`);
            return;
        }
        setStateHandler(scope, id, state);
    }
};

store.update = id => (newState, newStateHandler) => {
    const type = componentStateHandler[id].type;
    if (type === "class") {
        if (newStateHandler && typeof newStateHandler === "function") {
            executeHandler(newStateHandler(appState[id], newState), id)
        } else {
            executeHandler(newState || appState[id], id);
        }
    }
    else if (type === "function") {
        if (newStateHandler && typeof newStateHandler === "function") {
            executeHandlerForHook(newStateHandler(appState[id], newState), id)
        } else {
            executeHandlerForHook(newState || appState[id], id);
        }
    }
}

export default store;

