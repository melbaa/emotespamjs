A greasemonkey script that spams emotes on twitch.tv chat.

# Features
* It waits until an emote is detected and sends one, contributing to everyone's chat experience and immersion.
* It won't trigger from your own nick.
* It will wait a few minutes between emotes.
* It will not send anything if your have something typed in in the chatbox.
* The code is split into a loader and payload for two reasons. It allows 
local configuration edits without changing the hosted version on the server. 
It allows the script to be debugged from the dev tools in the browser.

# Install
Script assumes you have Better Twitch TV (BetterTTV) and
greasemonkey (or tampermonkey on eg. a chromebook) working.

To use, [install it](https://github.com/melbaa/emotespamjs/raw/master/emotespam.user.js) and edit your nick from
manage user scripts -> options -> Edit this user script.


# Thanks
* Tailwhiper for reporting bugs and helping me with debugging.  
* Epicus147 for reporting bugs and testing.  