(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var roomFriends = require('./modules/roomFriends');

roomFriends.init();

},{"./modules/roomFriends":4}],2:[function(require,module,exports){
/**
 * ajax.js
 *
 * Simple AJAX API similar to jQuery
 */

'use strict';

var ajax = {

    /**
     * URI Encode every key => value item in an array as a query parameter
     *
     * @param {Array} data
     * @returns {Array}
     * @private
     */
    _encodeURIArray: function (data) {
        var eArr = [];
        for (var key in data) {
            eArr.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        return eArr;
    },


    /**
     * Create either an XMLHttpRequest or XDomainRequest object
     *
     * @returns {Object}
     * @private
     */
    _makeRequest: function () {
        var r = {};
        if (typeof XMLHttpRequest !== 'undefined') {
            var xhr = new XMLHttpRequest();
            if('withCredentials' in xhr) {
                r.xhr = xhr;
            }
            // IE8 && 9
            else if(typeof XDomainRequest !== "undefined") {
                r.xdr = new XDomainRequest();
            }
        }
        return r;
    },


    /**
     * Send a request via XHR object
     *
     * @param {Object} r
     * @param {String} url
     * @param {String} method
     * @param {Function} callback
     * @param {String} data
     * @param {Boolean} async
     * @private
     */
    _sendRequestViaXHR: function(r, url, method, callback, data, async) {
        r.xhr.open(method, url, async);
        r.xhr.onreadystatechange = function () {
            if (r.xhr.readyState == 4) {
                callback(r.xhr.responseText);
            }
        };
        if (method == 'POST') {
            r.xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        r.xhr.send();
    },

    /**
     * Send a request via XDR object
     *
     * @param {Object} r
     * @param {String} url
     * @param {String} method
     * @param {Function} callback
     * @param {String} data
     * @private
     */
    _sendRequestViaXDR: function(r, url, method, callback, data) {
        r.xdr.open(method, url);
        r.xdr.onload = function() {
            callback(r.xdr.responseText);
        };
        r.xdr.onerror = function() {
            console.log("Request returned an error: ");
            console.log(r.xdr.responseText);
        };
        r.xdr.timeout = function() {
            console.log("Request timed out");
        };
        r.xdr.onprogress = function() {};

        setTimeout(function() {
            r.xdr.send(data);
        }, 0);
    },


    /**
     * Send a request to the server
     *
     * @param {String} url
     * @param {String} method
     * @param {Function} callback
     * @param {String} data
     * @param {Boolean} async
     * @returns {boolean}
     * @private
     */
    _send: function (url, method, callback, data, async) {
        async = (typeof async !== 'undefined') ? async : true;

        var r = this._makeRequest();

        // XML HTTP Requests - normal way
        if(typeof r.xhr !== 'undefined') {
            this._sendRequestViaXHR(r, url, method, callback, data, async);
        }

        // IE8 & 9 use XDomainRequest
        else if(typeof r.xdr !== 'undefined') {
            this._sendRequestViaXDR(r, url, method, callback, data);
        }

        // No support for CORS
        else {
            console.log("This browser does not support CORS");
            return false;
        }
    },


    /**
     * Make a GET request
     *
     * @param {String} url
     * @param {String} data
     * @param {Function} callback
     * @param {Boolean} sync
     */
    get: function (url, data, callback, sync) {
        if(data) {
            var query = this._encodeURIArray(data);
            if(url.indexOf('?') < 0) {
                url = url + '?';
            }
            else {
                url = url + '&';
            }
            url = url + query.join('&');
        }
        this._send(url, 'GET', callback, null, sync);
    },


    /**
     * Make a POST request
     *
     * @param {String} url
     * @param {String} data
     * @param {Function} callback
     * @param {Boolean} sync
     */
    post: function (url, data, callback, sync) {
        var query = this._encodeURIArray(data);
        this._send(url, 'POST', callback, query.join('&'), sync);
    }
};

module.exports = ajax;
},{}],3:[function(require,module,exports){
/**
 * core.js
 *
 * A bunch of utility methods for working with the DOM and JS objects
 */

'use strict';

var core = {


    /**
     * Cross browser version of addEventListener
     *
     * @param el            {Node}
     * @param eventType     {String}
     * @param cb            {Function}
     * @private
     */
    _addEventListener: function(el, eventType, cb) {
        if(!el || !eventType || typeof cb !== 'function') return;
        if (el.addEventListener) {
            el.addEventListener(eventType, function(event) {
                cb.apply(el, [event]);
            }, false);
        } else if (el.attachEvent)  {
            el.attachEvent('on'+eventType, function(event) {
                cb.apply(el, [event]);
            });
        }
    },


    /**
     * Replace any new line or multiple spaces with a single space
     *
     * @param string {string}
     * @return {string}       
     */
    trimNewLines: function(string) {
      //   /(\r\n|\n|\r)\s{2,}/gm
      return string.replace(/(\r\n|\n|\r)/gm, ' ').replace(/\s{2,}/g,' ');
    },


    /**
     * Combine multiple objects. Mutates the first object.
     *
     * @returns {Object}
     */
    extend: function() {
        for(var i=1; i<arguments.length; i++)
            for(var key in arguments[i])
                if(arguments[i].hasOwnProperty(key))
                    arguments[0][key] = arguments[i][key];
        return arguments[0];
    },


    /**
     * Combine two objects and any sub-properties recursively
     *
     * @param target
     * @param src
     *
     * @returns {boolean|Array|{}}
     */
    extendDeep: function(target, src) {

        if(!src ) return target;

        var that = this;
        var array = Array.isArray(src);
        var dst = array && [] || {};

        if (array) {
            target = target || [];
            dst = dst.concat(target);
            src.forEach(function(e, i) {
                if (typeof dst[i] === 'undefined') {
                    dst[i] = e;
                } else if (typeof e === 'object') {
                    dst[i] = that.extendDeep(target[i], e);
                } else {
                    if (target.indexOf(e) === -1) {
                        dst.push(e);
                    }
                }
            });
        } else {
            if (target && typeof target === 'object') {
                Object.keys(target).forEach(function (key) {
                    dst[key] = target[key];
                })
            }
            Object.keys(src).forEach(function (key) {
                if (typeof src[key] !== 'object' || !src[key]) {
                    dst[key] = src[key];
                }
                else {
                    if (!target[key]) {
                        dst[key] = src[key];
                    } else {
                        dst[key] = that.extendDeep(target[key], src[key]);
                    }
                }
            });
        }

        return dst;
    },


    /**
     * Add an event to an element or an array of elements
     *
     * @param el        {Node|Array}       Element | Array of elements
     * @param eventType {String}           Event Type
     * @param cb        {Function}         Callback
     */
    on: function(el, eventType, cb) {

        var i, j,
            eventTypeList = eventType.split(" ");

        for(i = 0; i < eventTypeList.length; i++) {
            if(Object.prototype.toString.call( el ) === '[object Array]') {
                for(j = 0; j < el.length; j++) {
                    this._addEventListener(el[j], eventTypeList[i], cb);
                }
            }
            else {
                this._addEventListener(el, eventTypeList[i], cb);
            }
        }
    },


    /**
     * Trigger an event on an element
     *
     * @param el
     * @param e
     */
    trigger: function(el, e) {
        if ("createEvent" in document) {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent(e, false, true);
            el.dispatchEvent(evt);
        }
        else
            el.fireEvent("on"+e);
    },


    /**
     * Select a single DOM element
     *
     * @param selector  {String}
     * @param parent    {Node}
     * @returns {Node}
     */
    select: function(selector, parent) {
        var targetNode = parent || document;
        return targetNode.querySelector(selector);
    },


    /**
     * Select a list of DOM elements.
     *
     * @param selector {String}
     * @param parent {Node}
     * @returns {Array}
     */
    selectAll: function(selector, parent) {
        var targetNode = parent || document;
        return [].slice.call(targetNode.querySelectorAll(selector));
    },


    /**
     * Return the text of an element.
     *
     * @param el {Node}
     * @returns {bool | string}
     */
    text: function(el) {
        return (typeof el === 'undefined' || el === null) ? false : el.innerText || el.textContent;
    },


    /**
     * Add a class to an element - browser compatible with old IE
     *
     * @param el
     * @param className
     * @returns {*}
     */
    addClass: function(el, className) {
        if(!el || !className) {
            return false;
        }

        if(el.classList) {
          return el.classList.add(className);
        }

        el.className = el.className + " " + className;
    },


    /**
     * Remove a class
     *
     * @param el
     * @param className
     * @returns {*}
     */
    removeClass: function(el, className) {
        if (!el || !className) {
            return false;
        }

        if(el.classList) {
            return el.classList.remove(className);
        }

        var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)", "g");
        el.className = el.className.replace(regexp, "$2");
    },


    /**
     * Check if an element has a class
     *
     * @param el
     * @param className
     * @returns {boolean}
     */
    hasClass: function(el, className) {
        if (!el || !className) {
            return false;
        }

        if(el.classList) {
            return el.classList.contains(className);
        }

        return !!el.className.match(new RegExp('(\\s|^)'+className+'(\\s|$)'));
    },


    /**
     * Toggle class name
     *
     * @param el
     * @param className
     */
    toggleClass: function(el, className) {
        if(this.hasClass(el, className)) {
            this.removeClass(el, className);
        }
        else {
            this.addClass(el, className);
        }
    },


    /**
     * Validate an email address
     *
     * @param email
     * @returns {boolean}
     */
    validateEmail: function(email) {
        if(!email.match) {
            return false;
        }
        return !!email.match(new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"));
    },
    

    /**
     * Return the selected child node by passing a class, id or node name / currently only supports one class name at a time
     *
     * @param containing element
     * @param element tag reference
     * @returns {element_node / Array}
     */
    children: function(parentNode, requestedChild) {
        var requestedChildNodes = parentNode.childNodes,
            returnData = [];

        // Remove the extra identifiers
        requestedChild = requestedChild.replace('.', '').replace('#', '');

        for (var i = (requestedChildNodes.length - 1), end = 0; i >= end; --i) {
            // Only loop through elements, not text or comment blocks
            if (requestedChildNodes[i].nodeType === 1) {
                // Add any element_nodes to the list
                if (requestedChildNodes[i].nodeName.toLowerCase() === requestedChild ||
                    this.hasClass(requestedChildNodes[i], requestedChild) ||
                    requestedChildNodes[i].getAttribute('id') === requestedChild) {
                    // Create array of matching elements
                    returnData.unshift(requestedChildNodes[i]);
                }
            }
        }

        // If only one element_node found just return, otherwise return array
        return (returnData.length === 1) ? returnData[0] : returnData;
    },


    /**
     * Check if two strings are the same
     *
     * @param string1
     * @param string2
     * @returns {boolean}
     */
    matchStrings: function(string1, string2) {
        return (string1 === string2);
    },


    /**
     * Add classes to <html> to indicate if js is enabled
     */
    detectJs: function() {
        var html = document.getElementsByTagName("html");
        this.removeClass(html[0], 'no-js');
        this.addClass(html[0], 'js');
    },

    insertAfter: function(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
};

module.exports = core;
},{}],4:[function(require,module,exports){
'use strict';

// Get JSON data

// Find the right room

// Sort friends by name

// Add a switch statement to build the message to display

var core = require('./core'),
    ajax = require('./ajax'),

    options = {
        dataUrl: 'json/friends.json',
        friendsMessageEl: document.getElementById('friends-message')
    };

var roomFriends = {

    init: function(userOptions) {
        var self = this,
            roomType = document.getElementById('room').getAttribute('data-room-type');

        ajax.get(options.dataUrl, null, function(data) {
            var parsedData = JSON.parse(data);

            var roomData = self._findRoomData(roomType, parsedData);

            if(roomData.hasOwnProperty('friends') && Array.isArray(roomData.friends)) {
                roomData.friends.sort();
                self._displayFriends(roomData.friends);
            }
            console.log(roomData);
        })
    },


    _findRoomData: function(roomType, data) {
        return (data.hasOwnProperty(roomType)) ? data[roomType] : false;
    },


    _displayFriends: function(friends) {
        var message;
        switch (friends.length) {
            case 0:
                break;
            case 1:
                message = friends[0] + " has stayed here";
                break;
            case 2:
                message = friends[0] + " and " + friends[1] + " have stayed here";
                break;
            case 3:
                message = friends[0] + " and " + friends[1] + " and 1 other friend have stayed here";
                break;
            default:
                message = friends[0] + " and " + friends[1] + " and " + (friends.length - 2) + " other friends have stayed here";
                break;
        }
        options.friendsMessageEl.innerText = message;
    }
};

module.exports = roomFriends;
},{"./ajax":2,"./core":3}]},{},[1,2,3,4])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9tYWluLmpzIiwianMvbW9kdWxlcy9hamF4LmpzIiwianMvbW9kdWxlcy9jb3JlLmpzIiwianMvbW9kdWxlcy9yb29tRnJpZW5kcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIHJvb21GcmllbmRzID0gcmVxdWlyZSgnLi9tb2R1bGVzL3Jvb21GcmllbmRzJyk7XG5cbnJvb21GcmllbmRzLmluaXQoKTtcbiIsIi8qKlxuICogYWpheC5qc1xuICpcbiAqIFNpbXBsZSBBSkFYIEFQSSBzaW1pbGFyIHRvIGpRdWVyeVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGFqYXggPSB7XG5cbiAgICAvKipcbiAgICAgKiBVUkkgRW5jb2RlIGV2ZXJ5IGtleSA9PiB2YWx1ZSBpdGVtIGluIGFuIGFycmF5IGFzIGEgcXVlcnkgcGFyYW1ldGVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBkYXRhXG4gICAgICogQHJldHVybnMge0FycmF5fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2VuY29kZVVSSUFycmF5OiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICB2YXIgZUFyciA9IFtdO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xuICAgICAgICAgICAgZUFyci5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGRhdGFba2V5XSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlQXJyO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBlaXRoZXIgYW4gWE1MSHR0cFJlcXVlc3Qgb3IgWERvbWFpblJlcXVlc3Qgb2JqZWN0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX21ha2VSZXF1ZXN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByID0ge307XG4gICAgICAgIGlmICh0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICBpZignd2l0aENyZWRlbnRpYWxzJyBpbiB4aHIpIHtcbiAgICAgICAgICAgICAgICByLnhociA9IHhocjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElFOCAmJiA5XG4gICAgICAgICAgICBlbHNlIGlmKHR5cGVvZiBYRG9tYWluUmVxdWVzdCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIHIueGRyID0gbmV3IFhEb21haW5SZXF1ZXN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHI7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogU2VuZCBhIHJlcXVlc3QgdmlhIFhIUiBvYmplY3RcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSByXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBhc3luY1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NlbmRSZXF1ZXN0VmlhWEhSOiBmdW5jdGlvbihyLCB1cmwsIG1ldGhvZCwgY2FsbGJhY2ssIGRhdGEsIGFzeW5jKSB7XG4gICAgICAgIHIueGhyLm9wZW4obWV0aG9kLCB1cmwsIGFzeW5jKTtcbiAgICAgICAgci54aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHIueGhyLnJlYWR5U3RhdGUgPT0gNCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHIueGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGlmIChtZXRob2QgPT0gJ1BPU1QnKSB7XG4gICAgICAgICAgICByLnhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgci54aHIuc2VuZCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZW5kIGEgcmVxdWVzdCB2aWEgWERSIG9iamVjdFxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGRhdGFcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZW5kUmVxdWVzdFZpYVhEUjogZnVuY3Rpb24ociwgdXJsLCBtZXRob2QsIGNhbGxiYWNrLCBkYXRhKSB7XG4gICAgICAgIHIueGRyLm9wZW4obWV0aG9kLCB1cmwpO1xuICAgICAgICByLnhkci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHIueGRyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH07XG4gICAgICAgIHIueGRyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVxdWVzdCByZXR1cm5lZCBhbiBlcnJvcjogXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coci54ZHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgfTtcbiAgICAgICAgci54ZHIudGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZXF1ZXN0IHRpbWVkIG91dFwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgci54ZHIub25wcm9ncmVzcyA9IGZ1bmN0aW9uKCkge307XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHIueGRyLnNlbmQoZGF0YSk7XG4gICAgICAgIH0sIDApO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFNlbmQgYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZGF0YVxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gYXN5bmNcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZW5kOiBmdW5jdGlvbiAodXJsLCBtZXRob2QsIGNhbGxiYWNrLCBkYXRhLCBhc3luYykge1xuICAgICAgICBhc3luYyA9ICh0eXBlb2YgYXN5bmMgIT09ICd1bmRlZmluZWQnKSA/IGFzeW5jIDogdHJ1ZTtcblxuICAgICAgICB2YXIgciA9IHRoaXMuX21ha2VSZXF1ZXN0KCk7XG5cbiAgICAgICAgLy8gWE1MIEhUVFAgUmVxdWVzdHMgLSBub3JtYWwgd2F5XG4gICAgICAgIGlmKHR5cGVvZiByLnhociAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRoaXMuX3NlbmRSZXF1ZXN0VmlhWEhSKHIsIHVybCwgbWV0aG9kLCBjYWxsYmFjaywgZGF0YSwgYXN5bmMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSUU4ICYgOSB1c2UgWERvbWFpblJlcXVlc3RcbiAgICAgICAgZWxzZSBpZih0eXBlb2Ygci54ZHIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aGlzLl9zZW5kUmVxdWVzdFZpYVhEUihyLCB1cmwsIG1ldGhvZCwgY2FsbGJhY2ssIGRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm8gc3VwcG9ydCBmb3IgQ09SU1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGhpcyBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgQ09SU1wiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIE1ha2UgYSBHRVQgcmVxdWVzdFxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IHN5bmNcbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uICh1cmwsIGRhdGEsIGNhbGxiYWNrLCBzeW5jKSB7XG4gICAgICAgIGlmKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBxdWVyeSA9IHRoaXMuX2VuY29kZVVSSUFycmF5KGRhdGEpO1xuICAgICAgICAgICAgaWYodXJsLmluZGV4T2YoJz8nKSA8IDApIHtcbiAgICAgICAgICAgICAgICB1cmwgPSB1cmwgKyAnPyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB1cmwgPSB1cmwgKyAnJic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1cmwgPSB1cmwgKyBxdWVyeS5qb2luKCcmJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2VuZCh1cmwsICdHRVQnLCBjYWxsYmFjaywgbnVsbCwgc3luYyk7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogTWFrZSBhIFBPU1QgcmVxdWVzdFxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IHN5bmNcbiAgICAgKi9cbiAgICBwb3N0OiBmdW5jdGlvbiAodXJsLCBkYXRhLCBjYWxsYmFjaywgc3luYykge1xuICAgICAgICB2YXIgcXVlcnkgPSB0aGlzLl9lbmNvZGVVUklBcnJheShkYXRhKTtcbiAgICAgICAgdGhpcy5fc2VuZCh1cmwsICdQT1NUJywgY2FsbGJhY2ssIHF1ZXJ5LmpvaW4oJyYnKSwgc3luYyk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBhamF4OyIsIi8qKlxuICogY29yZS5qc1xuICpcbiAqIEEgYnVuY2ggb2YgdXRpbGl0eSBtZXRob2RzIGZvciB3b3JraW5nIHdpdGggdGhlIERPTSBhbmQgSlMgb2JqZWN0c1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNvcmUgPSB7XG5cblxuICAgIC8qKlxuICAgICAqIENyb3NzIGJyb3dzZXIgdmVyc2lvbiBvZiBhZGRFdmVudExpc3RlbmVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWwgICAgICAgICAgICB7Tm9kZX1cbiAgICAgKiBAcGFyYW0gZXZlbnRUeXBlICAgICB7U3RyaW5nfVxuICAgICAqIEBwYXJhbSBjYiAgICAgICAgICAgIHtGdW5jdGlvbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRFdmVudExpc3RlbmVyOiBmdW5jdGlvbihlbCwgZXZlbnRUeXBlLCBjYikge1xuICAgICAgICBpZighZWwgfHwgIWV2ZW50VHlwZSB8fCB0eXBlb2YgY2IgIT09ICdmdW5jdGlvbicpIHJldHVybjtcbiAgICAgICAgaWYgKGVsLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGNiLmFwcGx5KGVsLCBbZXZlbnRdKTtcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChlbC5hdHRhY2hFdmVudCkgIHtcbiAgICAgICAgICAgIGVsLmF0dGFjaEV2ZW50KCdvbicrZXZlbnRUeXBlLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGNiLmFwcGx5KGVsLCBbZXZlbnRdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogUmVwbGFjZSBhbnkgbmV3IGxpbmUgb3IgbXVsdGlwbGUgc3BhY2VzIHdpdGggYSBzaW5nbGUgc3BhY2VcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzdHJpbmcge3N0cmluZ31cbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9ICAgICAgIFxuICAgICAqL1xuICAgIHRyaW1OZXdMaW5lczogZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICAvLyAgIC8oXFxyXFxufFxcbnxcXHIpXFxzezIsfS9nbVxuICAgICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC8oXFxyXFxufFxcbnxcXHIpL2dtLCAnICcpLnJlcGxhY2UoL1xcc3syLH0vZywnICcpO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIENvbWJpbmUgbXVsdGlwbGUgb2JqZWN0cy4gTXV0YXRlcyB0aGUgZmlyc3Qgb2JqZWN0LlxuICAgICAqXG4gICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAgKi9cbiAgICBleHRlbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBmb3IodmFyIGk9MTsgaTxhcmd1bWVudHMubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICBmb3IodmFyIGtleSBpbiBhcmd1bWVudHNbaV0pXG4gICAgICAgICAgICAgICAgaWYoYXJndW1lbnRzW2ldLmhhc093blByb3BlcnR5KGtleSkpXG4gICAgICAgICAgICAgICAgICAgIGFyZ3VtZW50c1swXVtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XG4gICAgICAgIHJldHVybiBhcmd1bWVudHNbMF07XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogQ29tYmluZSB0d28gb2JqZWN0cyBhbmQgYW55IHN1Yi1wcm9wZXJ0aWVzIHJlY3Vyc2l2ZWx5XG4gICAgICpcbiAgICAgKiBAcGFyYW0gdGFyZ2V0XG4gICAgICogQHBhcmFtIHNyY1xuICAgICAqXG4gICAgICogQHJldHVybnMge2Jvb2xlYW58QXJyYXl8e319XG4gICAgICovXG4gICAgZXh0ZW5kRGVlcDogZnVuY3Rpb24odGFyZ2V0LCBzcmMpIHtcblxuICAgICAgICBpZighc3JjICkgcmV0dXJuIHRhcmdldDtcblxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHZhciBhcnJheSA9IEFycmF5LmlzQXJyYXkoc3JjKTtcbiAgICAgICAgdmFyIGRzdCA9IGFycmF5ICYmIFtdIHx8IHt9O1xuXG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0IHx8IFtdO1xuICAgICAgICAgICAgZHN0ID0gZHN0LmNvbmNhdCh0YXJnZXQpO1xuICAgICAgICAgICAgc3JjLmZvckVhY2goZnVuY3Rpb24oZSwgaSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZHN0W2ldID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICBkc3RbaV0gPSBlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGRzdFtpXSA9IHRoYXQuZXh0ZW5kRGVlcCh0YXJnZXRbaV0sIGUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXQuaW5kZXhPZihlKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRzdC5wdXNoKGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGFyZ2V0ICYmIHR5cGVvZiB0YXJnZXQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXModGFyZ2V0KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgZHN0W2tleV0gPSB0YXJnZXRba2V5XTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgT2JqZWN0LmtleXMoc3JjKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHNyY1trZXldICE9PSAnb2JqZWN0JyB8fCAhc3JjW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgZHN0W2tleV0gPSBzcmNba2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGFyZ2V0W2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRzdFtrZXldID0gc3JjW2tleV07XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkc3Rba2V5XSA9IHRoYXQuZXh0ZW5kRGVlcCh0YXJnZXRba2V5XSwgc3JjW2tleV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZHN0O1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIEFkZCBhbiBldmVudCB0byBhbiBlbGVtZW50IG9yIGFuIGFycmF5IG9mIGVsZW1lbnRzXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWwgICAgICAgIHtOb2RlfEFycmF5fSAgICAgICBFbGVtZW50IHwgQXJyYXkgb2YgZWxlbWVudHNcbiAgICAgKiBAcGFyYW0gZXZlbnRUeXBlIHtTdHJpbmd9ICAgICAgICAgICBFdmVudCBUeXBlXG4gICAgICogQHBhcmFtIGNiICAgICAgICB7RnVuY3Rpb259ICAgICAgICAgQ2FsbGJhY2tcbiAgICAgKi9cbiAgICBvbjogZnVuY3Rpb24oZWwsIGV2ZW50VHlwZSwgY2IpIHtcblxuICAgICAgICB2YXIgaSwgaixcbiAgICAgICAgICAgIGV2ZW50VHlwZUxpc3QgPSBldmVudFR5cGUuc3BsaXQoXCIgXCIpO1xuXG4gICAgICAgIGZvcihpID0gMDsgaSA8IGV2ZW50VHlwZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCggZWwgKSA9PT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgICAgICAgICAgICAgIGZvcihqID0gMDsgaiA8IGVsLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZEV2ZW50TGlzdGVuZXIoZWxbal0sIGV2ZW50VHlwZUxpc3RbaV0sIGNiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRFdmVudExpc3RlbmVyKGVsLCBldmVudFR5cGVMaXN0W2ldLCBjYik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBUcmlnZ2VyIGFuIGV2ZW50IG9uIGFuIGVsZW1lbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbFxuICAgICAqIEBwYXJhbSBlXG4gICAgICovXG4gICAgdHJpZ2dlcjogZnVuY3Rpb24oZWwsIGUpIHtcbiAgICAgICAgaWYgKFwiY3JlYXRlRXZlbnRcIiBpbiBkb2N1bWVudCkge1xuICAgICAgICAgICAgdmFyIGV2dCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiSFRNTEV2ZW50c1wiKTtcbiAgICAgICAgICAgIGV2dC5pbml0RXZlbnQoZSwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgICAgZWwuZGlzcGF0Y2hFdmVudChldnQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVsLmZpcmVFdmVudChcIm9uXCIrZSk7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogU2VsZWN0IGEgc2luZ2xlIERPTSBlbGVtZW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3IgIHtTdHJpbmd9XG4gICAgICogQHBhcmFtIHBhcmVudCAgICB7Tm9kZX1cbiAgICAgKiBAcmV0dXJucyB7Tm9kZX1cbiAgICAgKi9cbiAgICBzZWxlY3Q6IGZ1bmN0aW9uKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgICAgICAgdmFyIHRhcmdldE5vZGUgPSBwYXJlbnQgfHwgZG9jdW1lbnQ7XG4gICAgICAgIHJldHVybiB0YXJnZXROb2RlLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFNlbGVjdCBhIGxpc3Qgb2YgRE9NIGVsZW1lbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHNlbGVjdG9yIHtTdHJpbmd9XG4gICAgICogQHBhcmFtIHBhcmVudCB7Tm9kZX1cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAgICovXG4gICAgc2VsZWN0QWxsOiBmdW5jdGlvbihzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICAgIHZhciB0YXJnZXROb2RlID0gcGFyZW50IHx8IGRvY3VtZW50O1xuICAgICAgICByZXR1cm4gW10uc2xpY2UuY2FsbCh0YXJnZXROb2RlLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIHRleHQgb2YgYW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbCB7Tm9kZX1cbiAgICAgKiBAcmV0dXJucyB7Ym9vbCB8IHN0cmluZ31cbiAgICAgKi9cbiAgICB0ZXh0OiBmdW5jdGlvbihlbCkge1xuICAgICAgICByZXR1cm4gKHR5cGVvZiBlbCA9PT0gJ3VuZGVmaW5lZCcgfHwgZWwgPT09IG51bGwpID8gZmFsc2UgOiBlbC5pbm5lclRleHQgfHwgZWwudGV4dENvbnRlbnQ7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgY2xhc3MgdG8gYW4gZWxlbWVudCAtIGJyb3dzZXIgY29tcGF0aWJsZSB3aXRoIG9sZCBJRVxuICAgICAqXG4gICAgICogQHBhcmFtIGVsXG4gICAgICogQHBhcmFtIGNsYXNzTmFtZVxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIGFkZENsYXNzOiBmdW5jdGlvbihlbCwgY2xhc3NOYW1lKSB7XG4gICAgICAgIGlmKCFlbCB8fCAhY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZihlbC5jbGFzc0xpc3QpIHtcbiAgICAgICAgICByZXR1cm4gZWwuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lICsgXCIgXCIgKyBjbGFzc05hbWU7XG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGEgY2xhc3NcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbFxuICAgICAqIEBwYXJhbSBjbGFzc05hbWVcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICByZW1vdmVDbGFzczogZnVuY3Rpb24oZWwsIGNsYXNzTmFtZSkge1xuICAgICAgICBpZiAoIWVsIHx8ICFjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGVsLmNsYXNzTGlzdCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZWdleHAgPSBuZXcgUmVnRXhwKFwiKF58XFxcXHMpXCIgKyBjbGFzc05hbWUgKyBcIihcXFxcc3wkKVwiLCBcImdcIik7XG4gICAgICAgIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5yZXBsYWNlKHJlZ2V4cCwgXCIkMlwiKTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhbiBlbGVtZW50IGhhcyBhIGNsYXNzXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxcbiAgICAgKiBAcGFyYW0gY2xhc3NOYW1lXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaGFzQ2xhc3M6IGZ1bmN0aW9uKGVsLCBjbGFzc05hbWUpIHtcbiAgICAgICAgaWYgKCFlbCB8fCAhY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZihlbC5jbGFzc0xpc3QpIHtcbiAgICAgICAgICAgIHJldHVybiBlbC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhIWVsLmNsYXNzTmFtZS5tYXRjaChuZXcgUmVnRXhwKCcoXFxcXHN8XiknK2NsYXNzTmFtZSsnKFxcXFxzfCQpJykpO1xuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBjbGFzcyBuYW1lXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxcbiAgICAgKiBAcGFyYW0gY2xhc3NOYW1lXG4gICAgICovXG4gICAgdG9nZ2xlQ2xhc3M6IGZ1bmN0aW9uKGVsLCBjbGFzc05hbWUpIHtcbiAgICAgICAgaWYodGhpcy5oYXNDbGFzcyhlbCwgY2xhc3NOYW1lKSkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyhlbCwgY2xhc3NOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2xhc3MoZWwsIGNsYXNzTmFtZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBWYWxpZGF0ZSBhbiBlbWFpbCBhZGRyZXNzXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZW1haWxcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB2YWxpZGF0ZUVtYWlsOiBmdW5jdGlvbihlbWFpbCkge1xuICAgICAgICBpZighZW1haWwubWF0Y2gpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gISFlbWFpbC5tYXRjaChuZXcgUmVnRXhwKFwiW2EtejAtOSEjJCUmJyorLz0/Xl9ge3x9fi1dKyg/OlxcLlthLXowLTkhIyQlJicqKy89P15fYHt8fX4tXSspKkAoPzpbYS16MC05XSg/OlthLXowLTktXSpbYS16MC05XSk/XFwuKStbYS16MC05XSg/OlthLXowLTktXSpbYS16MC05XSk/XCIpKTtcbiAgICB9LFxuICAgIFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBzZWxlY3RlZCBjaGlsZCBub2RlIGJ5IHBhc3NpbmcgYSBjbGFzcywgaWQgb3Igbm9kZSBuYW1lIC8gY3VycmVudGx5IG9ubHkgc3VwcG9ydHMgb25lIGNsYXNzIG5hbWUgYXQgYSB0aW1lXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY29udGFpbmluZyBlbGVtZW50XG4gICAgICogQHBhcmFtIGVsZW1lbnQgdGFnIHJlZmVyZW5jZVxuICAgICAqIEByZXR1cm5zIHtlbGVtZW50X25vZGUgLyBBcnJheX1cbiAgICAgKi9cbiAgICBjaGlsZHJlbjogZnVuY3Rpb24ocGFyZW50Tm9kZSwgcmVxdWVzdGVkQ2hpbGQpIHtcbiAgICAgICAgdmFyIHJlcXVlc3RlZENoaWxkTm9kZXMgPSBwYXJlbnROb2RlLmNoaWxkTm9kZXMsXG4gICAgICAgICAgICByZXR1cm5EYXRhID0gW107XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBleHRyYSBpZGVudGlmaWVyc1xuICAgICAgICByZXF1ZXN0ZWRDaGlsZCA9IHJlcXVlc3RlZENoaWxkLnJlcGxhY2UoJy4nLCAnJykucmVwbGFjZSgnIycsICcnKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gKHJlcXVlc3RlZENoaWxkTm9kZXMubGVuZ3RoIC0gMSksIGVuZCA9IDA7IGkgPj0gZW5kOyAtLWkpIHtcbiAgICAgICAgICAgIC8vIE9ubHkgbG9vcCB0aHJvdWdoIGVsZW1lbnRzLCBub3QgdGV4dCBvciBjb21tZW50IGJsb2Nrc1xuICAgICAgICAgICAgaWYgKHJlcXVlc3RlZENoaWxkTm9kZXNbaV0ubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAvLyBBZGQgYW55IGVsZW1lbnRfbm9kZXMgdG8gdGhlIGxpc3RcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdGVkQ2hpbGROb2Rlc1tpXS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSByZXF1ZXN0ZWRDaGlsZCB8fFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhc0NsYXNzKHJlcXVlc3RlZENoaWxkTm9kZXNbaV0sIHJlcXVlc3RlZENoaWxkKSB8fFxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ZWRDaGlsZE5vZGVzW2ldLmdldEF0dHJpYnV0ZSgnaWQnKSA9PT0gcmVxdWVzdGVkQ2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGFycmF5IG9mIG1hdGNoaW5nIGVsZW1lbnRzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybkRhdGEudW5zaGlmdChyZXF1ZXN0ZWRDaGlsZE5vZGVzW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBvbmx5IG9uZSBlbGVtZW50X25vZGUgZm91bmQganVzdCByZXR1cm4sIG90aGVyd2lzZSByZXR1cm4gYXJyYXlcbiAgICAgICAgcmV0dXJuIChyZXR1cm5EYXRhLmxlbmd0aCA9PT0gMSkgPyByZXR1cm5EYXRhWzBdIDogcmV0dXJuRGF0YTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0d28gc3RyaW5ncyBhcmUgdGhlIHNhbWVcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzdHJpbmcxXG4gICAgICogQHBhcmFtIHN0cmluZzJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBtYXRjaFN0cmluZ3M6IGZ1bmN0aW9uKHN0cmluZzEsIHN0cmluZzIpIHtcbiAgICAgICAgcmV0dXJuIChzdHJpbmcxID09PSBzdHJpbmcyKTtcbiAgICB9LFxuXG5cbiAgICAvKipcbiAgICAgKiBBZGQgY2xhc3NlcyB0byA8aHRtbD4gdG8gaW5kaWNhdGUgaWYganMgaXMgZW5hYmxlZFxuICAgICAqL1xuICAgIGRldGVjdEpzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGh0bWwgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImh0bWxcIik7XG4gICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoaHRtbFswXSwgJ25vLWpzJyk7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3MoaHRtbFswXSwgJ2pzJyk7XG4gICAgfSxcblxuICAgIGluc2VydEFmdGVyOiBmdW5jdGlvbihuZXdOb2RlLCByZWZlcmVuY2VOb2RlKSB7XG4gICAgICAgIHJlZmVyZW5jZU5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobmV3Tm9kZSwgcmVmZXJlbmNlTm9kZS5uZXh0U2libGluZyk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb3JlOyIsIid1c2Ugc3RyaWN0JztcblxuLy8gR2V0IEpTT04gZGF0YVxuXG4vLyBGaW5kIHRoZSByaWdodCByb29tXG5cbi8vIFNvcnQgZnJpZW5kcyBieSBuYW1lXG5cbi8vIEFkZCBhIHN3aXRjaCBzdGF0ZW1lbnQgdG8gYnVpbGQgdGhlIG1lc3NhZ2UgdG8gZGlzcGxheVxuXG52YXIgY29yZSA9IHJlcXVpcmUoJy4vY29yZScpLFxuICAgIGFqYXggPSByZXF1aXJlKCcuL2FqYXgnKSxcblxuICAgIG9wdGlvbnMgPSB7XG4gICAgICAgIGRhdGFVcmw6ICdqc29uL2ZyaWVuZHMuanNvbicsXG4gICAgICAgIGZyaWVuZHNNZXNzYWdlRWw6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmcmllbmRzLW1lc3NhZ2UnKVxuICAgIH07XG5cbnZhciByb29tRnJpZW5kcyA9IHtcblxuICAgIGluaXQ6IGZ1bmN0aW9uKHVzZXJPcHRpb25zKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIHJvb21UeXBlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb20nKS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcm9vbS10eXBlJyk7XG5cbiAgICAgICAgYWpheC5nZXQob3B0aW9ucy5kYXRhVXJsLCBudWxsLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB2YXIgcGFyc2VkRGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XG5cbiAgICAgICAgICAgIHZhciByb29tRGF0YSA9IHNlbGYuX2ZpbmRSb29tRGF0YShyb29tVHlwZSwgcGFyc2VkRGF0YSk7XG5cbiAgICAgICAgICAgIGlmKHJvb21EYXRhLmhhc093blByb3BlcnR5KCdmcmllbmRzJykgJiYgQXJyYXkuaXNBcnJheShyb29tRGF0YS5mcmllbmRzKSkge1xuICAgICAgICAgICAgICAgIHJvb21EYXRhLmZyaWVuZHMuc29ydCgpO1xuICAgICAgICAgICAgICAgIHNlbGYuX2Rpc3BsYXlGcmllbmRzKHJvb21EYXRhLmZyaWVuZHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2cocm9vbURhdGEpO1xuICAgICAgICB9KVxuICAgIH0sXG5cblxuICAgIF9maW5kUm9vbURhdGE6IGZ1bmN0aW9uKHJvb21UeXBlLCBkYXRhKSB7XG4gICAgICAgIHJldHVybiAoZGF0YS5oYXNPd25Qcm9wZXJ0eShyb29tVHlwZSkpID8gZGF0YVtyb29tVHlwZV0gOiBmYWxzZTtcbiAgICB9LFxuXG5cbiAgICBfZGlzcGxheUZyaWVuZHM6IGZ1bmN0aW9uKGZyaWVuZHMpIHtcbiAgICAgICAgdmFyIG1lc3NhZ2U7XG4gICAgICAgIHN3aXRjaCAoZnJpZW5kcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gZnJpZW5kc1swXSArIFwiIGhhcyBzdGF5ZWQgaGVyZVwiO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBmcmllbmRzWzBdICsgXCIgYW5kIFwiICsgZnJpZW5kc1sxXSArIFwiIGhhdmUgc3RheWVkIGhlcmVcIjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gZnJpZW5kc1swXSArIFwiIGFuZCBcIiArIGZyaWVuZHNbMV0gKyBcIiBhbmQgMSBvdGhlciBmcmllbmQgaGF2ZSBzdGF5ZWQgaGVyZVwiO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gZnJpZW5kc1swXSArIFwiIGFuZCBcIiArIGZyaWVuZHNbMV0gKyBcIiBhbmQgXCIgKyAoZnJpZW5kcy5sZW5ndGggLSAyKSArIFwiIG90aGVyIGZyaWVuZHMgaGF2ZSBzdGF5ZWQgaGVyZVwiO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMuZnJpZW5kc01lc3NhZ2VFbC5pbm5lclRleHQgPSBtZXNzYWdlO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcm9vbUZyaWVuZHM7Il19
