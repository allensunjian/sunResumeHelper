(function ($w) {
    var eventList = ['pushState', 'replaceState', 'popstate', 'hashchange'];
    var _wr = function(type) {
        var orig = history[type];
        return function() {
            orig.apply(this, arguments);
            var e = new Event(type);
            e.arguments = arguments;
            window.dispatchEvent(e);
        };
    };
    history.pushState = _wr('pushState');
    history.replaceState = _wr('replaceState');
    eventList.forEach(function (event) {
        $w.addEventListener(event, $w.sun_injector_center_v01(event));
    })
})(window)