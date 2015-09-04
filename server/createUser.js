// dependencies
var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';
var userTable = new AWS.DynamoDB({params: {TableName: 'JAGUsers'}});

var bcrypt = require('bcrypt');

var loginTools = require('./loginTools');

dataObj = {};

var username = "Ganesh"
var password = "password";
var userKey = bcrypt.hashSync(password, 10);

loginTools.regNewUser(userTable, username, userKey);