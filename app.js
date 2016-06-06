"use strict";

var http = require('http.min');
var WebSocket = require('ws');
var jsonPath = require('jsonpath-plus');

var scenes = [];
var groups = [];

function init() {
	Homey.log("Constellation (dev) is running!");
}

function getBridge() {
    return http.json('https://www.meethue.com/api/nupnp').then(function (result) {
        
        if (typeof result[0].id !== 'undefined') {
            
            if (typeof Homey.manager('settings').get( 'bridge_token_'+result[0].id ) !== 'undefined') {
                return Homey.manager('settings').get( 'bridge_token_'+result[0].id );
            }
        }
        return Homey.manager('settings').get( 'constellation-bridge-key' );
    });
}

//Get available scenes from the bridge
function getScenes(callback) {
    var ipaddress = Homey.manager('settings').get( 'constellation-bridge-ip' );
    
    getBridge().then( function(key) {
        return http.json('http://'+ipaddress+'/api/'+key+'/scenes')
    }).then(function (result) {
        scenes = [];

        for (var entry in result) {
            //Returned name contains things we do not want in the id
            var sceneid = entry;

            scenes.push(
                {
                    icon: "",
                    name: result[entry].name,
                    description: "",
                    scene: sceneid
                }
            );
        }
        
        callback(null, scenes);
    });
}

//Get available scenes from the bridge
function getGroups(callback) {
    var ipaddress = Homey.manager('settings').get( 'constellation-bridge-ip' );
    
    getBridge().then( function(key) {
        return http.json('http://'+ipaddress+'/api/'+key+'/groups')
    }).then(function (result) {
        groups = [];

        for (var entry in result) {
            //Returned name contains things we do not want in the id
            var groupid = entry;

            groups.push(
                {
                    icon: "",
                    name: result[entry].name,
                    description: "",
                    group: groupid
                }
            );
        }
        
        callback(null, groups);
    });
}

function action(request, args, callback) {
    var ipaddress = Homey.manager('settings').get( 'constellation-bridge-ip' );
    
    getBridge().then( function(key) {
        if (typeof args.group == 'undefined') {
            return http.put('http://'+ipaddress+'/api/'+key+'/groups/0/action', args)
        }
        else {
            return http.put('http://'+ipaddress+'/api/'+key+'/groups/'+args.group+'/action', args)
        }
    }).then( function(result) {
        callback( null, true ); // we've fired successfully
    }).catch(function (error) {
        callback(error, false)
    });
}

//Turn on a scene
Homey.manager('flow').on('action.activate_hue_scene', function( callback, args ){
    action("put", {"scene": args.scene.scene}, function() {
        callback( null, true );
    });
});

//Turn off a scene
Homey.manager('flow').on('action.deactivate_hue_scene', function( callback, args ){
    action("put", {"on": false}, function() {
        callback( null, true );
    });
});

//Enable colorloop
Homey.manager('flow').on('action.enable_color_loop', function( callback, args ){
    action("put", {"on": true, "effect": "colorloop", "group": args.group.group}, function() {
        callback( null, true );
    });
});

//Disable colorloop
Homey.manager('flow').on('action.disable_color_loop', function( callback, args ){
    action("put", {"effect": "none", "group": args.group.group}, function() {
        callback( null, true );
    });
});

//Activate groups
Homey.manager('flow').on('action.enable_group', function( callback, args ){
    action("put", {"on": true, "group": args.group.group, "transitiontime": (10 * args.time), "bri": (args.brightness * 2.5)}, function() {
        callback( null, true );
    });
});

//Disable groups
Homey.manager('flow').on('action.disable_group', function( callback, args ){
    action("put", {"on": false, "group": args.group.group, "transitiontime": (10 * args.time), "bri": 0}, function() {
        callback( null, true );
    });
});

//Alert
Homey.manager('flow').on('action.blink_once', function( callback, args ){
    action("put", {"alert": "select", "group": args.group.group}, function() {
        callback( null, true );
    });
});

//Alert
Homey.manager('flow').on('action.blink_multiple', function( callback, args ){
    action("put", {"alert": "lselect", "group": args.group.group}, function() {
        callback( null, true );
    });
});

//-----------------------------
//Get the scenes
Homey.manager('flow').on('action.activate_hue_scene.scene.autocomplete', function( callback, args ){
    getScenes(function() {
        Homey.log("getScenes() called");
        callback( null, scenes ); // err, results  
    });
});

Homey.manager('flow').on('action.deactivate_hue_scene.scene.autocomplete', function( callback, args ){
    getScenes(function() {
        callback( null, scenes ); // err, results  
    });
});

//-----------------------------
//Get the groups for colorloop
Homey.manager('flow').on('action.enable_color_loop.group.autocomplete', function( callback, args ){
    getGroups(function() {
        callback( null, groups ); // err, results  
    });
});

Homey.manager('flow').on('action.disable_color_loop.group.autocomplete', function( callback, args ){
    getGroups(function() {
        callback( null, groups ); // err, results  
    });
});

//-----------------------------
//Get the groups for activating groups
Homey.manager('flow').on('action.enable_group.group.autocomplete', function( callback, args ){
    getGroups(function() {
        callback( null, groups ); // err, results  
    });
});

Homey.manager('flow').on('action.disable_group.group.autocomplete', function( callback, args ){
    getGroups(function() {
        callback( null, groups ); // err, results  
    });
});

//-----------------------------
//Get the groups for blink
Homey.manager('flow').on('action.blink_once.group.autocomplete', function( callback, args ){
    getGroups(function() {
        callback( null, groups ); // err, results  
    });
});

Homey.manager('flow').on('action.blink_multiple.group.autocomplete', function( callback, args ){
    getGroups(function() {
        callback( null, groups ); // err, results  
    });
});

module.exports.init = init;