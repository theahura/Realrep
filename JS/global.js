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


//Base association list
var global_PositiveAssociations = ['Amazing', 'Amenable', 'Badass', 'BestFriend', 'Brilliant', 'Happy', 'Cool', 'DressesWell', 'Fiend', 'Chill',
								   'Creative', 'Adventurous', 'Ambitious', 'Brave', 'Charming', 'Gentlemanly', 'Witty', 'Hilarious', 'Funny', 'NotADick',
								   'WouldDate', 'CanHang', 'PartyAnimal', 'Social', 'Calculating', 'TechWhiz', 'SweeterThanPie', 'Quiet', 'GoodListener', 'ReadsForFun',
								   'WillTakeOverTheWorld', 'Awesome', 'DogPerson', 'CatPerson', 'Leader', 'VIP', 'CanCook', 'Cuddly', 'NotStupid', 'Hacker'];

var global_NegativeAssociations = ['AnnoyingVoice', 'Strange', 'Lazy', 'KindaDumb', 'Rude', 'Intimidating', 'Sociopathic', 'Robotic', 'SuperHipster', 'TooIdealistic', 
								   'TooEmotional', 'NoChill', 'HardToPlease', 'SelfiesEverything', 'TooMuchTV', 'Cowardly', 'NoAmbition', 'Meh'];

var global_NeutralAssociations = ['Democrat', 'Republican', 'Conservative', 'Liberal', 'EastCoast', 'WestCoast', 'European', 'Redditor', 'TumblrUser',
								  'ImgurUser', 'VideoGamer', 'Actor', 'Lawyer', 'Doctor', 'CollegeStudent', 'Engineer', 'HighSchoolStudent', 'Biologist', 'Chemist',
								  'Physicist', 'ComputerScientist', 'Writer', 'Artist', 'Politician', 'PC', 'Mac', 'AfricanAmerican', 'AsianAmerican', 'Latino', 
								  'Economist', 'Teacher', 'Researcher', 'Android', 'iPhone', 'Male', 'Female'];


var global_baseAssociations = global_PositiveAssociations.concat(global_NeutralAssociations, global_NegativeAssociations);


/**
	Returns an object as key value pairs 
*/
function stripDynamoSettings(data) {
	delete data['userId'];
	delete data['hashtag']

	var dataObj = {};

	for(key in data) {
		if('S' in data[key]) {
			dataObj[key] = data[key].S
		}
		else if('N' in data[key])
			dataObj[key] = parseInt(data[key].N)
	}

	return dataObj;
}

/**
	returns a list of keys in order of property value
*/
function sortObject(data) {
	return Object.keys(data).sort(function(a,b){return data[a]-data[b]});
}