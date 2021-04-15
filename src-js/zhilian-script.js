/**
 *    Create by Allen.sun on 2020/08/19
 *    Module: zhilian-script
 *    Collaborator: null
 *    Description: 智联招聘私有逻辑入口
 */
!(function () {
    $().ready(function () {
        let matchMap = sun_config.matchMap;
        sunHelper__utils.logShortcut.start("智联(zhilian)");

        var typeMap = [
            {concantText: "当前职位", scope: function () {
                    return $($($(".resume-content__section")[4]).find(".resume-content__labels--sub")[0])
                }, unit: "", key: "job"},
            {concantText: "居住地", scope: function () {
                    return $($(".resume-content__labels--sub")[0])
                }, unit: "", key: "local"},
            {concantText: "工作年限", scope: function () {
                    return $(".resume-content__labels")
                }, unit: " 年", key: "year"},
            {concantText: "教育", scope: function () {
                    return $(".resume-content__labels")
                }, unit: "", key: "edu"},
            {concantText: "行业", scope: function () {
                    return $($(".rd-info-col-cont")[0])
                }, unit: "", key: "indus"},
            {concantText: "性别", scope: function (){
                    return $(".resume-content__labels")
                }, unit: "", key: "genter"},
            {concantText: "年龄", scope: function () {
                    return $(".resume-content__labels")
                }, unit: " 岁", key: "old"},
            {concantText: "工作状态", scope: function () {
                    return $(".resume-content__labels")
                }, unit: "", key: "workStatus"},
        ];

        setTimeout(executePage, 1500);

        function executePage() {
            var wrapper = $("#resume-detail-wrapper"),
                basicBox = wrapper.find(".resume-content__candidate-basic"),
                resumeDetailBox = $("#resumeDetail");
            if(basicBox.length && resumeDetailBox.length) {
                var code = "",
                    codeBox = wrapper.find(".resume-content--letter-spacing");
                if (codeBox.length) {
                    var regText = new RegExp(/(?=(ID：)).*/);
                    var codeTx = codeBox.text();
                    if (regText.test(codeTx)) {
                        code = $.trim(codeTx.match(regText)[0].substr(3)) || "nothing";
                    }
                }
                createSystemAssociation($("html"),
                    {
                        mainControll: $("#root"),
                        detailControll: $("#root"),
                        resumeBodyClassName: [
                            $(".resume-recommend__section-body"),
                            function () { return $(".is-career-objective")},
                            $(".timeline__item"),
                            $(".resume-content__section--paragraph"),
                            $(".resume-content__block")
                        ],
                        workDiffControll: function () {
                            return $(".timeline__header")
                        },
                        matchMap
                    }, { type: 4, code: code} ,"", typeMap, function () {
                        $("head").append("<style> .resume-tabs.affix { top: 84px !important;}.affix {top: 84px !important;}</style>");
                    });

            } else {
                setTimeout(executePage, 1500);
            }
        }
    })
})();