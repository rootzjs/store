"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var appState = {};
var storeIdContainer = {};
var componentStateHandler = {};
var store = {};

var setImmutableObject = function setImmutableObject(state, newState) {
    return Object.assign({}, state, newState);
};
/*
* this function has been extracted from ReactJS, <component.prototype.setState> function.
*/

var getEnqueueStateHandler = function getEnqueueStateHandler(scope) {
    var enqueueStateHandler = function (partialState, callback) {
        this.updater.enqueueSetState(this, partialState, callback, "setState");
    }.bind(scope);

    var onStoreUpdateHandler = function (branch) {
        this.onStoreUpdate(appState[branch]);
    }.bind(scope);

    return {
        enqueueStateHandler: enqueueStateHandler,
        onStoreUpdateHandler: onStoreUpdateHandler
    };
};

var setStateHandler = function setStateHandler(scope, branch, state) {
    var timestamp = new Date().getTime();
    scope.state = {
        __rootzStateHandlerVariable: 0
    };
    componentStateHandler = setImmutableObject(componentStateHandler, _defineProperty({}, branch, {
        state: scope.state,
        stateHandler: getEnqueueStateHandler(scope)
    }));
    updateAppState(branch, state);
};

var updateAppState = function updateAppState(branch, newState) {
    appState[branch] = setImmutableObject(appState[branch], newState);
};

var executeHandler = function executeHandler(newState, branch) {
    debugger;
    var requestedBranch = componentStateHandler[branch];
    var rootzStateHandlerVariable = requestedBranch.state.__rootzStateHandlerVariable;
    updateAppState(branch, newState);
    requestedBranch.stateHandler.onStoreUpdateHandler(branch);
    requestedBranch.stateHandler.enqueueStateHandler({
        __rootzStateHandlerVariable: rootzStateHandlerVariable + 1
    });
};
/*
* Intrinsic Functions - End
*/


store.add = function (scope, id, state) {
    if (scope.hasOwnProperty("props")) {
        // class
        setStateHandler(scope, id, state);
    } else {// function
    }
};

store.update = function (id) {
    return function (newState, newStateHandler) {
        if (newStateHandler && typeof newStateHandler === "function") {
            executeHandler(newStateHandler(appState[id], newState), id);
        } else {
            executeHandler(newState || appState[id], id);
        }
    };
};

var _default = store;

exports.default = _default;