// ==UserScript==
// @name        YouTube - whitelist channels in uBlock Origin
// @namespace   talvi@see-base.de
// @description Helps whitelist YouTube channels in uBlock Origin
// @include     http://*.youtube.com/*
// @include     https://*.youtube.com/*
// @version     1
// @grant       none
// ==/UserScript==

var updateHref = function (url) {
  window.history.replaceState(history.state, "", url);
};

var activate = function () {
  if (location.href.search("&user=") != -1) return;
  
  var uo = document.querySelector('#watch7-content link[href*="/user/"]');
  var uv = document.querySelector('.yt-user-info > a[href*="/channel/"]');
  var channelName = (uo && uo.href.slice(uo.href.lastIndexOf("/")+1)) || (uv && uv.textContent);

  if (channelName) {
    addMenu(channelName);
    updateHref(location.href+"&user="+channelName);
  }
}

// For static pages
activate();

// For dynamic content changes, like when clicking a video on the main page.
// This bit is based on Gantt's excellent Download YouTube Videos As MP4 script:
// https://github.com/gantt/downloadyoutube
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.addedNodes !== null) {
      for (i = 0; i < mutation.addedNodes.length; i++) {
        if (mutation.addedNodes[i].id == "watch7-main-container") {
          activate();
          break;
        }
      }
    }
  });
});
observer.observe(document.body, {childList: true, subtree: true});

// Add the context menu to the user name below the video
// Only works in Firefox
function addMenu(channelName) {

  var uh = document.getElementById("watch7-user-header");
  var menu = document.createElement("menu");
  menu.setAttribute("id", "ubofilter");
  menu.setAttribute("type", "context");
  var mione = document.createElement("menuitem");
  mione.setAttribute("label", "uBlock Origin: toggle whitelist filter"); 
  menu.appendChild(mione);
  document.body.appendChild(menu);
  uh.setAttribute("contextmenu","ubofilter");

  function abpShowFilter() {
    var ffl = "*youtube.com/*&user="+channelName;
    var wh = document.getElementById("watch8-action-buttons");
    var wlf = wh.parentNode.querySelector("#whitelistfilter");
    if (!wlf && ffl) {
      var div = document.createElement("div");
      div.setAttribute("id","whitelistfilter");
      div.innerHTML = "Add the following filter to uBlock Origin:";
      var textarea = document.createElement("textarea");
      textarea.setAttribute("style", "display: block; font-family: monospace; resize: none");
      textarea.setAttribute("readonly","true");
      textarea.setAttribute("spellcheck","false");
      textarea.setAttribute("rows","1");
      textarea.setAttribute("cols",ffl.length);
      textarea.innerHTML = ffl;
      div.appendChild(textarea);
      wh.parentNode.appendChild(div);
      textarea.focus();
    }
    else wh.parentNode.removeChild(wlf);
  }

  mione.addEventListener("click",abpShowFilter,false);
}
