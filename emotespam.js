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


    function reactTriggerChange(node) {
        // from https://github.com/vitalyq/react-trigger-change


    var supportedInputTypes = {
        color: true,
        date: true,
        datetime: true,
        'datetime-local': true,
        email: true,
        month: true,
        number: true,
        password: true,
        range: true,
        search: true,
        tel: true,
        text: true,
        time: true,
        url: true,
        week: true
    };
    var nodeName = node.nodeName.toLowerCase();
    var type = node.type;
    var event;
    var descriptor;
    var initialValue;
    var initialChecked;
    var initialCheckedRadio;

    // Do not try to delete non-configurable properties.
    // Value and checked properties on DOM elements are non-configurable in PhantomJS.
    function deletePropertySafe(elem, prop) {
        var desc = Object.getOwnPropertyDescriptor(elem, prop);
        if (desc && desc.configurable) {
        delete elem[prop];
        }
    }

    // In IE10 propertychange is not dispatched on range input if invalid
    // value is set.
    function changeRangeValue(range) {
        var initMin = range.min;
        var initMax = range.max;
        var initStep = range.step;
        var initVal = Number(range.value);

        range.min = initVal;
        range.max = initVal + 1;
        range.step = 1;
        range.value = initVal + 1;
        deletePropertySafe(range, 'value');
        range.min = initMin;
        range.max = initMax;
        range.step = initStep;
        range.value = initVal;
    }

    function getCheckedRadio(radio) {
        var name = radio.name;
        var radios;
        var i;
        if (name) {
        radios = document.querySelectorAll('input[type="radio"][name="' + name + '"]');
        for (i = 0; i < radios.length; i += 1) {
            if (radios[i].checked) {
            return radios[i] !== radio ? radios[i] : null;
            }
        }
        }
        return null;
    }

    function preventChecking(e) {
        e.preventDefault();
        if (!initialChecked) {
        e.target.checked = false;
        }
        if (initialCheckedRadio) {
        initialCheckedRadio.checked = true;
        }
    }

    if (nodeName === 'select' ||
        (nodeName === 'input' && type === 'file')) {
        // IE9-IE11, non-IE
        // Dispatch change.
        event = document.createEvent('HTMLEvents');
        event.initEvent('change', true, false);
        node.dispatchEvent(event);
    } else if ((nodeName === 'input' && supportedInputTypes[type]) ||
        nodeName === 'textarea') {

        // React 16
        // Cache artificial value property descriptor.
        // Property doesn't exist in React <16, descriptor is undefined.
        descriptor = Object.getOwnPropertyDescriptor(node, 'value');

        // React 0.14: IE9
        // React 15: IE9-IE11
        // React 16: IE9
        // Dispatch focus.
        event = document.createEvent('UIEvents');
        event.initEvent('focus', false, false);
        node.dispatchEvent(event);

        // React 0.14: IE9
        // React 15: IE9-IE11
        // React 16
        // In IE9-10 imperative change of node value triggers propertychange event.
        // Update inputValueTracking cached value.
        // Remove artificial value property.
        // Restore initial value to trigger event with it.
        if (type === 'range') {
        changeRangeValue(node);
        } else {
        initialValue = node.value;
        node.value = initialValue + '#';
        deletePropertySafe(node, 'value');
        node.value = initialValue;
        }

        // React 15: IE11
        // For unknown reason React 15 added listener for propertychange with addEventListener.
        // This doesn't work, propertychange events are deprecated in IE11,
        // but allows us to dispatch fake propertychange which is handled by IE11.
        event = document.createEvent('HTMLEvents');
        event.initEvent('propertychange', false, false);
        event.propertyName = 'value';
        node.dispatchEvent(event);

        // React 0.14: IE10-IE11, non-IE
        // React 15: non-IE
        // React 16: IE10-IE11, non-IE
        event = document.createEvent('HTMLEvents');
        event.initEvent('input', true, false);
        node.dispatchEvent(event);

        // React 16
        // Restore artificial value property descriptor.
        if (descriptor) {
        Object.defineProperty(node, 'value', descriptor);
        }
    } else if (nodeName === 'input' && type === 'checkbox') {
        // Invert inputValueTracking cached value.
        node.checked = !node.checked;

        // Dispatch click.
        // Click event inverts checked value.
        event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        node.dispatchEvent(event);
    } else if (nodeName === 'input' && type === 'radio') {
        // Cache initial checked value.
        initialChecked = node.checked;

        // Find and cache initially checked radio in the group.
        initialCheckedRadio = getCheckedRadio(node);

        // React 16
        // Cache property descriptor.
        // Invert inputValueTracking cached value.
        // Remove artificial checked property.
        // Restore initial value, otherwise preventDefault will eventually revert the value.
        descriptor = Object.getOwnPropertyDescriptor(node, 'checked');
        node.checked = !initialChecked;
        deletePropertySafe(node, 'checked');
        node.checked = initialChecked;

        // Prevent toggling during event capturing phase.
        // Set checked value to false if initialChecked is false,
        // otherwise next listeners will see true.
        // Restore initially checked radio in the group.
        node.addEventListener('click', preventChecking, true);

        // Dispatch click.
        // Click event inverts checked value.
        event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        node.dispatchEvent(event);

        // Remove listener to stop further change prevention.
        node.removeEventListener('click', preventChecking, true);

        // React 16
        // Restore artificial checked property descriptor.
        if (descriptor) {
        Object.defineProperty(node, 'checked', descriptor);
        }
    }
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
            //
            // old way
            /*
            var e = new Event('input', { bubbles: true });
            txtarea.val(txt);
            //element.value = value
            txtarea.keypress();
            txtarea[0].dispatchEvent(e);
            */


            txtarea.val(txt);
            reactTriggerChange(txtarea[0]);


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
        return jNode.length === 1 && jNode.text() === my_nick;
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
