/**
 *    Create by Allen.sun on 2020/12/17
 *    Module: maimia-detail-script
 *    Collaborator:
 *    Description: 脉脉简历管理助手方案
 */

// DONE:
// 完整简历地址： https://maimai.cn/jobs/jobs_resume?webuid=Qaw8O9CD&ejid=nvmq74rSozVhGqMkNr9b9g&fr=webResume&mobile=2&is_from_pc=true
// 接口： https://maimai.cn/jobs/b/resume_handle?channel=www&count=20&ejid=&is_return_total=true&jsononly=1&page=0&rtype=2&version=4.0.0
// 数据map地址： data ->  resume_list 字段 ejid && webuid

(function () {
    window.onload = function () {
        sunHelper__tip("【sunHelper】(简历助手)正在尝试连接脉脉修复脚本...", 999999, "success");
    }
    var str = function () {
        return 'var sunHelper__tipv1 = (function () {let i = 1;'+ sunHelper__tip.toString() +';return {sunHelper__tip:sunHelper__tip,resetI: function () {i = 1}}})();window.onload = function () { ;sunHelper__tipv1.sunHelper__tip("【sunHelper】(简历助手)脉脉修复脚本了连接成功", 999999, "success")}'
    }
    function sun_injector_center_v01(res, data) {
        sunHelper__tipv1.sunHelper__tip("【sunHelper】(简历助手)数据解析成功正在构建查看按钮...", 999999, "success");
        sunHelper__tipv1.resetI();
        var page = 0;
        var dataCount = 0;
        var delay = function (cb, time) {
            var timer = setTimeout(function () {
                cb();
                clearTimeout(timer)
            }, time || 1000)
        };
        var structure = function () {
            var listDoms = document.getElementsByClassName("resumeCard");

            this.forEach(function (item, index) {
                (function (item) {
                    listDoms[index].appendChild(elemShot(item))
                })(item)
            })
        };
        var elemShot = function (data) {
            var span = document.createElement("span");
            span.innerText = "召唤【简历助手】查看["+data.name+"]的简历";
            span.className="sunHelper__watcher";
            span.onclick = elemEvent(data);
            span.style.color="#266fff";
            span.style.fontWeight="600";
            return span
        };
        var elemEvent = function (data) {
            return function (e) {
                console.log(data);
                window.open("https://maimai.cn/jobs/jobs_resume?webuid=" + data.web_uid + "&ejid=" + data.ejid + "&fr=webResume&mobile=2&is_from_pc=true")
            }
        };
        return function () {
            var dataList = res.resume_list || res.data.resume_list;
            var dataPage = data.query.page;
            dataCount= data.query.count;
            page = dataPage == 0 ? 1 : dataPage;
            delay(structure.bind(dataList))
        }
    }
    var styleMain = document.createElement("style");
    var scriptMain = document.createElement("script");
    var scriptSnippet = document.createElement("script");
    scriptMain.setAttribute('src', chrome.extension.getURL("src/js/core/maimai-interceptor.js"));
    scriptSnippet.innerText = sun_injector_center_v01.toString() + ';'+ str();
    styleMain.innerText = ".resumeCard {position: relative;} .sunHelper__watcher {position: absolute;bottom: 10px;right: 10%;cursor: pointer;}"
    document.documentElement.appendChild(styleMain);
    document.documentElement.appendChild(scriptSnippet);
    document.documentElement.appendChild(scriptMain);
})()