/**
 *    Create by Allen.sun on 2020/08/19
 *    Module: hightpin-script
 *    Collaborator: null
 *    Description: 智联卓聘的私有逻辑入口
 */

!(function () {
    let matchMap = sun_config.matchMap;
    sunHelper__utils.logShortcut.start("卓聘(highpin)");
    $().ready(function () {

        var resumeDom = $("div[class*=detailbox]");

        if (resumeDom.length == 0) return;
  
	   var jsonConfig = { type: 3, code: $("#RecordID").val()};

        // 0 当前职位 1 居住地 2 工作年限 3 教育 4 行业 5 性别 6  年龄 7 工作状态
        var typeMap = [
		{concantText: "当前职位", scope: function () {
			return $($(".job-item-top")[0])
		  }, unit: "", key: "job"},
		{concantText: "居住地", scope: function () {
			return $($(".info-row")[2])
		  }, unit: "", key: "local"},
		{concantText: "工作年限", scope: function () {
			return $($(".info-row")[1])
		  }, unit: "年", key: "year"},
		{concantText: "教育", scope: function () {
			return $($(".info-row")[1])
		  }, unit: "", key: "edu"},
		{concantText: "行业", scope: function () {
			return $($(".rd-info-col-cont")[0])
		  }, unit: "", key: "indus"},
		{concantText: "性别", scope: function () {
			return $($(".info-row")[1])
		  }, unit: "", key: "genter"},
		{concantText: "年龄", scope: function () {
			return $($(".info-row")[1])
		  }, unit: "岁", key: "old"},
		{concantText: "工作状态", scope: function () {
			return $(".user-status-tag")
		  }, unit: "", key: "workStatus"},
	  ];

        createSystemAssociation(resumeDom,
            {
                mainControll: $("body"),
                detailControll: $(".main-container"),
                resumeBodyClassName: $(".resume-main"),
                workDiffControll: function () {
                    return $(".first-row")
                },
                matchMap
            }, jsonConfig ,"", typeMap, function () {
                $("head").append("<style> #sunHelperResumebar { top: 0}</style>");
            });
    })

})()