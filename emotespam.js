/*
melbalabs.com/static/emotespam/emotespam.user.js

*/

function mel_main() {

    //var log = unsafeWindow.console.log;
    var log = console.log;
    log('emotespam loaded');
    var script = $('#emotespam');
    var MY_NICK = script.data('my_nick').toLowerCase();
    var LINE_COLOR = script.data('line_color');
    var PATTERNS = script.data('patterns');
    var DEBUG_ENABLED = script.data('debug_enabled');
    var OWN_CHANNEL = (MY_NICK === window.location.pathname.substr(1));
    var MIN_WAIT_MS = OWN_CHANNEL ? 1000 * 5 : 1000 * 60 * 10;
    //var MIN_WAIT_MS = 1000;

    function debuglog(txt) {
        if (DEBUG_ENABLED) log(txt);
    }

    /*--- waitForKeyElements():  A utility function, for Greasemonkey scripts,
        that detects and handles AJAXed content.

        Usage example:

            waitForKeyElements (
                "div.comments"
                , commentCallbackFunction
            );

            //--- Page-specific function to do what we want when the node is found.
            function commentCallbackFunction (jNode) {
                jNode.text ("This comment changed by waitForKeyElements().");
            }

        IMPORTANT: This function requires your script to have loaded jQuery.
    */
    function waitForKeyElements (
        selectorTxt,    /* Required: The jQuery selector string that
                          specifies the desired element(s).
                        */
        actionFunction, /* Required: The code to run when elements are
                          found. It is passed a jNode to the matched
                          element.
                        */
        bWaitOnce,      /* Optional: If false, will continue to scan for
                          new elements even after the first match is
                          found.
                        */
        iframeSelector  /* Optional: If set, identifies the iframe to
                          search.
                        */
    ) {
        var targetNodes, btargetsFound;

        if (typeof iframeSelector == "undefined")
            targetNodes = $(selectorTxt);
        else
            targetNodes = $(iframeSelector).contents().find(selectorTxt);

        if (targetNodes && targetNodes.length > 0) {
            btargetsFound = true;
            /*--- Found target node(s).  Go through each and act if they
              are new.
            */
            targetNodes.each ( function () {
                var jThis = $(this);
                var alreadyFound = jThis.data ('alreadyFound') || false;

                if (!alreadyFound) {
                    //--- Call the payload function.
                    var cancelFound = actionFunction (jThis);
                    if (cancelFound)
                        btargetsFound = false;
                    else
                        jThis.data ('alreadyFound', true);
                }
            });
        }
        else {
            btargetsFound = false;
        }

        //--- Get the timer-control variable for this selector.
        var controlObj = waitForKeyElements.controlObj  ||  {};
        var controlKey = selectorTxt.replace (/[^\w]/g, "_");
        var timeControl = controlObj [controlKey];

        //--- Now set or clear the timer as appropriate.
        if (btargetsFound && bWaitOnce && timeControl) {
            //--- The only condition where we need to clear the timer.
            clearInterval(timeControl);
            delete controlObj[controlKey];
        }
        else {
            //--- Set a timer, if needed.
            if (!timeControl) {
                timeControl = setInterval(function() {
                        waitForKeyElements(selectorTxt,
                            actionFunction,
                            bWaitOnce,
                            iframeSelector
                    )},
                    300
                );
              controlObj[controlKey] = timeControl;
            }
        }
        waitForKeyElements.controlObj = controlObj;
    }

    function click(elm) {
        //deprecated
        // see https://developer.mozilla.org/en-US/docs/Web/API/document.createEvent for alternative and example
        // also https://developer.mozilla.org/en-US/docs/Web/Reference/Events/click

        //also
        /*
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, true);
        el.dispatchEvent(evt);
        */
        var evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, window, 0, 1, 1, 1, 1, false, false, false, false, 0, null);
        elm.dispatchEvent(evt);
    }

    function find_sendbtn() {
        var found = false;
        var btn_queries = ["[data-a-target='chat-send-button']"]
        var sendbtn = null;
        for (var i = 0; i < btn_queries.length && !found; ++i) {
            var query = btn_queries[i];
            sendbtn = $(query);
            if (sendbtn.length === 0){
                log('sendbtn not found as ' + query);
            } else if (sendbtn.length !== 1) {
                log('wtf ' + query);
            } else {
                found = true;
            }
        }
        return sendbtn;
    }

    function send_to_chat(txt) {
        var txtarea = $("[data-a-target='chat-input']");
        if (txtarea.length === 0){
            log('txtarea not found :/');
            return;
        }

        if (txtarea.val().length === 0) {

            // simulate input change for react
            var e = new Event('input', { bubbles: true })
            //element.value = value
            txtarea.val(txt);
            txtarea[0].dispatchEvent(e)


        } else {
            log("won't send, typing");
            return false;
        }


        var sendbtn = find_sendbtn();
        if (sendbtn.length === 0) {
            log('sendbtn not found :/');
            return;
        }
        log('before click ' + txtarea.val());
        click(sendbtn[0]);
        //sendbtn.click();
        return true;
    }

    var long_enough = function(old, now) {
        // mins
        log(now - old);
        //return now - old >= 1000 * 60 * 5;
        return now - old >= MIN_WAIT_MS;
    }

    var myself = function(jNode, my_nick) {
        //own chan has no spam filter and triggers from self
        if (OWN_CHANNEL) return 0;

        var selector = '.chat-line__username';
        return node.length === 1 && node.text() === my_nick;
    }




    last_seen = new Date();
    function highlightGoodComments(jNode) {
        //log('found a chat line');

        if (myself(jNode, MY_NICK)) {
            log('found myself');
            return;
        }

        debuglog(jNode.text());

        var emotes = jNode.find("[data-a-target='emote-name']").children(); // the emotes are the actual children

        if (emotes.length === 0) {
            log('no emotes found');
            return;
        }

        var alt_attrs = [];

        emotes.each(function () {
            alt_attrs.push($(this).attr('alt'));
        });

        var txt = alt_attrs.join(' ');

        // for each pattern, send text
        var patterns = Object.keys(PATTERNS)
        for (var i = 0; i < patterns.length; ++i) {
            var pattern = patterns[i];
            var matches = txt.match(pattern);

            if (matches) {
                var now = new Date();
                if (!long_enough(last_seen, now)) {
                    log ('too soon');
                    return;
                }
                var spam_txt = PATTERNS[pattern];
                log('mel trying to send ' + spam_txt);
                //color line
                jNode.css('background', LINE_COLOR);
                var success = send_to_chat(spam_txt);
                if (!success) {
                    return;
                }
                last_seen = now;
                // send only 1 message per wait cycle
                return;
            } else if (!matches) {
                debuglog('opie not found');
            }
        }
    }
    // mark all previous lines as seen, so we don't trigger on old chat
    var chat_msg_selector = "[data-a-target='chat-line-message']";
    $(chat_msg_selector).data('alreadyFound', true);

    waitForKeyElements(chat_msg_selector, highlightGoodComments);
}


(function(){

    var scriptElement = document.createElement( "script" );
    scriptElement.type = "text/javascript";
    scriptElement.src = "https://code.jquery.com/jquery-3.3.1.min.js";
    document.body.appendChild( scriptElement );


    //boilerplate greasemonkey to wait until jQuery is defined...
    function GM_wait() {
        var timeout = 1000;
        if(typeof $ === 'undefined') {
            window.setTimeout(GM_wait,timeout);
            console.log('waiting for jquery');
        }
        else
            $(function() { mel_main(); });
        }
    GM_wait();
})();
