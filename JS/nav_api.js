/**
	@author: Amol Kapoor
	@date: 1-4-16
	@version: 0.1

	Description: API to hook into HTML5 history api. Handles changing pages as well. 
*/



/**
	Makes sure all other pages are closed besides passed one

	@param: pageToLoad; string; class describing which page should NOT be closed
**/
function ensureOthersAreClosed(pageToLoad) {
	for(key in mapReference) {
		if(key === pageToLoad) 
			continue;
		
		if(!$('.' + key).is(":hidden")) {
			$('.' + key).slideToggle();
		}
	}
}

/**
	Handles changing pages, includes forward/next button magic. Loads global state to history. 

	@param: newPageClass; string; class describing which page to load
	@param: oldPageClass; deprecated
	@param: mapData; string; id or some other information needed to load maps on various pages
	@param: pageState; deprecated
	@param: callback; function()
	@param: onNavButton; bool; checks whether this is being called on a back or forward button call
**/
function changePage(newPageClass, oldPageClass, mapData, pageState, callback, onNavButton) {

    $('.' + newPageClass).slideToggle(function() {

    	if(mapReference[newPageClass] && mapData) {

    		if(isEmpty($('.' + mapReference[newPageClass]))) {
       			loadProfileMap('.' + mapReference[newPageClass], mapData);      
       		} else {
       			console.log(newPageClass)
       			console.log(mapReference[newPageClass])
    			d3.select("." + mapReference[newPageClass] + " svg").call(zoom, d3.select("." + mapReference[newPageClass] + " .networkContainer"));
       		}

    	} 

    	ensureOthersAreClosed(newPageClass);

    	if(callback)
	    	callback();
		
		if(!onNavButton) {

			global_state.nextPage = newPageClass;
			history.replaceState(global_state, "");

			global_state.prevPage = global_state.currentPage;
			global_state.currentPage = newPageClass;
			global_state.nextPage = null;

			stackLocation++;

			global_state.index = stackLocation;

			history.pushState(global_state, "");

			document.title = docTitle + nameReference[global_state.currentPage];
		}
			
    });
}

/**
	Deals with back and forward button navigation. Loads the passed in global state and changes page accordingly.

	@param: event; event; passed in from the function call, the event contains the global state obj that defines
			how to set up the app for the new state given
**/
window.onpopstate = function(event) {

	if(!event.state || !event.state.currentPage)
		return;

	var state = event.state;

	var pageToLoad, pageToHide;

	//if going backwards, else going forwards
	if(state.index < stackLocation) {
		pageToLoad = state.currentPage;
		pageToHide = state.nextPage;		
	} else {
		pageToLoad = state.currentPage;
		pageToHide = state.prevPage;	
	}

	global_state = state;
	stackLocation = state.index;
	document.title = docTitle + nameReference[global_state.currentPage];

	if (pageToLoad === 'initial-tag-page') {
		
		changePage(pageToLoad, pageToHide, null, null, null, true);

	} else if(pageToLoad === 'self-profile-page') {

		changePage(pageToLoad, pageToHide, global_ID, null, null, true);

	} else if (pageToLoad === 'correlation-page') {
		changePage(pageToLoad, pageToHide, null, null, null, true);

		//load hashtag value from global_pageState

	} else if (pageToLoad === 'other-profile-page') {
		currentLoadedFriend = state.pageState.loadedFriend;

		changePage(pageToLoad, pageToHide, currentLoadedFriend.id, null, null, true);

		postLoadUser(currentLoadedFriend.id, currentLoadedFriend.fullHashtagList);

	} else if (pageToLoad === 'judgrpage') {
		changePage(pageToLoad, pageToHide, null, null, null, true);
		
		currentLoadedFriend = state.pageState.loadedFriend;

		postLoadUser(currentLoadedFriend.id, currentLoadedFriend.fullHashtagList);	
	} else if (pageToLoad === 'friend-network') {
		changePage(pageToLoad, pageToHide, null, null, null, true);

		if ($('.friend-network .friend-container li').length === 0)
			friendnetwork_loadFriends();
	}
};


