/**
	@author: Amol Kapoor
	@date: 10-5-15
	@version: 0.1

	Login and Init panels
*/



/**
    Logs in a user to facebook. Loads the user's id, friends list. 

    @param: callback; type: function; what to do when both user id and friends list have loaded
*/
function FBloginHelper(callback) {
    //fb.js
    FBlogin(function(id, friendsList_scope) {

        if(!id) {
            callback(false);
            return;
        }

        global_ID = id;


        if(!friendsList_scope) {
            alert("Error: Friends list access not given. We need access to your friends list to make this app functional. Friends list count data is used to determine how important different pieces of data are to your profile.");

            FBlogin(function(id, friendsList_scope_two) {
                if(!friendsList_scope_two) {
                    callback(false);
                } else {
                    callback(true);
                }
            }, 'rerequest');
        } else {
            callback(true);
        }

    });
}

/**
    Checks if the profile exists, callsback with success if data exists for user on server
**/
function checkProfile(callback) {
    socket.emit('clientToServer', {
        name: 'getProfile',
        hash: global_ID,
        dataType: 'selfProfile'
    }, function(data, err) {

        if(err) {
            console.log(err);
            alert(err);
            return;
        }

        //Make sure friend length data is not accidentally used here
        if(!data) {
            callback(false);
        }
        else {
            callback(true);
        }
    });
}

/**
    Loads global data from facebook
**/
function loadGlobals(callback) {

    var deferred_name = new $.Deferred();
    var deferred_friends = new $.Deferred();

    FBgetName(global_ID, function(name) {
        global_name = name;
        $('.profile label').html(global_name);
        deferred_name.resolve();
    });

    FBgetFriends(global_ID, function(list) {
        global_friendsList = list.slice(0); 
        global_friendsListUnmodified = list.slice(0);
        deferred_friends.resolve();
    });

    $.when.apply($, [deferred_name, deferred_friends]).done(function() {
        if(callback)
            callback(true);
    });
}

/**
    Mechanism to call the past user data. Logs into facebook, emits getProfile with the facebook userId on callback, and
    triggers UI change if successful login on both Facebook AND RealRep
*/
function loginPastUser(callback) {
    FBloginHelper(function(successOne) {

        if(!successOne) {
            alert("We cannot proceed without the correct Facebook permissions. Thanks for checking out RealRep!");
            return;
        }

        checkProfile(function(successTwo) {

            if(!successTwo && !callback) {
                alert("Create a new account first!");
                return;
            }

            loadGlobals(function(successThree) {
                if(successThree) {
                    if(callback)
                        callback();
                    else {     
                        postLogin();
                    }
                }
            });
        
        });              
    });
}

/**
    Helper method for login new user, designed to get a list of tags that defines a user profile from facebook

    @param: callback; function(list1, list2);
                list1: list of tags that are pulled from facebook likes
                list2: list of tags pulled from facebook hometown/location/education 
**/
function getFacebookProfileTags(callback) {
    var deferredLikes = new $.Deferred();
    var deferredHometown = new $.Deferred();
    var deferredLocation = new $.Deferred();
    var deferredEdu = new $.Deferred();

    var unchecked_fbTagList = [];
    var prechecked_fbTagList = [];

    FBgetLikes(global_ID, function(likes) {
        if(likes) {
            unchecked_fbTagList = unchecked_fbTagList.concat(likes);
        }

        deferredLikes.resolve();
    });

    FBgetHomeTown(global_ID, function(hometown) {
        if(hometown) {
            prechecked_fbTagList.push(hometown);
        }
       
        deferredHometown.resolve();
    });

    FBgetLocation(global_ID, function(location) {
        if(location) {
            prechecked_fbTagList.push(location);
        }
        
        deferredLocation.resolve();
    });

    FBgetEdu(global_ID, function(edu) {
        if(edu) {
            prechecked_fbTagList = prechecked_fbTagList.concat(edu);   
        }
       
        deferredEdu.resolve();
    });



    $.when.apply($, [deferredEdu, deferredLocation, deferredHometown, deferredLikes]).then(function() {
        callback(unchecked_fbTagList, prechecked_fbTagList);
    });
}

