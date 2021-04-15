/**
 *    Create by Allen.sun on 2020/08/19
 *    Module: zhilian-script
 *    Collaborator: null
 *    Description: 智联招聘私有逻辑入口
 */
!(function () {

    function filterELForContians (contains) {
        var retArr = $(".resume-content__section:contains('"+contains+"')");
        return retArr
    };

    function filterbasicItem (type) {
        var basicSort = {
            genter: 0,
            old: 1,
            year: 2,
            edu: 3,
            local: 4,
            workStatus: 7,
            indus: function () {
                return filterELForContians("求职意向")
            },
            job: function () {
                return $(".resume-basic__suggestion")
            }
        };
        var items = $(".resume-basic__chip");
        var typeShort = basicSort[type];
        return basicSort[type] >= 0 ? items.eq(typeShort) : typeShort();
    }

    $().ready(function () {
        let matchMap = sun_config.matchMap;
        sunHelper__utils.logShortcut.start("新版企业智联(zhilian)");


        // 基本信息
        var typeMap = [
            {concantText: "当前职位", scope: function () {
                    return filterbasicItem("job")
                }, unit: "", key: "job"},
            {concantText: "居住地", scope: function () {
                    return filterbasicItem("local")
                }, unit: "", key: "local"},
            {concantText: "工作年限", scope: function () {
                    return filterbasicItem("year")
                }, unit: "年", key: "year"},
            {concantText: "教育", scope: function () {
                    return filterbasicItem("edu")
                }, unit: "", key: "edu"},
            {concantText: "行业", scope: function () {
                    return filterbasicItem("indus")
                }, unit: "", key: "indus"},
            {concantText: "性别", scope: function (){
                    return filterbasicItem("genter")
                }, unit: "", key: "genter"},
            {concantText: "年龄", scope: function () {
                    return filterbasicItem("old")
                }, unit: "岁", key: "old"},
            {concantText: "工作状态", scope: function () {
                    return filterbasicItem("workStatus")
                }, unit: "", key: "workStatus"},
        ];

        setTimeout(executePage, 1500);

        function executePage() {
            var wrapper = $(".resume-detail-wrap"),
                section = wrapper.find(".resume-content__section")
            if(section.length > 0) {
                var code = "";
                createSystemAssociation($("html"),
                    {
                        mainControll: $("#root"),
                        detailControll: wrapper,
                        resumeBodyClassName: [
                            $(".is-pre"),
                            $(".resume-skill-tags"),
                            $(".resume-basic__suggestion"),
                            filterELForContians("教育经历").find(".km-timeline__item-content")
                        ],
                        workDiffControll: function () {
                            return filterELForContians("工作经历").find(".resume-content__main span")
                        },
                        matchMap
                    }, { type: 17, code: code} ,"", typeMap, function () {
                        $("head").append("<style> .resume-tabs.affix { top: 84px !important;}.affix {top: 84px !important;}</style>");
                    });

            } else {
                setTimeout(executePage, 1500);
            }
        }
    })
})();