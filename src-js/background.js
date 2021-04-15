"use strict";

function ajax(e, t) {
    var a = message.url, n = message.method, o = message.data, s = a + "?time=" + new Date().getTime(), r = new XMLHttpRequest();
    r.open(n, s, !0), r.onreadystatechange = function() {
        t(r);
    }, r.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), r.send(o);
}

function getExportTable(e, t, a, n) {
    chrome.tabs.connect(t.id, {
        name: "getExportTable"
    }).postMessage({
        type: "get"
    });
}

function siwcthUa (e, t, a, n) {
    chrome.tabs.sendMessage(t.id, {
        messageType: "swicthExpore",
        value: "reload"
    });
}

chrome.tabs.onUpdated.addListener(function(e, t, a) {

}), chrome.runtime.onMessage.addListener(function(e, t, a) {
    var n = e.url, o = e.method, s = e.data, r = (new Date().getTime(), n), c = new XMLHttpRequest();

    return c.open(o, r, !0), c.onreadystatechange = function() {
        4 == c.readyState && a(c.response);
    }, c.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), c.send(s),
        !0;
});

try {
    chrome.contextMenus.create({
        title: "表格嗅探",
        id: "table_show",
        contexts: [ "page" ],
        onclick: getExportTable
    })
  // chrome.contextMenus.create({
  //       title: "切换",
  //       id: "swicthExpore",
  //       contexts: [ "page" ],
  //       onclick: siwcthUa
  //   });
} catch (e) {}