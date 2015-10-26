// ==UserScript==
// @name        emotespam
// @namespace   mel
// @description OpieOP 
// @include     http://www.twitch.tv/*
// @version     1
// @grant       none
// ==/UserScript==


// betterttv or twitch already imports some jquery shits
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js

// @require https://gist.github.com/raw/2625891/waitForKeyElements.js


//load_script('https://gist.github.com/raw/2625891/waitForKeyElements.js');

function init()
{
  console.log('hi');
  
  var MY_NICK = 'melbaa';
  //respond to messages from those nicks and highlight them

  var LINE_COLOR = 'aqua';
  //bet only if a player has this or better chances to win



  /*
  omg the amount of hax here
  
  first of all, had to dynamically load js because can't debug it as
  greasemonkey script. it wasnt showing if its loading at all, if it has 
  syntax errors, so this had to happpen. 
  had to be loaded in <head> probably because browser enforces some security?
  
  but to prevent caching the script, so that we can update it, we append
  math.random() as query string
  
  we don't know when the browser will load the script, so it has to trigger
  itself until all its dependencies are loaded (in our case jquery). this is
  part of the main script, not this loader
  
  there are some settings we have to set here in the client loader
  in order to personalize the script.
  but how to pass variables to the script we are about to load? 
  solution: serialize and attach them as data-attributes and deserialize
  them in the main script.  
  
  */
  
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = "http://melbalabs.com/static/emotespam/emotespam.js" + '?' +Math.random();
  
  //we'll need the id to get the attributes attached to the script

  script.setAttribute('id','emotespam');
  script.setAttribute('data-my_nick', MY_NICK);
  script.setAttribute('data-line_color', LINE_COLOR);

  document.getElementsByTagName('head')[0].appendChild(script);
  console.log('trying to load script');
}


init();
