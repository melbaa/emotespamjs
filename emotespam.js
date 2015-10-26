/*
melbalabs.com/static/emotespam/emotespam.user.js

*/

function mel_main() {

  
  //var log = unsafeWindow.console.log;
  var log = console.log;

  var script = $('#emotespam');
  var MY_NICK = script.data('my_nick');
  var LINE_COLOR = script.data('line_color');

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
          targetNodes     = $(selectorTxt);
      else
          targetNodes     = $(iframeSelector).contents ()
                                             .find (selectorTxt);

      if (targetNodes  &&  targetNodes.length > 0) {
          btargetsFound   = true;
          /*--- Found target node(s).  Go through each and act if they
              are new.
          */
          targetNodes.each ( function () {
              var jThis        = $(this);
              var alreadyFound = jThis.data ('alreadyFound')  ||  false;

              if (!alreadyFound) {
                  //--- Call the payload function.
                  var cancelFound     = actionFunction (jThis);
                  if (cancelFound)
                      btargetsFound   = false;
                  else
                      jThis.data ('alreadyFound', true);
              }
          } );
      }
      else {
          btargetsFound   = false;
      }

      //--- Get the timer-control variable for this selector.
      var controlObj      = waitForKeyElements.controlObj  ||  {};
      var controlKey      = selectorTxt.replace (/[^\w]/g, "_");
      var timeControl     = controlObj [controlKey];

      //--- Now set or clear the timer as appropriate.
      if (btargetsFound  &&  bWaitOnce  &&  timeControl) {
          //--- The only condition where we need to clear the timer.
          clearInterval (timeControl);
          delete controlObj [controlKey]
      }
      else {
          //--- Set a timer, if needed.
          if ( ! timeControl) {
              timeControl = setInterval ( function () {
                      waitForKeyElements (    selectorTxt,
                                              actionFunction,
                                              bWaitOnce,
                                              iframeSelector
                                          );
                  },
                  300
              );
              controlObj [controlKey] = timeControl;
          }
      }
      waitForKeyElements.controlObj   = controlObj;
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
      
  

  function send_to_chat(txt) {
    var txtarea = $('textarea.ember-view.ember-text-area');
    if (txtarea.length === 0){
        log('txtarea not found :/');
        return;
    }

    if (txtarea.val().length === 0) {
        txtarea.val(txt).change();
    } else {
        log("won't send, typing");
        return false;
    }
  
    var sendbtn = $('button.button.send-chat-button');
    if (sendbtn.length === 0){
        log('sendbtn not found');
        return;
    }
    log('before click ' + txtarea.val());
    click(sendbtn[0]);
    return true;
  }
  
  var long_enough = function(old, now) {
       // mins
      log(now - old);
      //return now - old >= 1000 * 60 * 5;
      return now - old >= 1000 * 60 * 2;
  }
  
  var myself = function(jNode, my_nick) {
    // $('.chat-line[data-sender!=melbaa').find('.message').eq(1)
    var selector = '.chat-line[data-sender=' + my_nick + ']';
    return jNode.find(selector).addBack(selector).size() === 1;
  }

  


  last_seen = new Date();
  function highlightGoodComments(jNode) {
      // log('found a chat line');
      
      

      if (myself(jNode, MY_NICK)) {
          log('found myself');
          return;
      }

      
 

      // log(jNode.text());            

      
      var msgs = jNode.find('.message');
      if (msgs.length === 0) {
          log('.message not found');
          return;
      }
      var txt = msgs.attr('data-raw'); // because .data() can cast to eg int
      var matches = txt.match('OpieOP');
  
      if (matches) {
        var now = new Date();
        if (!long_enough(last_seen, now)) {
          log ('too soon');
          return;  
        } 
        log('trying to send opie');
        //color line
        jNode.css('background', LINE_COLOR);
        var success = send_to_chat('OpieOP');
        if (!success) {
            return;
        }
        last_seen = now;
      } else if (!matches) {
        // log('opie not found');
      }
      
  }
 

  waitForKeyElements('div.chat-line', highlightGoodComments);
}


(function(){
  //boilerplate greasemonkey to wait until jQuery is defined...
  function GM_wait()
  {
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