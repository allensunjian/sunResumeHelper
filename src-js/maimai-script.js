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
            resumeDom = $(".PCcontent");
            if (resumeDom.length === 0 || !$(".contact_detail_name span").html()) {
                setTimeout(_ => ContentNext(), 1000)
                return
            }

            var jsonConfig = { type: 14, code: ""};

            // 0 当前职位 1 居住地 2 工作年限 3 教育 4 行业 5 性别 6  年龄 7 工作状态
            var typeMap = [
                {concantText: "当前职位", scope: function () {
                        return $(".text-muted").eq(1)
                    }, unit: "", key: "job"},
                {concantText: "居住地", scope: function () {
                        return $(".icon_address_gray")
                    }, unit: "", key: "local"},
                {concantText: "工作年限", scope: function () {
                        return ""
                    }, unit: "年", key: "year"},
                {concantText: "教育", scope: function () {
                        return ""
                    }, unit: "", key: "edu"},
                {concantText: "行业", scope: function () {
                        return $(".text-muted").eq(2)
                    }, unit: "", key: "indus"},
                {concantText: "性别", scope: function () {
                        return ""
                    }, unit: "", key: "genter"},
                {concantText: "年龄", scope: function () {
                        return ""
                    }, unit: "岁", key: "old"},
                {concantText: "工作状态", scope: function () {
                        return ""
                    }, unit: "", key: "workStatus"},
            ];
            //  console.log(createSystemAssociation);
            createSystemAssociation(resumeDom,
                {
                    mainControll: $("body"),
                    detailControll: $(".main-container"),
                    resumeBodyClassName: [$($(".panel-default")[0]),$($(".panel-default")[1]),$($(".panel-default")[2]),$($(".panel-default")[3])],
                    workDiffControll: function () {
                        return $(".info-text")
                    },
                    matchMap
                }, jsonConfig ,"", typeMap, function () {
                    $("head").append("<style> #sunHelperResumebar { top: 0; } #parasiticDetail {margin-top: 96px}</style>");
              });
        };

        ContentNext();
    })
})()