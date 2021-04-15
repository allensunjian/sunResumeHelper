/**
 *    Create by Allen.sun on 2020/12/08
 *    Module: maimai-micro-script
 *    Collaborator: null
 *    Description: 脉脉微简历入口
 */


(function () {
    let matchMap = sun_config.matchMap;
    sunHelper__utils.logShortcut.start("脉脉(maimai)");
    $().ready(() => {
        var resumeDom = null;

        function ContentNext () {
            resumeDom = $(".main___1fJUR");
            if (resumeDom.length === 0 || !$(".name___FMaLD h5").html()) {
                setTimeout(_ => ContentNext(), 1000)
                return
            }

            var jsonConfig = { type: 15, code: ""};

            // 0 当前职位 1 居住地 2 工作年限 3 教育 4 行业 5 性别 6  年龄 7 工作状态
            var typeMap = [
                {concantText: "当前职位", scope: function () {
                        return $(".name___FMaLD")
                    }, unit: "", key: "job"},
                {concantText: "居住地", scope: function () {
                        return $(".line2___UHjhk span").eq(0)
                    }, unit: "", key: "local"},
                {concantText: "工作年限", scope: function () {
                        return $(".line2___UHjhk span").eq(4)
                    }, unit: "年", key: "year"},
                {concantText: "教育", scope: function () {
                        return $(".line2___UHjhk span").eq(3)
                    }, unit: "", key: "edu"},
                {concantText: "行业", scope: function () {
                        return $(".rd-info-col-cont").eq(0)
                    }, unit: "", key: "indus"},
                {concantText: "性别", scope: function () {
                        return $(".line2___UHjhk span").eq(1)
                    }, unit: "", key: "genter"},
                {concantText: "年龄", scope: function () {
                        return $(".line2___UHjhk span").eq(2)
                    }, unit: "岁", key: "old"},
                {concantText: "工作状态", scope: function () {
                        return $(".line2___UHjhk span").eq(6)
                    }, unit: "", key: "workStatus"},
            ];
            //  console.log(createSystemAssociation);
            createSystemAssociation(resumeDom,
                {
                    mainControll: $("body"),
                    detailControll: $(".main-container"),
                    resumeBodyClassName: $(".main___1fJUR"),
                    workDiffControll: function () {
                        return $(".line1___21GmV")
                    },
                    matchMap
                }, jsonConfig ,"", typeMap, function () {
                    $("head").append("<style> #sunHelperResumebar { top: 0; }</style>");
                });
        };

        ContentNext();
    })
})()