/**
 *    Create by Allen.sun on 2020/08/19
 *    Module: 51job 无忧精英
 *    Collaborator: null
 *    Description: 无忧精英私有逻辑入口
 */

!(function () {
    let matchMap = sun_config.matchMap;
    sunHelper__utils.logShortcut.start("无忧精英(51jingying)");
    $().ready(function () {
        var typeMap = [
            {concantText: "当前职位", scope: function () {
                    return $($(".yy_jobBox ").get(0))
                }, unit: "", key: "job"},
            {concantText: "居住地", scope: function () {
                    return $($(".info-row")[2])
                }, unit: "", key: "local"},
            {concantText: "工作年限", scope: function () {
                    return $($(".info-row")[2])
                }, unit: "年", key: "year"},
            {concantText: "教育", scope: function () {
                    return $($(".yy_jobEdu ")[0])
                }, unit: "", key: "edu"},
            {concantText: "行业", scope: function () {
                    return $($(".yy_jobEdu ")[0])
                }, unit: "", key: "indus"},
            {concantText: "性别", scope: function () {
                    return $("#mgrBaseInfo .rp_resTopMsgL")
                }, unit: "", key: "genter"},
            {concantText: "年龄", scope: function () {
                    return $("#mgrBaseInfo .rp_resTopMsgL")
                }, unit: "岁", key: "old"},
            {concantText: "工作状态", scope: function () {
                    return $("#mgrBaseInfo .rp_resTopMsgL")
                }, unit: "", key: "workStatus"},
        ];

        var resumeDom = $(".rp_resumeBox");

        var code = $("#mgrBaseInfo").text().match(/(?<=ID：).*?(?=\） )/g);

        var jsonConfig = { type: 6, code: code && code[0]};

        createSystemAssociation(resumeDom,
            {mainControll: $("body"),
                detailControll: $(".rp_resumeBox"),
                resumeBodyClassName: [
                    $(".yy_jobBoxNewO"),
                    $(".yy_jobBoxLi"),
                    $(".yy_jobEduH")
                ],
                workDiffControll: function () {
                    return $(".yy_jobBoxC3")
                },
                resetPageBefore: function () {
                    Array.prototype.forEach.call($("font"), (n,index) => {
                        $(n).after($(n).text())
                        $(n).remove();
                    })
                },
                matchMap
            }, jsonConfig ,"", typeMap, function (rnssResumeData) {});
    })

})();