Izze says hi
Steve says hi
ln says hi
Obrin Dastek:
oinqwer at gmail.com
asdfgh98

Code set up: 

Notes: 
	Why have an anonymous aspect at all? Why not just facebook friends?

Front end:
	User login/logout from facebook
		Create user with 5 new data things
		Allow user to add their own hashtags
		Allow user to view their previous hashtags with counts
		Grab user location (done on login)
		Add/update bio

	Request users in area (and send updated location data) -> data returned will include name and fb profile picture
		Swipe through various users (each time requesting a new user from server)
		Swipe through various hashtags associated with that user - if run out, request more
		Send data to backend when a hashtag is selected 

Back end:
	Handle request for pulling a new user: 
		Get geolocation
		Find all users near that geolocation (with limit 1)
		Select a user, send that user to front end
		Find the users top 5 hashtags, send those to the front end (with all associations) + randoms
	
	Handle request for additional hashtags:
		Generate a random list of additional hashtags and associations
		Send to frontend
		Make sure to differentiate between anons and friends

	Handle requests for updating user data
		Get the username being sent
		Get the score on the new hashtag
		Update the score in the username value
		If hashtag is new top 5, update association values for other hashtags in hashtag db

Data base:

	Two tables, one for usernames, one for hashtags

	User table:
		Hash: FACEBOOK ID
		Values: 
			{} with keys as hashtag names and values as numbers (# of friends who think that the person is associated with the hashtag)
	
	Hashtag table: 
		Hash: hashtag
		Values:
			{} with keys as hashtag names and values as numbers (weights) representing # of users with 
			top-5 values as that hashtag

	
	
