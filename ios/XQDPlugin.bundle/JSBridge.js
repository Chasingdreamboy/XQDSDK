;(function (w, doc) {
  if(w.JSBridge) {
    return;
  }

  var JSBRIDGE_URL_SCHEME = 'kxdbridge';
  var JSBRIDGE_URL_MESSAGE = '__KXD_URL_MESSAGE__';
  var JSBRIDGE_URL_API = '__KXD_URL_API__';
  var ua = w.navigator.userAgent;
  var isIOSDevice = /iP(hone|od|ad)/g.test(ua);
  var isAndroidDevice = /Android/g.test(ua);
  var responseCallbacks = {};
  var messageHandlers = {};
  var jsBridgeApiData = null;

  function noop () {}

  function JSBridgeLog () {
    if(typeof console !== 'undefined') {
      console.log('[JSBridge] LOG: ', arguments);
    }
  }

  function JSBridgeLogException (e, m) {
    if(typeof console !== 'undefined') {
      console.error('[JSBridge] EXCEPTION: ', arguments);
    }
  }

  function getIFrameSrc (param) {
    return JSBRIDGE_URL_SCHEME + '://' + JSBRIDGE_URL_MESSAGE + '/' + param;
  }

  function callObjCAPI (name, data) {
    var iframe = doc.createElement('iframe');
    jsBridgeApiData = {api: name};

    if (data) {
      jsBridgeApiData.data = data;
    }

    iframe.setAttribute('src', getIFrameSrc(JSBRIDGE_URL_API));
    doc.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
  }

  function callNative (name, data, responseCallback) {
    data = data || {};
    try {
      if (responseCallback) {
        var cbID = 'cbID' + (+new Date);
        responseCallbacks[cbID] = responseCallback;
        data.callbackID = cbID;
      }

      if (isIOSDevice) {
        callObjCAPI(name, data);
      } else if (isAndroidDevice) {
        data = JSON.stringify(data);
        AndroidAPI.processJSAPIRequest(name, data);
      } else {
        throw new Error('Unsupport device');
      }
    } catch(e) {
      JSBridgeLogException(e, 'Invalid API: ' + name);
    }
  }

  function registerJSEventHandler (eventName, handler) {
    if (!messageHandlers[eventName]) {
      messageHandlers[eventName] = [];
    }

    messageHandlers[eventName].push(handler);
  }

  function removeJSEventHandler (eventName, handler) {
    var handlers = messageHandlers[eventName];
    if (!handlers) {
      return;
    }

    var index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  function dispatchMessageFromNative (message) {
    setTimeout(function _timeoutDispatchMessage () {
      try {
        var handlers = messageHandlers[message.eventName] || [];
        for (var i = 0; i < handlers.length; i++) {
          handlers[i](message.data);
        }
      } catch(e) {
        JSBridgeLogException(e, 'dispatchMessageFromNative');
      }
    });
  }

  function _getAPIData () {
    return JSON.stringify(jsBridgeApiData);
  }

  function _invokeJSCallback (cbID, removeAfterExecute, config) {
    if (!cbID) {
      return;
    }

    var cb = responseCallbacks[cbID];
    if (!cb) {
      return;
    }

    if (removeAfterExecute) {
      delete (responseCallbacks[cbID]);
    }

    var data = config;
    if (isAndroidDevice) {
      try {
        data = JSON.parse(config);
      } catch(e) {
      }
    }

    if (data.callbackID) {
      delete data.callbackID;
    }

    cb.call(null, data);
  }

  function _handleMessageFromNative (message) {
    dispatchMessageFromNative(message);
  }

  w.JSBridge = {
    registerJSEventHandler: registerJSEventHandler.bind(this),
    removeJSEventHandler: removeJSEventHandler.bind(this),
    callNative: callNative.bind(this),
    _getAPIData: _getAPIData.bind(this),
    _invokeJSCallback: _invokeJSCallback.bind(this),
    _handleMessageFromNative: _handleMessageFromNative.bind(this),
  };

  var readyEvent = doc.createEvent('Events');
  readyEvent.initEvent('JSBridgeReady');
  readyEvent.bridge = JSBridge;
  doc.dispatchEvent(readyEvent);
})(window, document);
