/**
@author: Amol Kapoor
@date: 7-7-15
@version: 0.1

Global config location for all multi-file-wide files (client side)
*/

//Connection to Backend
var socket = io('http://54.86.173.127:6010');

//the logged in user's facebook id 
var global_ID = "";

//a list of friends who also use the app
var global_friendsList = [];

//The user name for the current user
var global_name = "";
