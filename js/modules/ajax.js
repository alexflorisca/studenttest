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