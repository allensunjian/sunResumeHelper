"use strict"; !
    function() {
        window.helper_version = "5.0.9";
        let i = 0;
        let toolsFN = {
            swicthExpore: function () {
                window.randomExplore && window.randomExplore ();
            }
        };
        function a(e, t, n, s) {
            debugger
            e = e || "";
            var o = document.createElement("div");
            o.className = "chrome-plugin-simple-tip slideInLeft " + (n ? n + "__tip": ""),
                o.style.top = 70 * i + 20 + "px",
                o.innerHTML = "<div>" + e + "</div>",
            s && 0 < i || (document.body.appendChild(o), o.classList.add("animated"), i++, setTimeout(function() {
                    o.style.top = "-100px",
                        setTimeout(function() {
                                o.remove(),
                                    i--;
                            },
                            t || 400)
                },
                3e3))
        }
        $.fn.s_show = function() {
            this.show()
        },
            $.fn.s_hide = function(e) {
                this.hide()
            }
        // 接收来自后台的消息
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
        {
            if (request.messageType == "setTips") {
                tip(request.text, 2000, request.tipType)
                return
            }
            if ( request.messageType == "pageReload" ) {
                window.location.reload(true);
                return
            }
            if (toolsFN[request.messageType]) {
                toolsFN[request.messageType](request.value);
                sendResponse("success");
            } else {
                sendResponse("false")
            }

        });
        window.sunHelper__tip = a
    } ();