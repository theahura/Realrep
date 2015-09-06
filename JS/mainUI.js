/**
    @author: Amol Kapoor
    @date: 9-5-15
    @version: 0.1

    Description: All UI effects go here
*/


$('#ProfilePicture').click(function() { 
    $('.judgrpage').slideToggle();
    $('.other-profile-page').slideToggle(function() {
        loadOtherProfileMap();
    });
});


$('.temp').click(function() {
    $('.self-profile-page').slideToggle();  
    $('.judgrpage').slideToggle();
});

$('#view-judgr').click(function() {
    $('.self-profile-page').slideToggle();
    $('.judgrpage').slideToggle();
})

$('.view-correlator').click(function() {
    $('.self-profile-page').slideToggle();
    $('.correlation-page').slideToggle();
});

<<<<<<< HEAD
$('#MOVEON').click(function() {
    $('.initial-tag-page').slideToggle();
    $('.self-profile-page').slideToggle();
})
=======
$('.correlation-to-profile').click(function() {
    $('.correlation-page').slideToggle();
    $('.self-profile-page').slideToggle();
});
>>>>>>> 43dceb6fe9ac3348914222c4b1a3bcc8613f15af

function postLogin() {
    $('.loginpage').slideToggle();
    $('.self-profile-page').slideToggle();  
}

function postInitTags() {
    console.log("close");
    $('.initial-tag-page').slideToggle();
    $('.self-profile-page').slideToggle();  
}

function getInitTags() {
    $('.initial-tag-page').slideToggle();
    $('.loginpage').slideToggle();
}

$('#tag-submit').click(function() {
    var tag1 = $("#tag-field1").val();
    var tag2 = $("#tag-field2").val();
    var tag3 = $("#tag-field3").val();
    var tag4 = $("#tag-field4").val();
    var tag5 = $("#tag-field5").val();
    var tag6 = $("#tag-field6").val();

    if (tag1 && tag2 && tag3 && tag4 && tag5 && tag6) {
        var incomingObj = {
            name: 'addUser',
            hash: global_ID,
            tag1: 10,
            tag2: 10,
            tag3: 10,
            tag4: 10,
            tag5: 10,
            tag6: 10
        }

        socket.emit('clientToServer', incomingObj, function(data, err) {
            if(err) {
                console.log(err);
            }
            else {
                console.log(incomingObj);
                postInitTags();
                alert();
                loadProfileMap();
            }
        });
    }
    else {
        alert("FILL IN ALL THE BOXES, YO!!");
    }
});




$('.FacebookLogin').click(function() {
    $('.self-profile-page').loadFirst();
});
