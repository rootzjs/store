import React, { useState } from 'react';
import Rootz, { accessKey } from './Rootz';
/*
* Variable Declarations - Start Here
*/

let store = {};
let StoreManager = {};
let defualtAppState = {};
let componentStateHandler = {};

const appState = {};
const storeIdContainer = {};
const key = "cf11ba19a142955fc417a9fb2e509749";

/*
* Variable Declarations - Ends Here
*/

/*
* Intrinsic Functions - Start Here
*/

const setImmutableObject = (state, newState) => Object.assign({}, state, newState);

/*
* @Important Note: this function has been extracted from ReactJS, <component.prototype.setState> function.
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
        this.onStoreUpdate({ ...appState[branch], defualtAppState });
    }.bind(scope)
    return { enqueueStateHandler, onStoreUpdateHandler }
}

const setStateHandler = (scope, branch, state) => {
    scope.state = { __rootzStateHandlerVariable: 0 };
    updateComponentStateHandler(branch, {
        type: "class",
        state: scope.state,
        stateHandler: getEnqueueStateHandler(scope)
    });
    updateAppState(branch, state);
}

const setStateHandlerForHook = (WrapperComponent, branch, initialstate) => {
    const stateHandlerVariable = { __rootzStateHandlerVariable: 0 };
    const WrapperComponentFunc = props => {
        const [state, setState] = useState({ ...stateHandlerVariable });

        updateComponentStateHandler(branch, {
            "stateHandler": setState
        });

        return <WrapperComponent props={props} state={{ ...appState[branch], defualtAppState }} />
    }
    updateComponentStateHandler(branch, {
        "type": "function",
        "state": stateHandlerVariable
    });
    updateAppState(branch, initialstate);

    return WrapperComponentFunc;
}

const updateAppState = (branch, newState) => {
    appState[branch] = setImmutableObject(appState[branch], newState);
}

const updateComponentStateHandler = (branch, newStateHandler) => {
    componentStateHandler[branch] = setImmutableObject(componentStateHandler[branch], newStateHandler);
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
    if (!requestedBranch.hasOwnProperty("stateHandler")) {
        console.error(`Property "${branch}" is defined in @rootzjs/store but not used, Please comment / remove the definition.`);
        return;
    }
    requestedBranch.stateHandler({ __rootzStateHandlerVariable: rootzStateHandlerVariable + 1 });
}

/*
* Intrinsic Functions - Ends Here
*/

/** 
 * Store Manager, Rootz Accessible Functions for Future Development - Starts Here 
*/

StoreManager.setState = (id, state) => { updateAppState(id, state) }

StoreManager.getState = id => ({ ...appState[id], defualtAppState });

StoreManager.setHandler = (id, handler) => {
    componentStateHandler[id] = setImmutableObject(componentStateHandler[id], {
        stateHandler: handler
    });
}

StoreManager.setHandlerVariable = (id, stateHandlerVariable) => {
    componentStateHandler = setImmutableObject(componentStateHandler, {
        [id]: {
            type: "function",
            state: stateHandlerVariable
        }
    });
}

StoreManager.requestUpdate = id => {
    const requestedBranch = componentStateHandler[id];
    const rootzStateHandlerVariable = requestedBranch.state.__rootzStateHandlerVariable;

    requestedBranch.stateHandler({ __rootzStateHandlerVariable: rootzStateHandlerVariable + 1 });
}

StoreManager.setContext = defaultState => {
    store.setDefualt(defaultState);
}

StoreManager.getContext = () => defualtAppState

/** 
 * Store Manager, Rootz Accessible Functions for Future Development - Ends Here 
*/

/* 
* Client Side Accessible Functions - Starts Here  
*/

store.add = (scope, state, id = null) => {
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

store.setDefualt = defaultState => {
    defualtAppState = setImmutableObject(defualtAppState, defaultState);
}
/** 
 * Client Side Accessible Functions - Ends Here 
*/



export default store;

export { StoreManager };