/**
    Mechanism to sign up new users. Logs into facebook, generates a set of tags based on user input, sends those tags to server, 
    and triggers UI change if everything is successful. If the tags are not all full, attempts to log in as old user. 
*/
function loginNewUser() {
    
    var tag1 = $("#tag-field1").val();
    var tag2 = $("#tag-field2").val();
    var tag3 = $("#tag-field3").val();
    var tag4 = $("#tag-field4").val();
    var tag5 = $("#tag-field5").val();
    var tag6 = $("#tag-field6").val();

    loginPastUser(function() {

        if (tag1 && tag2 && tag3 && tag4 && tag5 && tag6) {

            var tagArray = [tag1, tag2, tag3, tag4, tag5, tag6];

            if(!notEqual(tagArray)) {
                alert("Please select different tags for each value");
                return;
            }
  
            getFacebookProfileTags(function(unchecked_fbTagList, prechecked_fbTagList) {

                prechecked_fbTagList = prechecked_fbTagList.concat(tagArray);

                generateCheckboxList(unchecked_fbTagList, prechecked_fbTagList);
            
            });
        }
        else {
            alert("Please fill out all of the tags before continuing");
        }
 
    });

}


//----------------------------------------------------------------------------------------------------------------------------
//UI GOES HERE
//----------------------------------------------------------------------------------------------------------------------------


/**
    Click binding so that when hitting the downbounce arrow, the screen scrolls down 
*/
$('#theArrow').click(function() {
    scrollPage(".initial-tag-page");
});

/**
    Triggers sign-in process for old users. If data cannot be found for a FB userID, requests a new signup
*/
$("#old-user-login").click(function() {
    loginPastUser();
});

/**
    Triggers sign-out process for old users. 
*/
$("#diff-user-login").click(function() {
    loginPastUser();
});

/**
    Opens the init tag div
*/
$('#new-user-login').click(function() {
    $(".old-user-signup").fadeOut(function() {
        $(".new-user-signup").fadeIn();
    });
});

/**
    Sets up a new user, or, if an old user exists, signs in the old user. 
*/
$('#tag-submit').click(function() {
    loginNewUser();
});


/**
    Key binding the actual submission to the db for new user info
**/
$('#login-new-user').click(function(){

    if($('.checkbox-container input:checked').length < 6) {
        alert("Please select at least 6 options");
        return false;
    }

    var initNum = Math.floor(global_friendsListUnmodified.length/5);

    if(initNum <= 0) {
        initNum = 1;
    }

    var incomingObj = {
        name: 'addUser',
        hash: global_ID
    }

    $('.checkbox-container input:checked').each(function() {
        var name = "" + this.value;

        incomingObj[name.toLowerCase()] = initNum;
    });

    socket.emit('clientToServer', incomingObj, function(data, err) {

        if(err) {
            console.log(err);
        }
        else {
            postLogin();
        }
    });
});

/**
    After signing in or signing up, opens up the user's personal map page
    and updates friend length
*/
function postLogin() {

    socket.emit('clientToServer', {
        name: 'updateFriendsLength', 
        hash: global_ID,
        attribute: global_friendLengthKey,
        value: global_friendsListUnmodified.length
    }, function(data, err) {
        if(err) {
            console.log(err);
        }
    });    

    changePage('self-profile-page', global_ID, function() {
        friendnetwork_loadFriends();
    });
}

/**
    Creates a list of tags pulled from facebook

    @param: fbTagList; list of strings; list that is unchecked 
    @param: tagArray; list of strings; list that is prechecked
**/
function generateCheckboxList(fbTagList, tagArray) {

    $('.new-user-signup').fadeOut(function() {

        $('.new-user-facebook-signup').fadeIn();

        for(index in fbTagList) {
            $('.checkbox-container').append("<li> <input type=\"checkbox\" name=\"" + fbTagList[index] + "\" value=\"" + fbTagList[index] + "\">" + fbTagList[index].toLowerCase() + "<li>");
        }

        for(index in tagArray) {
            $('.checkbox-container').append("<li> <input type=\"checkbox\" name=\"" + tagArray[index] + "\" value=\"" + tagArray[index] + "\" checked>" + tagArray[index].toLowerCase() + "<li>");
        }
    });
}
