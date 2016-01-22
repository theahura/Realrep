/**
	@author: Amol Kapoor
	@date: 8-15-15
	@version: 0.1

	Description: Monitor that hooks into node socket and sends an alert the moment the socket dies
*/


var nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({
	service: 'gmail',
    auth: {
        user: 'diagraphicservermoniter@gmail.com',
        pass: 'diagraphictech'
    }
});

var io = require('socket.io/node_modules/socket.io-client');

var socket = io('http://52.90.127.98:6010')

socket.on('connect', function () { console.log("socket connected"); });
socket.on('disconnect', function() { 

	console.log("SERVER DOWN")

	var subject = "RealRep server is down";
	var message = "RealRep server went down at " + new Date().toISOString();

	transporter.sendMail({
	    from: 'diagraphicservermoniter@gmail.com',
	    to: 'theahura@gmail.com',
	    subject: subject,
	    text: message
	});
});

