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