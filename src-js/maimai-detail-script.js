/**
 *    Create by Allen.sun on 2020/12/18
 *    Module: maimai-detail-detail
 *    Collaborator:
 *    Description: 脉脉在线简历主模块
 */

(function () {
    /**
     *    Create by Allen.sun on 2020/12/07
     *    Module: maimai-script
     *    Collaborator: null
     *    Description: 脉脉详情私有逻辑入口
     */

    (function () {
        let matchMap = sun_config.matchMap;
        sunHelper__utils.logShortcut.start("脉脉(maimai)");
        $().ready(() => {
            var resumeDom = null;

            function ContentNext () {
                resumeDom = $("#react_app");
                if (resumeDom.find(".name").length === 0) {
                    setTimeout(_ => ContentNext(), 1000)
                    return
                }
                $(".age").append("岁");
                var jsonConfig = { type: 16, code: ""};

                // 0 当前职位 1 居住地 2 工作年限 3 教育 4 行业 5 性别 6  年龄 7 工作状态
                var typeMap = [
                    {concantText: "当前职位", scope: function () {
                            return $(".position-main .position")
                        }, unit: "", key: "job"},
                    {concantText: "居住地", scope: function () {
                            return $(".huntingInfo")
                        }, unit: "", key: "local"},
                    {concantText: "工作年限", scope: function () {
                            return $(".work-time-str")
                        }, unit: "年", key: "year"},
                    {concantText: "教育", scope: function () {
                            return $(".degree-str")
                        }, unit: "", key: "edu"},
                    {concantText: "行业", scope: function () {
                            return $(".huntingIndustry")
                        }, unit: "", key: "indus"},
                    {concantText: "性别", scope: function () {
                            return ""
                        }, unit: "", key: "genter"},
                    {concantText: "年龄", scope: function () {
                            return $(".age")
                        }, unit: "岁", key: "old"},
                    {concantText: "工作状态", scope: function () {
                            return $(".huntingName")
                        }, unit: "", key: "workStatus"},
                ];
                createSystemAssociation(resumeDom,
                    {
                        mainControll: $("body"),
                        detailControll: $(".main-container"),
                        resumeBodyClassName: [
                            $("#work_exps .company-main").parent(),
                            $("#educations .company-main").parent(),
                            $(".sc-dnqmqq")
                        ],
                        workDiffControll: function () {
                            return $(".info-text")
                        },
                        matchMap
                    }, jsonConfig ,"", typeMap, function () {
                        $("head").append("<style> #sunHelperResumebar { top: 0; } #parasiticDetail {margin-top: 96px} #body {width: 800px;margin: 0 auto;} .duaqjf {width: 800px;margin: 0 auto;}</style>");
                    });
            };

            ContentNext();
        })
    })()
})()
