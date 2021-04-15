/**
 *    Create by Allen.sun on 2020/12/17
 *    Module: maimai-interceptor
 *    Collaborator:
 *    Description: 脉脉转换脚本
 */

(function () {
    function FetchInterceptor(params) {
        this.rideType = params.rideType;
        this.injection =params.injection;
        this.matchList =params.matchList;
        this._nav = this.getRewriterPlan(this.rideType)
        this.init(this.rideType)
    }
    FetchInterceptor.prototype = {
        init: function (type) {
            return this.planMap[type].call(this)
        },
        getRewriterPlan (type) {
            return this.planMap.navMap[type]()
        },

        planMap: {
            navMap: {
                fetch: () => window.fetch,
                ajax: () => XMLHttpRequest.prototype.open
            },
            fetch: function () {
                let _this = this;
                window.fetch = (...argus) => {
                    if (_this.computedMatch(argus[0])) {
                        return new Promise(resolve => {
                            _this._nav.apply(null, argus).then(res => {
                                _this.injection && _this.injection(res, ...argus)
                                resolve(res)
                            })
                        })
                    }
                    return _this._nav.apply(null, argus)
                }
            },
            ajax: function () {
                let _this = this;
                // TODO
                XMLHttpRequest.prototype.open =  (...argus) => {

                }
            }
        },
        computedMatch (url) {
           if (this.matchList.length == 0) return true
           return this.matchList.filter(matchedUrl => url.indexOf(matchedUrl) >= 0).length > 0
        }
    }

    class Overrider {
        constructor(params) {
           new FetchInterceptor(params);
        }
    }

    new Overrider(
          {
            rideType: 'fetch',
            injection: (res,...argus) => {
            let url = argus[0]
            let query = argus[1]
            let body = null;
            try {
                body = res.clone().json();
                body.then(b => window.sun_injector_center_v01 && window.sun_injector_center_v01(b, query)())
            } catch (e) {

            }
        },
            matchList: ["/jobs/b/resume_handle", "/jobs/get_resume_handle_list"]
          }
        );

})()