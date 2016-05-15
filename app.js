"use strict";

var http = require('http.min');
var WebSocket = require('ws');
var jsonPath = require('jsonpath-plus');

var scenes = [];

function init() {
	Homey.log("Constellation (dev) is running!");
}

//Get available scenes from the bridge
function getScenes(callback) {
    
    var key = Homey.manager('settings').get( 'constellation-bridge-key' );
    var ipaddress = Homey.manager('settings').get( 'constellation-bridge-ip' );
    
    http.json('http://'+ipaddress+'/api/'+key+'/scenes').then(function (result) {
        
        scenes = [];

        for (var entry in result) {
            //Returned name contains things we do not want in the id
            var sceneid = entry.split("-")[0];
            
            scenes.push(
                {
                    icon: "",
                    name: result[entry].name,
                    description: "",
                    scene: sceneid
                }
            );
        };
    }).then(function () {
        callback( null, scenes ); // err, results  
    });
}

function action(request, args, callback) {
    var key = Homey.manager('settings').get( 'constellation-bridge-key' );
    var ipaddress = Homey.manager('settings').get( 'constellation-bridge-ip' );
    
    Homey.log(ipaddress);
    
    http.put('http://'+ipaddress+'/api/'+key+'/groups/0/action', args).then( function(result) {
        callback( null, true ); // we've fired successfully
    }).catch(function (error) {
        callback(error, false)
    });
}

//Turn on a scene
Homey.manager('flow').on('action.activate_hue_scene', function( callback, args ){
    action("put", {"on": true, "scene": args.scene.scene}, function() {
        callback( null, true );
    });
});

//Turn off a scene
Homey.manager('flow').on('action.deactivate_hue_scene', function( callback, args ){
    action("put", {"on": false, "scene": args.scene.scene}, function() {
        callback( null, true );
    });
});

Homey.manager('flow').on('action.activate_hue_scene.scene.autocomplete', function( callback, args ){
    getScenes(function() {
        callback( null, scenes ); // err, results  
    });
});

Homey.manager('flow').on('action.deactivate_hue_scene.scene.autocomplete', function( callback, args ){
        getScenes(function() {
        callback( null, scenes ); // err, results  
    });
});

module.exports.init = init;