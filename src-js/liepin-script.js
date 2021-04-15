/**
 *    Create by Allen.sun on 2020/08/11
 *    Module: liepin-script
 *    Collaborator: null
 *    Description: 猎聘私有逻辑入口
 */

!(function () {
  let matchMap = sun_config.matchMap;
  sunHelper__utils.logShortcut.start("猎聘(liepin)");
  var getResumeDataHtml = function (resumeDom, json, hasone) {
	// 0 当前职位 1 居住地 2 工作年限 3 教育 4 行业 5 性别 6  年龄 7 工作状态
	var typeMap = [
	  {
		concantText: "当前职位",
		scope: function () {
		  return $($(".basic-cont .sep-info")[1])
		},
		unit: "",
		key: "job"
	  },
	  {
		concantText: "居住地",
		scope: function () {
		  return $($(".basic-cont .sep-info")[0])
		},
		unit: "",
		key: "local"
	  },
	  {
		concantText: "工作年限",
		scope: function () {
		  return $($(".basic-cont .sep-info")[0])
		},
		unit: "年",
		key: "year"
	  },
	  {
		concantText: "教育",
		scope: function () {
		  return $($(".basic-cont .sep-info")[0])
		},
		unit: "",
		key: "edu"
	  },
	  {
		concantText: "行业",
		scope: function () {
		  return $($(".rd-info-col-cont")[0])
		},
		unit: "",
		key: "indus"
	  },
	  {
		concantText: "性别",
		scope: function () {
		  return $($(".basic-cont .sep-info")[0])
		},
		unit: "",
		key: "genter"
	  },
	  {
		concantText: "年龄",
		scope: function () {
		  return $($(".basic-cont .sep-info")[0])
		},
		unit: "岁",
		key: "old"
	  },
	  {
		concantText: "工作状态",
		scope: function () {
		  return $(".user-status-tag")
		},
		unit: "",
		key: "workStatus"
	  },
	];
	$(".rd-info-other-link").click();
	createSystemAssociation(resumeDom, {
		  mainControll: $("body"),
		  detailControll: $(".hunt-spin-main"),
		  resumeBodyClassName: [
			$(".rd-info-col-cont"),
			function () {return $(".resume-detail-self-evaluation-info")},
			// 职业的title
			function () {return $(".job-name")},
			function () {return $(".tags-box")},
			function () {return $(".rd-edu-info-item")},
			function () {return $(".rd-lang-item")},
			function () {return $(".skill-tag-box")},
		  ],
		  workDiffControll: function () {
			return $(".rd-info-tpl-item-head")
		  },
		  resetPageBefore: function () {
			Array.prototype.forEach.call($("font"), (n,index) => {
			  $(n).before($(n).text())
			  $(n).remove();
			})
		  },
		  matchMap
		},
		json,
		hasone,
		typeMap,
		function (rnssResumeData) {
		  $("head").append(
			  "<style> body .operation-affixed {top: 84px !important;width: 1200px !important;left: 50%;margin-left: -600px} .hunt-affix {top: 156px !important;} .hfw-header-wrap { position: absolute; top: 0; width: 100%} .sunHelper__detail_wrap {margin-top: 58px}</style>"
		  );
		});
  };
  
  function stepNext() {
	var resumeDom = null;
	// 获取数据源简历编号 作为参数的CODE
	var json = {
	  type: 2,
	  code: ($(".resume-extra-info").text().match(/(?<=：).*?(?=\|)/g))[0]
	}
	// text-error 是个啥？取得是页面的class  （这里先引用原有逻辑）
	var ohasone = document.getElementsByClassName('text-error');
	var hasone = false
	if (ohasone.length == 2) {
	  hasone = false
	} else {
	  hasone = true;
	  // 获取手机号， 如果得不到获取两张图片 分别区分是 phone/e-mail
	  // 得到手机号和email图片之后， 分别进行base64转换 （页面现成的convertImgToBase64方法）
	  var phone = $(".connect-box img")[0];
	  var eMail = $(".connect-box img")[1];
	  phone && convertImgToBase64(phone.src, function (b64) {
		phone.src = b64;
		phone.className = "telphone";
		resumeDom = $("div[class=resume-body]");
		getResumeDataHtml(resumeDom, json, hasone)
	  }); /*图片*/
	  eMail && convertImgToBase64(eMail.src, function (b64) {
		eMail.src = b64;
		eMail.className = "email";
		resumeDom = $("div[class=resume-body]");
	  }); /*图片*/
	  if (!phone) {
		resumeDom = $("div[class=resume-body]");
		getResumeDataHtml(resumeDom, json, hasone)
	  }
	}
  };
  // 猎聘的逻辑
  $().ready(function () {
	var $exp = $('#resume-detail-work-info');
	var iExpReadyCheck = setInterval(check, 500)
	var iExpReadyCheckLoopCount = 0
	//猎聘的特殊处理
	function check() {
	  iExpReadyCheckLoopCount = iExpReadyCheckLoopCount + 1
	  $exp = $('#resume-detail-work-info');
	  
	  if (iExpReadyCheckLoopCount > 100) {
		clearInterval(iExpReadyCheck)
		// updateNoResultBody()
		return
	  } else if ($exp.length == 0 || $exp.html().length < 50) {
		return
	  } else {
		clearInterval(iExpReadyCheck);
		setTimeout(_ => {
		  stepNext();
		}, 200)
		
	  }
	}
  });
})()