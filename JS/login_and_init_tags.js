/**
	@author: Amol Kapoor
	@date: 10-5-15
	@version: 0.1

	Login and Init panels
*/


/**
    Mechanism to call the past user data. Logs into facebook, emits getProfile with the facebook userId on callback, and
    triggers UI change if successful login on both Facebook AND RealRep
*/
function loginPastUser(callback) {
    selfprofile_login(function() {
        socket.emit('clientToServer', {
            name: 'getProfile',
            hash: global_ID
        }, function(data, err) {

            if(!data) {
                if(!callback)
                    alert("Fill out the tags and create a new user");
                else 
                    callback();

                return;
            }
            else {
                postLogin();
            }
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

    var incomingObj = {
        name: 'addUser',
        hash: global_ID
    }

    $('.checkbox-container input:checked').each(function() {
        incomingObj[this.value] = initNum;
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
*/
function postLogin() {
    $(".login-page").slideToggle();
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
            $('.checkbox-container').append("<li> <input type=\"checkbox\" name=\"" + fbTagList[index] + "\" value=\"" + fbTagList[index] + "\">" + fbTagList[index] + "<li>");
        }

        for(index in tagArray) {
            $('.checkbox-container').append("<li> <input type=\"checkbox\" name=\"" + tagArray[index] + "\" value=\"" + tagArray[index] + "\" checked>" + tagArray[index] + "<li>");
        }
    });
}


/**
    Key binding for key up and key down with the downbounce arrow
*/
$( document ).keydown(function(e) {
    switch(e.which) {
        case 38: // up
            scrollPage(".login-page");
        break;

        case 40: // down
            scrollPage(".initial-tag-page");
        break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});
