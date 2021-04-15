/**
 *    Create by Allen.sun on 2020/08/10
 *    Module: content-script
 *    Collaborator: null
 *    Description: 简历助手的共有逻辑
 */

/*
 * 更新日志：
 *          1 v5.0.1 增加简历操作组
 *          3 v5.0.3 增加收集号跳转呼出
 *          4 v5.0.4 匹配项改版/寄生标签改版
 *          5 v5.0.5 新增沟通记录
 *          6 v5.0.6 支持领英&&脉脉
 *          7 v5.0.7 脉脉在线简历支持
 *          9 v5.0.9 explore增加处理猎聘白屏的补丁
 * */

!(function () {
    // 简历助手， DOM解析相关公共逻辑'
    var sunHelperHost_pro = "http://staff.risfond.com";
    var isFirstMatchREsume = true;
    var tallyResultItemBaseClass = "tallyResultType";
    var resumeData = {};
    var pageState = 0;
    var sun__resolved_resumeData = null;
    var InersetPosObj = {};
    var settingOptions = {};
    var matchData = {};
    var resumeEnCode = null;
    var sunHelper__utils = {
        page: "未知",
        time: 0,
        logger: function (type) {
            var typeLits = ["log", "warn", "error"];
            var typeMap = {
                log: "日志系统--",
                warn: "提示您--",
                error: "错误警告--"
            };
            let consoleStyleSheet = {
                log: "font-weight: bold; color: #fff;background-image: linear-gradient(-60deg, #16a085 0%, #f4d03f 100%);",
                warn: "font-weight: bold;  color: #fff;background: linear-gradient(to right, #f6d365 0%, #fda085 100%);color: #fff;",
                error: "font-weight: bold; color: #fff;background: linear-gradient(to right, #ff9569 0%, #e92758 100%);"
            };
            if (typeLits.indexOf(type) == -1) return;
            return function (text) {
                console[type]("%c [- sunHelper -] (简历助手) %c" + typeMap[type] + ": " + text, consoleStyleSheet[type], "color: #00009c;margin-left: 10px");
            }
        },
        setTimeStart: function () {
            sunHelper__utils.time = Date.parse(new Date());
        },
        setTimeEnd: function () {
            sunHelper__utils.time = (Date.parse(new Date()) - sunHelper__utils.time);
        },
        getTimeEnd: function () {
            var timer = setTimeout(_ => {
                sunHelper__utils.time = 0;
                clearTimeout(timer);
            });
            return sunHelper__utils.time
        },
        logShortcut: {
            start: function (pageName) {
                sunHelper__utils.page = pageName;
                sunHelper__utils.logger("log")(pageName + " 开始解析...");
            },
            loadRnssResumeData: function () {
                sunHelper__utils.setTimeStart();
                sunHelper__utils.logger("log")(sunHelper__utils.page + " 开始匹配rnss系统简历...");
            },
            createFrameStructureFirst: function () {
                sunHelper__utils.logger("log")(sunHelper__utils.page + " 开始构建寄生外壳...");
            },
            createFrameStructureSecond: function () {
                sunHelper__utils.setTimeEnd();
                sunHelper__utils.logger("log")(sunHelper__utils.page + "解析耗时:" + sunHelper__utils.getTimeEnd()/1000 + "s");
                sunHelper__utils.logger("log")(sunHelper__utils.page + " 开始填充寄生内容...");
            },
            loadRnssResumeDataOK: function () {
                sunHelper__utils.logger("log")(sunHelper__utils.page + " rnss系统简历拉取完毕");
            },
            loadRnssResumeDataFail: function (type, url, data, ret) {
                var typeMap = {
                    1: "返回的数据格式有误",
                    2: "数据异常"
                };
                sunHelper__utils.logger("error")(sunHelper__utils.page + typeMap[type] + ",请求日志：【url】" + url + "【参数】：" + data + (ret ? "【返回值】：" + ret : ""));
                sunHelper__tip(typeMap[type] + ",请F12查看具体信息", 999999, "error");
            },
            showRiskDetailLog: function (riskList) {
                var riskListShow= ( riskList || [] ).length > 0;
                sunHelper__utils.logger(riskListShow ? "log" : "warn")(sunHelper__utils.page + (riskListShow ? "开始填充简历提示" : "请注意，未获取到简历风险"));
            },
            showHighlightDetailLog: function (hightLight) {
                var hightLightShow= ( hightLight || [] ).length > 0;
                sunHelper__utils.logger(hightLightShow ? "log" : "warn")(sunHelper__utils.page + (hightLightShow ? "开始填充简历亮点" : "请注意，未获取到简历亮点"));
            },
            showResumeWorkDiffs: function (list) {
                var hightLightShow= ( list || [] ).length > 0;
                sunHelper__utils.logger(hightLightShow ? "log" : "warn")(sunHelper__utils.page + (hightLightShow ? "开始填充工作差异" : "请注意，未获取到工作差异"));
            },
            tryScroll: function () {
                sunHelper__utils.logger("log")(sunHelper__utils.page + "[试错方案一]尝试获取资源...")
            },
            wait: function (count) {
                sunHelper__utils.logger("warn")(sunHelper__utils.page + "[试错方案二]尝试获取资源..." + count +"次")
            },
            getSuccess: function () {
                sunHelper__utils.logger("log")(sunHelper__utils.page + "获取资源成功")
            }
        }
    };
    var pageModel = {
        JobId: 0
    }

    var FrameStructure = {
        // 简历助手
        createParasiticDom: function () {
            var sunHelperlayout_l = $("<div class='sunhelper__parasitic_leftMod' id='sunhelperLeftMod'>正在匹配人选信息，请稍后...</div>");
            var sunHelperlayout_r = $("<div class='sunhelper__parasitic_rightMod' id='sunhelperRightMod'></div>");
            var sunHelperWrap = $("<div class='sunhelper__parasitic_wrap' id='sunhelperWrap'></div>");
            sunHelperWrap.append(sunHelperlayout_l);
            sunHelperWrap.append(sunHelperlayout_r);
            return sunHelperWrap
        },
        createToLogin: function () {
            var loginWrap = $("<div class='sunhelper__parasitic_toLogin flex__mod-1' id='sunHelperToLogin'>匹配之前需要登录RNSS系统哦 <br/> <span class='sunHelper__font_subtext sunHelper__font_warnning'>如已登录请点击立即刷新</span></div>");
            var btn_toLogin = FrameStructure.pageBtnGroup.btn_toLogin("sunHelprt__btn sunHelprt__btn_primary")
            var btn_refershPage = FrameStructure.pageBtnGroup.btn_refershPage("sunHelprt__btn sunHelprt__btn_primary")
            return {
                context: loginWrap,
                tools: [btn_toLogin, btn_refershPage]
            }
        },
        createToUpdate: function () {
            var btn_download = FrameStructure.pageBtnGroup.btn_download("sunHelprt__btn sunHelprt__btn_primary");
            var wrap = $("<div class='sunhelper__parasitic_toLogin flex__mod-1' id='sunHelperToUpdate'>您的简历助手版本较低，请更新 </div>")
            return {
                context: wrap,
                tools: [btn_download]
            }
        },
        createCannotAnalysis: function () {
            return {
                context: $("<div class='sunhelper__parasitic_cannotAnalysis flex__mod-1' >当前简历无法解析，换一份试试吧</div>"),
            }
        },
        createHanlderTip: function (text) {
            return {
                context: $("<div class='sunhelper__parasitic_toLogin flex__mod-1'>"+text+"</div>")
            }
        },
        createInputToRnss: function (configJson) {
            var inputToRnssWrap = $("<div class='sunhelper__parasitic_toLogin flex__mod-1' id='sunHelperInputToRnss'>未批匹配到系统简历， 可以一键录入到系统哦~ </div>");
            var btn_toRnss = FrameStructure.pageBtnGroup.btn_toRnss("sunHelprt__btn sunHelprt__btn_primary", configJson);
            return {
                context: inputToRnssWrap,
                tools: [btn_toRnss]
            }
        },
        createSettingMod: function () {
            var btn_setting = $("<a href='#'>个性化设置</a>");
            var warp = $("<div class='sunhelper__parasitic_settingMod' style='color: #1265A7; font-weight: 600'>锐仕方达简历助手 </div>");
            // warp.append(btn_setting);
            btn_setting.click(FrameStructureFuncModule.method_setting)
            return warp
        },
        createResumeDetail: function (rnssResumeData) {
            var resumesMatchInfo = rnssResumeData.ResumesMatchInfo
            var phoneNumber = rnssResumeData.MobileNumber[0];
            var email = rnssResumeData.EmailAddress[0];
            var name = rnssResumeData.Name;
            var resumeid = resumesMatchInfo[0].ResumeId;
            var btn_check = FrameStructure.pageBtnGroup.btn_check("sunHelprt__btn sunHelprt__btn_primary", resumeid);
            var btn_refersh = FrameStructure.pageBtnGroup.btn_refersh("sunHelprt__btn sunHelprt__btn_primary", resumeid);
            var btn_visit =  FrameStructure.pageBtnGroup.btn_visit("sunHelprt__btn sunHelprt__btn_primary", resumeid);
            return {
                context: $("<div class='sunhelper__parasitic_resumeDetail'>"+"姓名：" + emptyShell(name) + "&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;" + "电话号码：" + emptyShell(phoneNumber) + "&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;" + "电子邮箱：" + emptyShell(email) + "&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;" + " 简历匹配度：<span>"+ emptyShell(resumesMatchInfo[0].MatchScore) + "%</span><div>"),
                tools:[btn_check, btn_refersh, btn_visit]
            }
        },
        insertToWrap: function ($d) {
            $("#sunhelperWrap").append($d)
        },
        insertAndReplaceToWrap ($o) {
            $("#sunhelperLeftMod").html("");
            $("#sunhelperRightMod").html("");
            $("#sunhelperLeftMod").append(FrameStructure.createSettingMod());
            $("#sunhelperLeftMod").append($o.context);
            $o.tools && $o.tools.forEach(function (tool) {
                $("#sunhelperRightMod").append(tool);
            })

        },
        // 页面按钮集合
        pageBtnGroup: {
            btn_toLogin: function (classes) {
                var btn_toLogin = $("<span class='"+ classes +"'>去登陆</span>");
                btn_toLogin.click(FrameStructureFuncModule.method_tpLogin);
                return btn_toLogin
            },
            btn_refershPage: function (classes) {
                var btn_refershPage = $("<span class='"+ classes +"'>刷新</span>");
                btn_refershPage.click(FrameStructureFuncModule.method_refershPage);
                return btn_refershPage
            },
            btn_download: function (classes) {
                var btn_download = $("<span class='"+ classes +"'>点击下载最新</span>");
                return btn_download
            },
            btn_toRnss: function (classes, configJson) {
                var btn_toRnss = $("<span class='"+ classes +"'>立即录入</span>");
                btn_toRnss.click(FrameStructureFuncModule.method_toRnss(configJson));
                return btn_toRnss
            },
            btn_check: function (classes, id) {
                var btn_check = $("<span class='"+ classes +"'>查看简历</span>");
                btn_check.click(FrameStructureFuncModule.method_check(id));
                return btn_check
            },
            btn_controlls: function (classes, id, configJson) {
                var btn_innerWarp = $("<div class='sunHelper__inner_btnWarp'></div>");
                var btn_can = $("<span class='"+ classes+ "'>简历操作</span>");

                var controllsWarp = $("<span class='sunHelper__controlls_btnWarp'></span>")
                btn_innerWarp.append(controllsWarp);
                var btn_check = $("<span class='sunHelper__innerbtn'>查看</span>");
                var btn_refersh = $("<span class='sunHelper__innerbtn'>更新</span>");
                var btn_toRnss = $("<span class='sunHelper__innerbtn'>录入</span>");
                controllsWarp.append(btn_check).append(btn_refersh).append(btn_toRnss);

                btn_innerWarp.append(btn_can).append(controllsWarp);
                btn_check.click(FrameStructureFuncModule.method_check(id));
                btn_toRnss.click(FrameStructureFuncModule.method_toRnss(configJson));

                btn_refersh.click(FrameStructureFuncModule.method_refersh(id));
                return btn_innerWarp
            },
            btn_visit: function (classes, id) {
                var btn_visit = $("<span class='"+ classes +"'>加入寻访</span>");
                btn_visit.click(FrameStructureFuncModule.method_visit(id));
                return btn_visit
            }
        },
        // 页面寄生助手
        pageParasitic: {
            createWrap: function ($el, data) {
                var warp = $("<div class='sunHelper__detail_wrap' id='parasiticDetail'></div>");
                var dynamicConent = $("<div class='sunHelper__dynamic_content sunHelper__unset'></div>");
                dynamicConent.hide();
                dynamicConent.append(FrameStructure.pageParasitic.createRightBar(data)).append(FrameStructure.pageParasitic.createLeftBar(data));
                warp.append(FrameStructure.pageParasitic.createResumeBar(data)).append(dynamicConent);
                $el.before(warp);
            },
            createResumeBar: function (data) {
                var warp = $("<div class='sunHelper__detail_resumebar' id='sunHelperResumebar'></div>");
                var logoWarp = FrameStructure.pageParasitic.createResumeBarItem(
                    FrameStructure.pageParasitic.createLogoContent(), "sunHelper__logoWrap sunHelper__border_r--before"
                );
                var loading_mod = FrameStructure.pageParasitic.createResumeBarItem(
                    "<div>正在努力搜索人选的联系方式，请稍候……<div>", "sunHelper__textWrap sunHelper__loading"
                );

                warp.append(logoWarp).append(loading_mod);

                return warp
            },
            // 助手頁面寄生 頭部信息
            insertResumeBarContent: function (data, configJson) {
                var warp = $("#sunHelperResumebar");

                var resumeContactInformation = FrameStructure.pageParasitic.createResumeBarItem(
                    FrameStructure.pageParasitic.createConcantContent(data), "sunHelper__concantWarp sunHelper__border_r"
                );

                var resumeInfo = FrameStructure.pageParasitic.createResumeBarItem(
                    FrameStructure.pageParasitic.createInfoContent(data, {}), "sunHelper__infoWarp"
                );

                var controll = FrameStructure.pageParasitic.createResumeBarItem("", "sunHelper__controllWarp" );

                FrameStructure.pageParasitic.createHasResumeControll(controll, data, configJson);

                warp.append(resumeContactInformation).append(resumeInfo).append(controll);

                // 左右無數據支持暫時放在這裏
                FrameStructure.pageParasitic.insertResumeLeftContent(data)
                FrameStructure.pageParasitic.insertResumeRightContent(data)
            },
            // 未匹配到系统简历
            insertResumeBarNoContent: function (configJson, data) {
                var warp = $("#sunHelperResumebar");

                var noContent = FrameStructure.pageParasitic.createResumeBarItem(
                    "<div>很遗憾，没能挖出任何联系方式……该买就买吧！记得要录入系统哦！<div>", "sunHelper__textWrap"
                );

                var controll = FrameStructure.pageParasitic.createResumeBarItem("", "sunHelper__controllWarp" );

                FrameStructure.pageParasitic.createToInputControll(controll, configJson);

                warp.append(noContent).append(controll);

                // 左右無數據支持暫時放在這裏
                FrameStructure.pageParasitic.insertResumeLeftContent(data)
                FrameStructure.pageParasitic.insertResumeRightContent(data)
            },
            // 未登录RNSS系统
            insertResumeToLogin: function () {
                var warp = $("#sunHelperResumebar");

                var noContent = FrameStructure.pageParasitic.createResumeBarItem(
                    "<div>请登录RNSS系统，登录后请点击刷新<div>", "sunHelper__textWrap"
                );
                var controll = FrameStructure.pageParasitic.createResumeBarItem("", "sunHelper__controllWarp" );

                FrameStructure.pageParasitic.createToLoginControll(controll);

                warp.append(noContent).append(controll)
            },
            // 助手左邊部分 UI做了调整， 以前的Left是现在的Right
            insertResumeLeftContent: function (data) {
                var wrap = $("#sunHelperLeftbar");
                var  l_content = FrameStructure.pageParasitic.createLeftConent(data);
                wrap.append(l_content)
            },
            // UI做了调整， 以前的Left是现在的Right
            insertResumeRightContent: function (data) {
                var wrap = $("#sunHelperRightbar");
                var  r_content =  FrameStructure.pageParasitic.createSearchContent(data);
                var requireMentContent =  FrameStructure.pageParasitic.createRequireMentContent(data);
                wrap.append(r_content).append(requireMentContent);
            },
            // 更新助手
            insertUpdateHelper: function () {
                var warp = $("#sunHelperResumebar");
                var toUpdateContent = FrameStructure.pageParasitic.createResumeBarItem(
                    "<div>您的简历助手版本较低，请更新<div>", "sunHelper__textWrap"
                );
                var controll = FrameStructure.pageParasitic.createResumeBarItem("", "sunHelper__controllWarp" );
                // 暂时注释掉更新按钮
                // FrameStructure.pageParasitic.createToUpdateControll(controll);

                warp.append(toUpdateContent).append(controll)
            },
            // 无法解析
            insertCannotAnalysis: function () {
                var warp = $("#sunHelperResumebar");
                var cannotAnalysis = FrameStructure.pageParasitic.createResumeBarItem(
                    "<div>当前简历无法解析，换一份试试吧<div>", "sunHelper__textWrap"
                );
                warp.append(cannotAnalysis);
            },
            createLeftConent: function (data = {}) {
                let mergeWorkDiffs = [];
                var Highlights = data.Highlights || [];
                var RiskInfo = data.RiskInfo || [];
                var workDiffs = data.WorkDiffArr || [];

                sunHelper__utils.logShortcut.showRiskDetailLog(RiskInfo);
                sunHelper__utils.logShortcut.showHighlightDetailLog(Highlights);
                sunHelper__utils.logShortcut.showResumeWorkDiffs(workDiffs);
                var wrap = null,html = "", nodata = "";
                data = {
                    workdiffs: {
                        title: "工作经历差异",
                        num: workDiffs.length,
                        list: workDiffs.map(item => {
                            item.Message = item.Message.replace("系统简历", "<span class='resumehelper__matched_remark'>系统简历</span>");
                            return item.Message
                        })
                    },
                    highlight: {
                        title: "简历亮点",
                        num: Highlights.length,
                        list: Highlights.map(item => item.Description)
                    },
                    risk:{
                        title: "简历提示",
                        num: RiskInfo.length,
                        list: RiskInfo.map(item => item.Description)
                    }
                };

                Object.keys(data).forEach(key => {
                    var {title, num, list} = data[key];
                    num > 0 && (html += `<div class='sunHelper__risk_title ${'title__' + key}'>${title}<span class="sunHelprt__font--subtext sunHelper__layout_pl--4">${num}</span></div>`);
                    list.forEach(itemtext => {
                        html += `<div class="sunHelper__risk_item">${itemtext}</div>`
                    })
                });



                nodata = "<div class='sunHelper__noData'>暂无数据</div>"

                wrap = `<div class='sunHelper__risk sunHelper__scrollbar'>${html ? html : nodata}</div>`;

                return wrap;
            },

            createRequireMentContent: function (data) {
                var wrap = $("<div class='sunHelper__requirement sunHelper__scrollbar' id='requirement'><span class='data-no'>输入职位关键词，可进行智能人岗匹配哦！快来试试吧！</span></div>");
                wrap.on("click", FrameStructureFuncModule.events.event_refershResumeMark)
                return wrap
            },
            updateRequireMentContent: function (data, typeMap, jobid) {
                pageModel.JobId = jobid;
                matchData = data;
                let wrap = $("#requirement");
                let TallyResult = data.TallyResult || [];
                let NoTallyResult = data.NoTallyResult || [];
                let JobRemark = data.SetJobKeyWord || [];
                let workDiffs = resumeData.Data.WorkDiffArr || [];

                let jobRemarkEl = "<div class='sunHelper__remark' id='sunHelper__remark'><span class='common__title'>关键词要求：</span>";
                JobRemark.forEach(function (o, index) {
                    var data = typeMap[o.Type]
                    var result =  o.MatchResult + data.unit;
                    jobRemarkEl += `<a class="jobRemark__item ${'jobRemark__item_remark' + index} jobRemark__item_nomatched" href='#' title="简历关键字"><span class="jobRemark__item_result">${result}</span><span class="jobRemark__item_state">(不匹配)</span></a>`
                });
                JobRemark.length == 0 && (jobRemarkEl += "<span style='color:rgba(0,0,0,.3)'>暂无简历关键字</span>");
                jobRemarkEl += `<span class='jobRemark__item_btn jobRemark__item_btn--refersh' title="点击刷新简历关键字" id="resumeRemarkRefersh"></span>`
                jobRemarkEl += `<a class='jobRemark__item_btn' href='http://staff.risfond.com/apps/viewjob2.aspx?id=${jobid}&tabindex=3' target="_blank">编辑</a>`

                jobRemarkEl += "</div>";

                let accordEl = "<div class='sunHelper__requirement_accord' style='margin-bottom: 0'><span class='common__title'>符合项：</span>";
                TallyResult.forEach(function (o) {
                    var data = typeMap[o.Type]
                    var result =  o.MatchResult + data.unit;
                    accordEl += `<a class="tallyResult__item" href='#' data-type="${o.Type}">${matchMap[o.Type]}匹配(${result})</a>`
                });
                accordEl += "</div>";

                let nonConformityEl = "<div class='sunHelper__requirement_conformity'><span class='common__title'>异常项：</span>";

                NoTallyResult.forEach(function (o) {
                    let data = typeMap[o.Type]
                    let result =  o.MatchResult + data.unit;
                    (result && result !== "null") &&
                    (nonConformityEl += `<span class='sunHelper__requirement_conformity-item noTallyResult' data-type="o.MatchResult" title="${data.concantText}">${matchMap[o.Type]}不匹配(${result})</span>`);
                })

                nonConformityEl +=  "</div>";

                if (TallyResult.length > 0 || NoTallyResult.length > 0 || JobRemark.length > 0) {
                    wrap.html(jobRemarkEl + accordEl + nonConformityEl);
                }

                /*
                 *  组合符合要求的条件
                 * */
                {
                    var mergeMatchData = [];

                    TallyResult && TallyResult.forEach(o => {
                        var type = o.Type;
                        var value = o.MatchResult;
                        var mapItem = typeMap[type];
                        mergeMatchData.push({
                            text: value + mapItem.unit,
                            tip: mapItem.concantText + "匹配",
                            key: mapItem.key,
                            elWarp: mapItem.scope(),
                            type: type
                        })
                    });

                    JobRemark && JobRemark.forEach(function (o, index) {
                        mergeMatchData.push({
                            text: o.MatchResult,
                            tip: "",
                            key: "resumeremark_" + index,
                            elWarp: InersetPosObj.resumeBodyClassName,
                            type: 1375, // 自定义来自职位标签的类型是1375
                            class: "resumehelper__matched_remark"
                        })
                    });
                    /*
                     *      MessageType 说明
                     *      0 缺失 1 公司名称不同 2 起止时间不一致 3职责描述简单
                     *      在页面中只需要判断0, 1 和 2的状态即可
                     * */

                    workDiffs.filter(item => item.MessageType == 1 || item.MessageType == 2 || item.MessageType == 0).forEach((item,index) => {
                        mergeMatchData.push({
                            text: item.ExternalCompanyName,
                            tip: item.Message,
                            key: "workDiffTip_" + index,
                            elWarp: InersetPosObj.workDiffControll,
                            type: 10515,  // 10515 会在 elWarp 的边上创建一个元素用于显示简历助手的提示
                            class: "resumehelper__matched_workDiffTip",
                        })
                    })

                    if (mergeMatchData.length >0)  {
                        FrameStructureFuncModule.methods_setMatchState.reset();
                        FrameStructureFuncModule.methods_hightlight(mergeMatchData)
                    };

                    $("#sunHelperRightbar .sunHelper__requirement_accord .tallyResult__item").on("click", FrameStructureFuncModule.events.event_locating);
                    $("#sunHelperRightbar .sunHelper__requirement_accord .tallyResult__item").on("mouseover", FrameStructureFuncModule.events.event_locatingOver);
                    $("#sunHelperRightbar .sunHelper__requirement_accord .tallyResult__item").on("mouseleave", FrameStructureFuncModule.events.event_locatingLeave);
                }
            },
            /*
             * params
             *   * numCode      職位編號
             *   * posName      職位名稱
             *   * clientName   客戶名稱
             *   * updateTime   更新時間
             * */
            updateSearchListDetail: function (data) {

                var listWrap = $("#seachContentList")

                var lisHeader = "<div class='sunHelper__searchContent_list--header'>" +
                    "<span class='sunHelper__searchContent_listItem'>职位编号</span>" +
                    "<span class='sunHelper__searchContent_listItem'>职位名称</span>" +
                    "<span class='sunHelper__searchContent_listItem'>客户名称</span>" +
                    "<span class='sunHelper__searchContent_listItem'>更新时间</span>" +
                    "</div>"

                var lisBody = "<div class='sunHelper__searchContent_list--body'>" +
                    "<span class='sunHelper__searchContent_listItem sunHelper__ellipsis'>#"+data.numCode+"</span>" +
                    "<span class='sunHelper__searchContent_listItem sunHelper__ellipsis'>"+data.posName+"</span>" +
                    "<span class='sunHelper__searchContent_listItem sunHelper__ellipsis'>"+data.clientName+"</span>" +
                    "<span class='sunHelper__searchContent_listItem sunHelper__ellipsis'>"+data.updateTime+"</span>" +
                    "</div>"


                var btn_cancelEl = $("<div class='sunHelper__searchControll_cancel sunHelper__custor'></div>");

                btn_cancelEl.on("click", FrameStructureFuncModule.events.event_resetJobs);

                listWrap.html(lisHeader + lisBody).append(btn_cancelEl);
                $("#searchEl").removeClass("sunHelper__searchContent_shine")
            },
            // 更新沟通记录
            updateGouTongContent: function (list) {

                if (!list || !Array.isArray(list) || list.length == 0) return
                var getFacGouTong = (item) => "<div class='sunHelprt__table_col'>" +
                    "<span class='sunHelprt__table_item'>"+item.StaffName+"</span>"+
                    "<span class='sunHelprt__table_item'>"+item.PositionName+"</span>"+
                    "<span class='sunHelprt__table_item'>"+item.CompanyName+"</span>"+
                    "<span class='sunHelprt__table_item'>"+item.Content+"</span>"+
                    "<span class='sunHelprt__table_item'>"+item.CreatedTimeText+"</span>"+
                    "</div>";
                var ret = "";
                list.forEach(item => ret += getFacGouTong(item));
                $("#goutongDeatail").html(ret);
            },
            createSearchContent: function () {
                var wrap = $("<div class='sunHelper__searchContent_wrap'></div>");
                var searchWrap = $("<div class='sunHelper__searchContent_search'></div>");
                var lisWrap = $("<div class='sunHelper__searchContent_list' id='seachContentList'></div>");

                var conditionsWrap = $("<div class='sunHelper__searchContent_searchResult'></div>");

                var inputEl = $("<input type='text' value='' placeholder='请输入职位关键词' class='sunHelper__searchContent_input sunHelper__searchContent_shine' id='searchEl'>");

                var seachList = $("<div class='sunHelper__searchContent_searchListWrap' id='searchWrap'><ul class='sunHelper__searchContent_searchList sunHelper__scrollbar' id='searchList'></ul></div>");

                inputEl.on("input", FrameStructureFuncModule.events.event_jobSearch);
                inputEl.on("focus", FrameStructureFuncModule.events.event_inputFocus);
                inputEl.on("blur", FrameStructureFuncModule.events.event_inputBlur);
                seachList.on("click", FrameStructureFuncModule.events.event_searchListClick);
                conditionsWrap.append(seachList);
                wrap.append(searchWrap).append(lisWrap);
                searchWrap.append(inputEl).append(conditionsWrap);
                return wrap
            },
            createLogoContent: function () {
                return "<div class='sunHelper__layout_helf' id='sunHelper__logo'></div>" +
                    "<div class='sunHelper__layout_helf sunHelper__sty sunHelper__sty_subtext sunHelper__layout_pl--10 sunHelper__custor' style='font-size: 12px;transform: translateY(-4px);' id='sun_help'>"+helper_version+"</div>" +
                    "<div class='sunHelper__layout_helf size__normal' >简历助手</div>" +
                    "<div class='sunHelper__layout_helf sunHelper__sty_subtext sunHelper__layout_pl--10' ><span class='sunHelper__btn_set sunHelper__custor style__underline' id='sun_setting'>设置</span></div>"
            },
            createConcantContent: function (data) {
                var name = emptyShell(data.Name);
                var email = emptyShell(data.EmailAddress[0]);
                var phonenum = emptyShell(data.MobileNumber[0]);
                var matchScore = emptyShell(data.ResumesMatchInfo[0].MatchScore);
                var lastUpdatedTime = emptyShell(data.LastUpdatedTime)

                return "<div class='sunHelper__layout_40 sunHelper__ellipsis font__weight'>匹配度：<span class='color__bg_yellow'>"+ emptyShell(matchScore) +"%</span></div>" +
                    "<div class='sunHelper__layout_60 sunHelper__ellipsis' title='"+ emptyShell(email) +"'>邮箱："+ emptyShell(email) +"</div>" +
                    "<div class='sunHelper__layout_40 sunHelper__ellipsis'>姓名："+ emptyShell(name) +"</div>" +
                    "<div class='sunHelper__layout_60 sunHelper__ellipsis' >手机号："+ emptyShell(phonenum) +"<i class='sunHelper__icon_phone' id='callThePhone'></i></div>"+
                    "<div class='sunHelper__layout_60 sunHelper__ellipsis sunHelper__ellipsis_updateTime'>更新时间："+ emptyShell(lastUpdatedTime) +"</div>"+
                    "<div class='sunHelper__layout_40 sunHelper__ellipsis sunHelper__ellipsis_goutong' id='sun_goutong'><span class='gongtong_tar'>沟通记录</span></div>";
            },
            createInfoContent: function (data, stateMap) {
                var resumeMatchData = data;
                return (resumeMatchData.Gender && stateMap.Gender ? "<div class='sunhelper__inline'>"+ resumeMatchData.Gender +"&nbsp;•&nbsp;</div>" : "") +
                    (resumeMatchData.LiveLocation  && stateMap.LiveLocation ? "<div class='sunhelper__inline'>"+ resumeMatchData.LiveLocation +" &nbsp;•&nbsp;</div>" : "") +
                    (resumeMatchData.Age > 0 && stateMap.Age ? "<div class='sunhelper__inline'>"+ resumeMatchData.Age +"岁 &nbsp;•&nbsp;</div>" : "") +
                    (resumeMatchData.Education && stateMap.Education ? "<div class='sunhelper__inline'>"+ resumeMatchData.Education +"&nbsp;•&nbsp;</div>" : "") +
                    (resumeMatchData.YearsExperience && stateMap.YearsExperience ? "<div class='sunhelper__inline'>"+ resumeMatchData.YearsExperience +"年工作经验&nbsp;•&nbsp;</div>" : "") +
                    (resumeMatchData.RecentJobTitle && stateMap.RecentJobTitle ? "<div class='sunhelper__inline'>"+ resumeMatchData.RecentJobTitle +"&nbsp;•&nbsp;</div>" : "") +
                    (resumeMatchData.WorkStatus && stateMap.WorkStatus ? "<div class='sunhelper__inline'>"+ resumeMatchData.WorkStatus +" &nbsp;•&nbsp;</div>" : "") +
                    (data.AnnualSalary && stateMap.AnnualSalary > 0 ? "<div class='sunhelper__inline'>目前年薪："+ (data.AnnualSalary/10000).toFixed(0) +"万</div>" : "");
            },
            updateInfoContent: function (dataForm) {
                $(".sunHelper__infoWarp").html(FrameStructure.pageParasitic.createInfoContent(resumeData.Data, {
                    Gender:dataForm.showGender,
                    LiveLocation:dataForm.showLiveLocation,
                    Age:dataForm.showAge,
                    Education:dataForm.showEducation,
                    YearsExperience:dataForm.showYearsExperience,
                    RecentJobTitle:dataForm.showRecentJobTitle,
                    WorkStatus:dataForm.showWorkStatus,
                    AnnualSalary:dataForm.showAnnualSalary,
                }));
            },
            createHasResumeControll: function (wrap,data, configJson) {
                var resumesMatchInfo = data.ResumesMatchInfo
                var resumeid = resumesMatchInfo[0].ResumeId;
                //  var btn_check = FrameStructure.pageBtnGroup.btn_check("sunHelper__parasitic_btn sunHelper__custor", resumeid);
                var btn_refersh = FrameStructure.pageBtnGroup.btn_controlls("sunHelper__parasitic_btn sunHelper__custor", resumeid, configJson);
                var btn_visit =  FrameStructure.pageBtnGroup.btn_visit("sunHelper__parasitic_btn sunHelper__custor", resumeid);
                wrap.append(btn_refersh).append(btn_visit);
                return "控制面板"
            },
            createToLoginControll: function (wrap) {
                var btn_toLogin = FrameStructure.pageBtnGroup.btn_toLogin("sunHelper__parasitic_btn sunHelper__custor");
                var btn_pageRefersh = FrameStructure.pageBtnGroup.btn_refershPage("sunHelper__parasitic_btn sunHelper__custor");
                wrap.append(btn_toLogin).append(btn_pageRefersh);
            },
            createToUpdateControll: function (wrap) {
                var btn_download = FrameStructure.pageBtnGroup.btn_download("sunHelper__parasitic_btn sunHelper__custor");
                wrap.append(btn_download);
            },
            createToInputControll: function (wrap, configJson) {
                var btn_toRnss = FrameStructure.pageBtnGroup.btn_toRnss("sunHelper__parasitic_btn sunHelper__custor", configJson);
                wrap.append(btn_toRnss);
            },
            createResumeBarItem: function (content, className, noBorder) {
                return $("<div id='sunHelperResumebar' class='"+className+"'>"+content+"</div>");
            },
            createLeftBar: function (data) {
                return $("<div class='sunHelper__detail_leftbar content__bar sunHelper__scrollbar' id='sunHelperLeftbar'><div class='sunHelper__parasitic_title--l'>简历提示</div></div>")
            },
            createRightBar: function (data) {
                return $("<div class='sunHelper__detail_rightBar content__bar sunHelper__border_r-e5' id='sunHelperRightbar'><div class='sunHelper__parasitic_title--r'>职位匹配</div></div>")
            }
        },
        // 页面注入设置弹框
        createSettingModal: function () {
            var wrap = $("<div class='sunHelper__setting_modal' id='settingModal'></div>");
            var settingMod = "<div class='sunHelprt__setting_mod' id='sunHelperSettingModal'>" +
                "<div class='sunHelprt__setting_title'>简历助手设置</div>" +
                "<div class='sunHelprt__setting_helperInfo'>" +
                "<div class='sunHelprt__setting_textTitle'>简历助手展示的信息</div>"+
                "<div class='sunHelprt__setting_detailWrap'>" +
                "<div class='sunHelprt__setting_checkitem'><div class='mycheck'><input type='checkbox' data-key='showGender' id='showGender'> <label class='sunHelprt__setting_checklabel' for='showGender'></label><label for='showGender'>性别</label></div></div>" +
                "<div class='sunHelprt__setting_checkitem'><div class='mycheck'><input type='checkbox' data-key='showAge' id='showAge'> <label class='sunHelprt__setting_checklabel' for='showAge'></label><label for='showAge'>年龄</label></div></div>" +
                "<div class='sunHelprt__setting_checkitem'><div class='mycheck'><input type='checkbox' data-key='showLiveLocation' id='showLiveLocation'> <label class='sunHelprt__setting_checklabel' for='showLiveLocation'></label><label for='showLiveLocation'>居住地址</label></div></div>" +

                "<div class='sunHelprt__setting_checkitem'><div class='mycheck'><input type='checkbox' data-key='showEducation' id='showEducation'> <label class='sunHelprt__setting_checklabel' for='showEducation'></label><label for='showEducation'><label for='showEducation'>最高学历</label></label></div></div>" +
                "<div class='sunHelprt__setting_checkitem'><div class='mycheck'><input type='checkbox' data-key='showYearsExperience' id='showYearsExperience'> <label class='sunHelprt__setting_checklabel' for='showYearsExperience'></label><label for='showYearsExperience'>工作年限</label></div></div>" +
                "<div class='sunHelprt__setting_checkitem'><div class='mycheck'><input type='checkbox' data-key='showRecentJobTitle' id='showRecentJobTitle'> <label class='sunHelprt__setting_checklabel' for='showRecentJobTitle'></label><label for='showRecentJobTitle'>当前职位</label></div></div>" +
                "<div class='sunHelprt__setting_checkitem'><div class='mycheck'><input type='checkbox' data-key='showWorkStatus' id='showWorkStatus'> <label class='sunHelprt__setting_checklabel' for='showWorkStatus'></label><label for='showWorkStatus'>工作状态</label></div></div>" +
                "<div class='sunHelprt__setting_checkitem'><div class='mycheck'><input type='checkbox' data-key='showAnnualSalary' id='showAnnualSalary'> <label class='sunHelprt__setting_checklabel' for='showAnnualSalary'></label><label for='showAnnualSalary'>目前年薪</label></div></div>" +
                "</div>"+
                "</div>" +
                "<div class='sunHelprt__setting_helperInfo'>" +
                "<div class='sunHelprt__setting_textTitle'>职位匹配</div>"+
                "<div class='sunHelprt__setting_detailWrap mb-20'>" +
                "<div class='sunHelprt__setting_detailradioWrap'>" +
                "<div class='sunHelprt_radio'><input type='radio' id='sun_on' value='1' name='sun_radio' data-key='showJobMatch'><label for='sun_on' class='radio-label sunHelprt__setting_checklabel'></label><label for='sun_on'>启用</label></div>"+
                "<div class='sunHelprt_radio'><input type='radio' id='sun_off' value='0'  name='sun_radio' data-key='showJobMatch'><label for='sun_off' class='radio-label sunHelprt__setting_checklabel'></label><label for='sun_off'>停用</label></div>"+
                "</div>"+
                "</div>"+
                "</div>" +
                "<div class='sunHelprt__setting_helperInfo'>" +
                //简历亮点 设置迭代
                "<div class='sunHelprt__setting_textTitle'>简历提示"+" <div class=\"switch-container\">\n" +
                "            <input id=\"showAll\" type=\"checkbox\" class=\"switch\" data-key='showAll' />\n" +
                "            <label for=\"showAll\"></label>\n" +
                "        </div>"+"</div>"+
                // "<div class='sunHelprt__setting_detailWrap'>" +
                // "<div class='sunHelprt_radio'><input type='radio' id='sun_on1' value='1'  name='sun_radio1' data-key='showResumeRemind'><label for='sun_on1' class='radio-label sunHelprt__setting_checklabel'></label><label for='sun_on1'>启用</label></div>"+
                // "<div class='sunHelprt_radio'><input type='radio' id='sun_off1' value='0'  name='sun_radio1' data-key='showResumeRemind'><label for='sun_off1' class='radio-label sunHelprt__setting_checklabel'></label><label for='sun_off1'>停用</label></div>"+
                // "</div>"+
                // -------------------------------------
                "<div class='sunHelprt__setting_detailWrap'><span class='sunHelprt__setting_subtitle'>工作经历差异</span>" +
                "<div class='sunHelprt_radio'><input type='radio' class='resumeTipInput' id='sun_on1' value='1'  name='sun_radio1' data-key='showWorkDiff'><label for='sun_on1' class='radio-label sunHelprt__setting_checklabel'></label><label for='sun_on1'>启用</label></div>"+
                "<div class='sunHelprt_radio'><input type='radio' class='resumeTipInput' id='sun_off1' value='0'  name='sun_radio1' data-key='showWorkDiff'><label for='sun_off1' class='radio-label sunHelprt__setting_checklabel'></label><label for='sun_off1'>停用</label></div>"+
                "</div>"+
                // -------------------------------------------------
                "<div class='sunHelprt__setting_detailWrap'><span class='sunHelprt__setting_subtitle'>简历亮点</span>" +
                "<div class='sunHelprt_radio'><input type='radio' class='resumeTipInput' id='sun_on2' value='1'  name='sun_radio2' data-key='showHighlights'><label for='sun_on2' class='radio-label sunHelprt__setting_checklabel'></label><label for='sun_on2'>启用</label></div>"+
                "<div class='sunHelprt_radio'><input type='radio' class='resumeTipInput' id='sun_off2' value='0'  name='sun_radio2' data-key='showHighlights'><label for='sun_off2' class='radio-label sunHelprt__setting_checklabel'></label><label for='sun_off2'>停用</label></div>"+
                "</div>"+
                // -----------------------------------------
                "<div class='sunHelprt__setting_detailWrap'><span class='sunHelprt__setting_subtitle'>简历风险</span>" +
                "<div class='sunHelprt_radio'><input type='radio' class='resumeTipInput' id='sun_on3' value='1'  name='sun_radio3' data-key='showResumeRemind'><label for='sun_on3' class='radio-label sunHelprt__setting_checklabel'></label><label for='sun_on3'>启用</label></div>"+
                "<div class='sunHelprt_radio'><input type='radio' class='resumeTipInput' id='sun_off3' value='0'  name='sun_radio3' data-key='showResumeRemind'><label for='sun_off3' class='radio-label sunHelprt__setting_checklabel'></label><label for='sun_off3'>停用</label></div>"+
                "</div>" +
                "<div class='sunHelprt__setting_footer'>" +
                "<div class='sunHelprt__setting_btn sunHelprt__setting_btn--primary' id='sun_save'>保存设置</div>" +
                "<div class='sunHelprt__setting_btn sunHelprt__setting_btn--disabled' id='sun_cancel'>取消</div>" +
                "</div>" +
                "</div>";
            wrap.append(settingMod);
            $("html").append(wrap);
            FrameStructureFuncModule.domEvent.mount_setting();
        },
        createHelperModal: function () {
            var wrap = $("<div class='sunHelper__setting_modal' id='helperModal'></div>");
            var content = $("<div class='sunHelprt__setting_mod sunHelprt__helper_mod'>" +
                "<div class='sunHelprt__setting_title'>"+helper_version+"版本说明</div>" +
                "<div class='sunHelprt__helper_content'>可以自由个性化控制功能使用，根据大家的工作习惯，点击“个性化设置”，进行设置即可。</div>"+
                "<div class='sunHelprt__helper_subtitle'>职位匹配规则：</div>"+
                "<div class='sunHelprt__helper_content'>优先展示满足所有条件的职位，如不满足所有条件，则根据目前职位＞地区＞年限＞学历＞行业＞年龄 > 职位关键词 进行匹配。</div>"+
                "<div class='sunHelprt__helper_footer'><div class='sunHelprt__setting_btn sunHelprt__setting_btn--primary' id='sun_iknow'>知道了</div></div>"+
                "</div>");
            wrap.append(content);
            $("html").append(wrap);
            FrameStructureFuncModule.domEvent.mount_help();
        },
        createGoutongmodal: function () {
            var wrap = $("<div class='sunHelper__setting_modal' id='goutongModal'></div>");
            var content = $("<div class='sunHelprt__goutong_mod sunHelprt__helper_mod'>" +
                "<div class='sunHelprt__setting_title goutongModal__title'>沟通记录 <i class='icon__close' id='goutongModal_sure' ></i></div>" +
                "<div class='sunHelprt__helper_content sunHelprt__goutong_content'>"+
                "<div class='sunHelprt__table'>" +
                "<div class='sunHelprt__table_header sunHelprt__table_col'>" +
                "<span class='sunHelprt__table_item'>执行人</span>"+
                "<span class='sunHelprt__table_item'>职位</span>"+
                "<span class='sunHelprt__table_item'>公司</span>"+
                "<span class='sunHelprt__table_item'>内容</span>"+
                "<span class='sunHelprt__table_item'>更新时间</span>"+
                "</div>"+
                "<div class='sunHelprt__table_body sunHelper__scrollbar' id='goutongDeatail'>" +
                "<div class='sunHelprt__table_empty'>暂无沟通记录</div>"+
                "</div>"+
                "</div>"+
                "</div>"+
                "</div>");
            wrap.append(content);
            $("html").append(wrap);
            FrameStructureFuncModule.domEvent.mount_goutong();
        }
    };

    var emptyShell = function (val) {
        return val ? val : "--"
    };

    var FrameStructureFuncModule = {
        tallyResultItemBaseFlag: false,
        method_tpLogin: function () {
            window.open("http://staff.risfond.com");
        },
        method_toRnss: function (configJson) {
            return function () {
                /*
                 * type: 7 领英
                 * 作特殊的点击方案
                 */
                if (configJson.type == 7) {
                    FrameStructureFuncModule.events.event_saveResumeEncode(resumeEnCode)
                    return
                }

                FrameStructureFuncModule.method_resethightlight();
                var base = new Base64();
                var type = configJson.type;
                var code = configJson.code;
                var txt = $("html").html();
                var params = [
                    {
                        eltype: "input",
                        name: "type",
                        value: type.toString()
                    },
                    {
                        eltype: "textarea",
                        name: "txt",
                        value: txt
                    },
                    {
                        eltype: "input",
                        name: "code",
                        value: code
                    }
                ];
                var temp_form = document.createElement("form");
                temp_form.action = "http://staff.risfond.com/apps/editresume.aspx";
                temp_form.target = "_blank";
                temp_form.method = "post";
                temp_form.style.display = "none";
                for (var item in params) {
                    var val = params[item].value;
                    var tar= document.createElement(params[item].eltype);
                    tar.name = params[item].name;
                    tar.value = base.encode(val ? val.replace("+", "%2B") : "");
                    temp_form.appendChild(tar);
                }
                document.body.appendChild(temp_form);
                temp_form.submit();
                $(temp_form).remove();
            }
        },
        method_check: function (resumeId) {
            return function () {
                window.open("http://staff.risfond.com/resume/viewresume?id=" + resumeId);
            }
        },
        method_refersh: function (resumeId) {
            return function () {

                window.open("http://staff.risfond.com/apps/editresume.aspx?id=" + resumeId)
            }
        },
        method_visit: function (resumeId) {
            return function () {
                window.open("http://staff.risfond.com/resume/viewresume?id=" + resumeId + "&visit=1&frompage=" + configJson.type)
            }
        },
        method_refershPage: function () {
            window.location.reload();
        },
        method_setting: function () {
            console.log("setting")
        },
        method_resethightlight: function (num) {
            // 页面标签还原过程
            while ($(".resumehelper__matched").length > 0) {
                var $d = $($(".resumehelper__matched")[0]);
                var $parent = $($d.parent());
                $parent.html($parent.html().replace($d.prop("outerHTML"), $d.text().replace(/[\(（][^\)）]+[\)）]$/, "")));
            };
            $(".resumehelper__matched_resumeworkExpDiffTip").remove();
        },
        methods_hightlight: function (applyList) {
            FrameStructureFuncModule.method_resethightlight();
            applyList.forEach(function (item) {
                if (!item.text) return;

                if (typeof item.elWarp == "function") item.elWarp = item.elWarp();

                if (item.elWarp.length > 0 && typeof item.elWarp !== 'string') {
                    Array.prototype.forEach.call(item.elWarp, function (el, idx) {
                        if (typeof el == "function")  el = el();
                        if (!(el instanceof $))  el = $(el)
                        if (el.length > 1) {
                            Array.prototype.forEach.call(el, function (el_single) {
                                set_hightlight($(el_single), item.text, item.tip, item.key, idx, item.type, item.class)
                            });
                            return
                        }
                        set_hightlight($(el), item.text, item.tip, item.key, idx, item.type, item.class)
                    });
                    return
                }
                set_hightlight(item.elWarp, item.text, item.tip, item.key, null, item.type, item.class);
            });

            isFirstMatchREsume && (isFirstMatchREsume = false);

            function set_hightlight ($el,text, tip, key, idx, type, className) {
                if (!$el) return;
                var matchClassName = "resumehelper__match_"+ key + (idx >= 0 ? idx : "");
                var html = $el.html();
                var htmlCopy = "";
                var hasMatched = false;
                if (!html) return;
                let regText = (() => {
                    let patrn = /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im;
                    let count = 0;
                    let retText = "";
                    while(text.length > count) {
                        let char = text.charAt(count);
                        retText += !patrn.test(char) ? char : "\\" + char
                        count++
                    }
                    return retText
                })();
                let reg = new RegExp(regText,"ig");
                let matchVal = html.match(reg)
                let pageValue = matchVal ? matchVal[0] : text;

                htmlCopy = html.replace(reg,
                    "<span class='resumehelper__matched "+ matchClassName + (className ? ' ' + className : '') + "' id='"+tallyResultItemBaseClass + "_" +type+"'>"+pageValue+
                    (tip && type !== 10515 ? "<span class='resumehelper__matched_tip'>(-"+tip+"-)</span>"  : "")+"</span>");
                if (type == 10515 && htmlCopy !== html) $el.after("<div class='resumehelper__matched_resumeworkExpDiffTip'>【简历助手提示您】：" +tip+ "</div>");
                htmlCopy !== html && (hasMatched = true)

                // 匹配到 切 类型是1375（自定义的简历标签类型）
                if ( hasMatched && type == 1375 ) FrameStructureFuncModule.methods_setMatchState.check(text);

                htmlCopy && $el.html(htmlCopy);
            };
        },
        methods_setMatchState: (function () {
            let count = 1;
            let cacheMatchArr = [];
            return {
                check: text => {
                    var timer = setTimeout(_ => {
                        if (cacheMatchArr.indexOf(text) >= 0) return;
                        cacheMatchArr.push(text);
                        Array.prototype.forEach.call($(`#sunHelper__remark>.jobRemark__item_nomatched`), d => {
                            let cs = d.childNodes;
                            let d_text = cs[0];
                            let d_state = cs[1];
                            let domInfo = null;
                            if (d_text.innerText == text) {
                                domInfo = $(d);
                                d.classList.remove("jobRemark__item_nomatched");
                                d_state.innerText = "（匹配）";
                                domInfo.remove();
                                $("#sunHelper__remark .common__title").after(domInfo);
                            };
                        })
                        count ++;
                        clearTimeout(timer)
                    }, 1000 * count)
                },
                reset: () => {
                    count = 1;
                    cacheMatchArr = [];
                }
            }
        })(),
        events: {
            event_refershResumeMark: function (e) {
                if (Array.prototype.indexOf.call(e.target.classList,"jobRemark__item_btn--refersh") >= 0) {
                    FrameStructureFuncModule.events.event_getRequirement(pageModel.JobId, resumeData, typeMap);
                }
            },
            event_postJobData: function (val) {

                reportResumeDataToRnss("http://staff.risfond.com/Extension/GetJobSearchViewList", "get", {
                    keywords: val,
                }, function (res) {

                    try {
                        res = JSON.parse(res)
                    } catch (e) {
                        sunHelper__utils.logShortcut.loadRnssResumeDataFail(1,"/Extension/GetJobSearchViewList", JSON.stringify({keywords: val}), JSON.stringify(res));
                    }

                    var items = "";

                    if (!res.Data) {
                        sunHelper__utils.logShortcut.loadRnssResumeDataFail(2,"/Extension/GetJobSearchViewList", JSON.stringify({keywords: val}), JSON.stringify(res));
                        return;
                    }

                    if (res.Data.length == 0) {
                        $("#searchList").html("<li class='no_data'>没有找到符合条件的职位</li>");
                        return
                    };


                    res.Data.forEach(function (job) {
                        var reg = new RegExp(val);
                        items += `<li class='sunHelper__searchContent_searchList--item' data-name='${job.Title}' data-number='${job.JobId}' data-posname='${job.Title}' data-clientname='${job.ClientName}' data-updatetime='${job.LastUpdateTime}'>${job.Title.replace(reg, "<span class='sunHelper__highlight'>"+val+"</span>")}<span class="sunHelper__searchContent_searchList--client">${job.ClientName}</span></li>`
                    });
                    $("#searchList").html(items);

                })
            },
            event_getRequirement: function (id, obj, typeMap) {
                if(Object.prototype.toString.call(obj.Data) !== "[object Object]") return;
                obj = obj.Data.ResumeMatch || {};
                obj.JobId = id
                reportResumeDataToRnss("http://staff.risfond.com/Extension/GetJobMatchInfo", "get",obj , function (res) {
                    try {
                        res = JSON.parse(res)
                    } catch (e) {
                        sunHelper__utils.logShortcut.loadRnssResumeDataFail(1,"/Extension/GetJobMatchInfo", JSON.stringify(obj));
                    }

                    if (!res.Data) {
                        sunHelper__utils.logShortcut.loadRnssResumeDataFail(2,"/Extension/GetJobMatchInfo", JSON.stringify(obj));
                        return
                    }
                    FrameStructure.pageParasitic.updateRequireMentContent(res.Data, typeMap, id);
                })
            },
            event_jobSearch: (function () {
                var endTime = 0;
                return function (e) {
                    if (e.target.value.length == 0) {
                        $("#searchWrap").s_hide();
                        return
                    };
                    $("#searchWrap").s_show();
                    var startTime = new Date().getTime();
                    if ((startTime - endTime) <= 50) return;
                    endTime = new Date().getTime();
                    FrameStructureFuncModule.events.event_postJobData(e.target.value);
                }
            })(),
            event_getGouTong: function (data) {
                reportResumeDataToRnss("http://staff.risfond.com/Extension/GetResumeCommunicationByResumeId", "get",data , function (res) {
                    try {
                        res = JSON.parse(res)
                    } catch (e) {
                        sunHelper__utils.logShortcut.loadRnssResumeDataFail(1,"/Extension/GetResumeCommunicationByResumeId", JSON.stringify(data), res);
                    }
                    if (res.Data) {
                        FrameStructure.pageParasitic.updateGouTongContent(res.Data);
                    } else {
                        sunHelper__utils.logShortcut.loadRnssResumeDataFail(2,"/Extension/GetResumeCommunicationByResumeId", JSON.stringify(data), JSON.stringify(res));
                    }
                })
            },
            event_postSetData: function (data) {
                if (pageState == 2) {
                    sunHelper__tip("请先登录rnss系统", 30000, "warn");
                    return;
                }
                reportResumeDataToRnss("http://staff.risfond.com/Extension/SetToolInstall", "get",data , function (res) {
                    try {
                        res = JSON.parse(res)
                    } catch (e) {
                        sunHelper__utils.logShortcut.loadRnssResumeDataFail(1,"/Extension/SetToolInstall", JSON.stringify(data), res);
                    }

                    if (res.Data) {
                        FrameStructureFuncModule.domEvent.swicthModState(data);

                        $("#settingModal").s_hide(200);

                        sunHelper__tip("设置成功", 2000, "success");

                        // 暂时用刷新作为 设置数据
                        window.location.reload();

                        // 这里时作为局部刷新使用的， 如果迭代局部刷新 这里需要放开
                        //FrameStructureFuncModule.events.event_getSetData();

                    } else {
                        sunHelper__utils.logShortcut.loadRnssResumeDataFail(2,"/Extension/SetToolInstall", JSON.stringify(data), JSON.stringify(res));
                    }
                })
            },
            event_getSetData: function () {
                reportResumeDataToRnss("http://staff.risfond.com/Extension/GetToolInstall", "post",{} , function (res) {

                    try {
                        res = JSON.parse(res)
                    } catch (e) {
                        sunHelper__utils.logShortcut.loadRnssResumeDataFail(1,"/Extension/GetToolInstall", "", JSON.stringify(res));
                    }

                    if (res.Status == 2) return;

                    if (!res.data && res.Status !== 2) {
                        res.data = {};
                        sunHelper__utils.logShortcut.loadRnssResumeDataFail(2,"/Extension/GetToolInstall", "", JSON.stringify(res));
                        return;
                    }

                    // FrameStructure.pageParasitic.updateRequireMentContent(res.Data);
                    //if (res.Data) alert("设置成功！")
                    FrameStructureFuncModule.domEvent.event_updateSetting(res.data);
                    FrameStructureFuncModule.domEvent.swicthModState(res.data);
                })
            },
            event_inputFocus: function () {
                if ($("#searchEl").val().length == 0) return;
                FrameStructureFuncModule.events.event_postJobData($("#searchEl").val());

            },
            event_searchListClick: function (e) {
                var $tar = $(e.target), data = {};
                if (!$tar.hasClass("sunHelper__searchContent_searchList--item")) return;
                data = {
                    numCode: emptyShell($tar.data("number")) ,
                    posName: emptyShell($tar.data("posname")),
                    clientName: emptyShell($tar.data("clientname")),
                    updateTime: emptyShell($tar.data("updatetime")),
                };
                var id = $tar.data("number");
                pageModel.jobId = id;
                $("#searchEl").val($tar.data("name"));
                FrameStructure.pageParasitic.updateSearchListDetail(data);

                FrameStructureFuncModule.events.event_getRequirement(id, resumeData, typeMap);
                $("#searchWrap").s_hide(200);
            },
            event_inputBlur: function (e) {
                // $("#searchList").s_hide(200);
            },
            event_toggle: function () {
                var height = 0;
                return function () {
                    var show = $(".sunHelper__dynamic_toggle ").hasClass("sunHelper__rotate");
                    show ?
                        FrameStructureFuncModule.events.event_showMod(height) :
                        FrameStructureFuncModule.events.event_hideMod(h => height = h)
                }
            },
            event_showMod: function (height) {
                if (height <= 2) {
                    $(".sunHelper__dynamic_content").css({height: "auto", transform: "rotateX(0)"}).addClass("sunHelper__unset");
                } else {
                    $(".sunHelper__dynamic_content").removeClass("sunHelper__auto");
                    $(".sunHelper__dynamic_content").css({height: height + 'px'});
                    var auto = setTimeout(_ => {
                        $(".sunHelper__dynamic_content").addClass("sunHelper__auto").addClass("sunHelper__unset");
                        clearTimeout(auto)
                    }, 200)
                }

                var timer = setTimeout(function () {
                    $($(".sunHelper__icon_arrow")[0]).removeClass("sunHelper__rotate");
                    window.clearTimeout(timer)
                }, 300)
            },
            event_hideMod: function (fn) {
                $(".sunHelper__dynamic_content").removeClass("sunHelper__unset");
                $(".sunHelper__dynamic_content").removeClass("sunHelper__auto");
                fn($(".sunHelper__dynamic_content").height() + 2);
                $(".sunHelper__dynamic_content").animate({height: 0, transform: "rotateX(90deg)"});
                var timer = setTimeout(function () {
                    $($(".sunHelper__icon_arrow")[0]).addClass("sunHelper__rotate");
                    window.clearTimeout(timer)
                }, 300)
            },
            event_locating: function (e) {
                FrameStructureFuncModule.tallyResultItemBaseFlag = true;
                var $el = $("#" + tallyResultItemBaseClass + "_" + e.target.dataset.type);
                if($el.length == 0) return;
                $el.css({background: "rgba(25, 174, 84, .2)"});
                FrameStructureFuncModule.events.event_scrollToElement($el);
            },
            event_locatingOver: function (e) {
                FrameStructureFuncModule.tallyResultItemBaseFlag = false;
                $("#" + tallyResultItemBaseClass + "_" + e.target.dataset.type).css({background: "rgba(25, 174, 84, .2)"})
            },
            event_locatingLeave: function () {
                if (FrameStructureFuncModule.tallyResultItemBaseFlag) return;
                $(".resumehelper__matched  ").css({background: "transparent"})
            },
            event_scrollToElement: function ($el) {
                $("html,body").animate({
                    scrollTop: $el.offset().top - 300
                }, 500)
            },
            event_resetJobs: function () {
                $("#searchEl").val("");
                $("#seachContentList").html("");
                $("#requirement").html("<span class='data-no'>输入职位关键词，可进行智能人岗匹配哦！快来试试吧！</span>");
                FrameStructureFuncModule.method_resethightlight(2);
                reportResumeDataToRnss("http://staff.risfond.com/Extension/SetToolInstallJob", "get", {}, function (res) {
                    res = JSON.parse(res);
                    if (!res.data) sunHelper__tip("貌似服务器开了一点小差~", 3000,"warn");
                });
                $("#searchEl").addClass("sunHelper__searchContent_shine")
            },
            event_saveResumeEncode (resumeEncode) {
                reportResumeDataToRnss("http://staff.risfond.com/Extension/UploadFiles", "post","Base64File=" +  resumeEncode, function (res) {
                    try {
                        res = JSON.parse(res)
                    } catch (e) {
                        sunHelper__utils.logShortcut.loadRnssResumeDataFail(1,"/Extension/UploadFiles", JSON.stringify({resumeEncode}));
                    }
                    if (!res.data) {
                        sunHelper__utils.logShortcut.loadRnssResumeDataFail(2,"/Extension/UploadFiles", JSON.stringify({resumeEncode}));
                        return
                    }
                    window.open("http://staff.risfond.com/apps/editresume.aspx?key=" + res.data)
                })
            }
        },
        domEvent: {
            event_updateSetting: function (data) {
                settingOptions = data;
                Object.keys(data).forEach(k => {
                    if (k == "showWorkDiff") {
                        data[k] ? $("#sun_on1").prop("checked", true) : $("#sun_off1").prop("checked", true);
                        return
                    }
                    if (k == "showHighlights") {
                        data[k] ? $("#sun_on2").prop("checked", true) : $("#sun_off2").prop("checked", true);
                        return
                    }
                    if (k == "showResumeRemind") {
                        data[k] ? $("#sun_on3").prop("checked", true) : $("#sun_off3").prop("checked", true);
                        return
                    }

                    if (k == "showJobMatch") {
                        if (data[k]) {
                            $("#sun_on").prop("checked", true);
                            //FrameStructure.pageParasitic.updateRequireMentContent(matchData, typeMap, 1);
                        } else {
                            $("#sun_off").prop("checked", true);
                            FrameStructureFuncModule.method_resethightlight();
                        }
                        return
                    }
                    $("#" + k).prop("checked", data[k]);
                });
                FrameStructure.pageParasitic.updateInfoContent(data);
            },
            mount_setting:  function () {
                const resumeTipResumeTars = $(".resumeTipInput");

                $("#sun_setting").on("click", function () {
                    $("#settingModal").fadeIn(200);
                });
                $("#sun_save").on("click", function () {
                    var dataForm = {};
                    var checkboxes = $("#sunHelperSettingModal").find("input[type=checkbox]");
                    var inputs = $("#sunHelperSettingModal").find("input[type=radio]");

                    Array.prototype.forEach.call(checkboxes, function (elem) {
                        var key = elem.dataset.key;
                        dataForm[key] = elem.checked;
                    });
                    Array.prototype.forEach.call(inputs, function (elem) {
                        var key = elem.dataset.key;
                        if (elem.checked) dataForm[key] = elem.value == 1;
                    });
                    FrameStructureFuncModule.events.event_postSetData(dataForm);
                });
                $("#sun_cancel").on("click", function () {
                    $("#settingModal").fadeOut(200);
                    FrameStructureFuncModule.events.event_getSetData();
                });
                $("#showAll").on("click", function (e) {
                    FrameStructureFuncModule.domEvent.settingHelper.controllAllRadios(e.target.checked)
                });
                $(".resumeTipInput").on("click", function () {
                    let switchBarState = 0;
                    Array.prototype.forEach.call(resumeTipResumeTars, function (elem) {
                        var key = elem.dataset.key;
                        elem.checked && (switchBarState += Number(elem.value))
                    });
                    switchBarState > 0 ? $("#showAll").prop("checked", true) : $("#showAll").prop("checked", false);
                });

            },
            mount_goutong: function () {
                setTimeout(_ => {
                    $("#goutongModal_sure").on('click', () => {
                        $("#goutongModal").fadeOut(200);

                    })
                    $("#sun_goutong").on('click', () => {
                        $("#goutongModal").fadeIn(200);
                        FrameStructureFuncModule.events.event_getGouTong({resumeId: resumeData.Data.ResumeIdList[0]});
                    })
                }, 2000);
            },
            settingHelper: {
                controllAllRadios: function (showAll) {
                    let on = "sun_on";
                    let off = "sun_off";
                    let num = 3;
                    while (num > 0) {
                        $("#" + (showAll ? on : off) + num).prop("checked", true);
                        num--;
                    }
                }
            },
            mount_help: function () {
                $("#sun_help").on("click", function () {
                    $("#helperModal").fadeIn(200);
                });
                $("#sun_iknow").on("click", function () {
                    $("#helperModal").fadeOut(200);
                })
            },
            mount_scrollEvents: function () {
                var top = $("#sunHelperResumebar").offset().top;
                $(window).scroll(function() {
                    let toTop = document.documentElement.scrollTop || document.body.scrollTop;
                    //div距离顶部的距离
                    let cSize = top - toTop;
                    if (cSize < 0) {
                        $("#sunHelperResumebar").addClass("fixed__top");
                        $(".sunHelper__dynamic_content").css({marginTop: "10px"})
                    }else {
                        $("#sunHelperResumebar").removeClass("fixed__top");
                        $(".sunHelper__dynamic_content").css({marginTop: "0"})
                    }
                })
            },
            swicthModState: function (data) {
                // 设置职位匹配和风险提示的状态
                var showJobMatch = data.showJobMatch;
                var showResumeRemind = data.showAll;


                if (showJobMatch || showResumeRemind) {
                    var toggleBtn = $("<span class='sunHelper__dynamic_toggle sunHelper__icon_arrow' id='sunHelper__toggel_btn'></span>")
                    toggleBtn.on("click", FrameStructureFuncModule.events.event_toggle());
                    $("#sunHelper__toggel_btn").length == 0 ? $("#parasiticDetail").append(toggleBtn) :  $("#sunHelper__toggel_btn").show();
                    $(".sunHelper__dynamic_content").s_show(200);
                };

                if (!showJobMatch && !showResumeRemind) {
                    $(".sunHelper__dynamic_content").s_hide(200);
                    $("#sunHelper__toggel_btn").hide(500);
                    return
                };

                if (!showJobMatch && showResumeRemind) {
                    $("#sunHelperRightbar").hide(200);
                    $("#sunHelperLeftbar").show(200).animate({flex: 1});
                    return
                };

                if (!showResumeRemind && showJobMatch) {
                    $("#sunHelperLeftbar").hide(200);
                    $("#sunHelperRightbar").show(200).animate({flex: 1});
                    setTimeout(_ => {
                        $("#sunHelperRightbar").css({overflow: "unset"})
                    }, 500)
                    return
                };

                if (showResumeRemind && showJobMatch) {
                    $("#sunHelperRightbar").show(200).animate({flex: "0 0 780px"});
                    $("#sunHelperLeftbar").show(200).css({flex: "0 0 418px"});
                    setTimeout(_ => {
                        $("#sunHelperRightbar").css({overflow: "unset"})
                    }, 500)
                }
            },
        }
    };
// rnssHelprtStatus 简化可读方法
    var switchHelper_r = function (state, fn) {
        /*
         * 简历解析状态
         * 说明， 该状态是 sunhelpStatus == 1 的情况下会有。
         * 4 该网站不支持简历助手
         * 5 在旧版简历助手中的解释是 “未能挖掘到任何联系方式” （条件response.Data.WriteStatus == 1 && response.Data.Count == 0）
         *   进入系统查看简历 (response.Data.WriteStatus == 1 && response.Data.Count > 0) （跳转功能触发）
         *
         * 6 根据已知的邮箱和电话未查询出任何简历 （一键录入功能触发）
         *  ！！！现在的代码得知，“一键录入”和 “进入系统查看简历” 无论何种状态都是需要展示的
         *
         * */
        if (state == 4) {
            //FrameStructure.insertAndReplaceToWrap(FrameStructure.createHanlderTip("简历助手暂时不支持该网站，敬请期待！"));
            return
        }

        if (state == 5) {
            //FrameStructure.insertAndReplaceToWrap(FrameStructure.createHanlderTip("未能挖掘到任何联系方式"));
            return
        }

        if (state == 6) {
            FrameStructure.insertAndReplaceToWrap(FrameStructure.createInputToRnss(this));
            FrameStructure.pageParasitic.insertResumeBarNoContent(this, resumeData.Data);
            return
        }

        // 以上的状态是代码中已知的状态

        // 如果仍未包含上面任意状态码 则返回调用程序
        fn();
    };
// sunhelpStatus 简化可读方法
    var switchHelper_s = function (state, configJson) {

        pageState = state;

        /*
         *  rnss关联简历解析状态
         *  1 正常状态
         *  2 RNSS未登录  操作(跳出按钮去RNSS登录)
         *  3 简历助手需要更新 操作（点击下载， 不知是否保留）
         *  4 无法解析 操作（提示：简历助手可能无法解析该简历，再换一份吧）
         * */
        switch (state) {
            case 1: {
                return switchHelper_r.bind(configJson)
                break;
            };
            case 2: {
                // FrameStructure.insertAndReplaceToWrap(FrameStructure.createToLogin())
                FrameStructure.pageParasitic.insertResumeToLogin();

                break;
            };
            case 3: {
                // FrameStructure.insertAndReplaceToWrap(FrameStructure.createToUpdate());

                FrameStructure.pageParasitic.insertUpdateHelper();
                break;
            };
            case 4: {
                // FrameStructure.insertAndReplaceToWrap(FrameStructure.createCannotAnalysis());

                FrameStructure.pageParasitic.insertCannotAnalysis();
                break;
            }
        }
    }

    var moduleMethods = {
        computedHelperLayout: function () {
            // layout 分两部分
            // 1 body部分的 撑开简历助手空间
            $("body").css({paddingTop: $("#sunhelperWrap").height() + "px"})

            $("#callThePhone").on("click", function () {
                let resumeId = resumeData.Data.ResumeIdList[0];
                let resumePhone = resumeData.Data.MobileNumber[0];
                window.open("http://staff.risfond.com/resume/viewresume?id="+ resumeId +"&showdlg=1&callTophone=" + resumePhone)
            })
        }
    }

    function convertImgToBase64 (url, callback, outputFormat) {
        var canvas = document.createElement('CANVAS'),
            ctx = canvas.getContext('2d'),
            img = new Image()
        img.setAttribute('crossOrigin', 'Anonymous')
        img.onload = function () {
            canvas.height = img.height
            canvas.width = img.width
            ctx.drawImage(img, 0, 0)
            var dataURL = canvas.toDataURL(outputFormat || 'image/png')
            callback.call(this, dataURL)
            canvas = null;
        };
        img.src = url;
    };

//编码
    function Base64() {

        // private property
        const _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        // public method for encoding
        this.encode = function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            input = _utf8_encode(input);
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output +
                    _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                    _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
            };
            return output;
        }

        // public method for decoding
        this.decode = function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (i < input.length) {
                enc1 = _keyStr.indexOf(input.charAt(i++));
                enc2 = _keyStr.indexOf(input.charAt(i++));
                enc3 = _keyStr.indexOf(input.charAt(i++));
                enc4 = _keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = _utf8_decode(output);
            return output;
        }

        // private method for UTF-8 encoding
        const _utf8_encode = function (string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }
            return utftext;
        }

        // private method for UTF-8 decoding
        const _utf8_decode = function (utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;
            while (i < utftext.length) {
                c = utftext.charCodeAt(i);
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return string;
        }
    };

    function setHelperState (state) {
        console.log(state)
    };

// 这里需要读取页面设置，来渲染DOM结构
    function createFrameStructure (inersetPosObj, sunhelpStatus, rnssHelprtStatus, rnssResumeData, configJson, resume) {
        sunhelpStatus == -131 && sunHelper__utils.logShortcut.createFrameStructureFirst();
        var resumesMatchInfo,phoneNumber,email,name,strategyMethod;

        // 首先判断 inersetPos 中是否存在寄生DOM
        //$(".sunhelper__parasitic_wrap").length == 0 && inersetPosObj.mainControll.append(FrameStructure.createParasiticDom());
        $("#sunHelperResumebar").length == 0 && FrameStructure.pageParasitic.createWrap(inersetPosObj.mainControll);
        $("#sunHelperSettingModal").length == 0 && FrameStructure.createSettingModal();
        $("#helperModal").length == 0 && FrameStructure.createHelperModal();
        $("#goutongModal").length == 0 && FrameStructure.createGoutongmodal();

        // 这里的-131是自定义的，意为仅仅用于渲染躯壳。
        if (sunhelpStatus == -131) return;

        sunHelper__utils.logShortcut.createFrameStructureSecond();

        strategyMethod = switchHelper_s(sunhelpStatus, configJson);
        strategyMethod && strategyMethod(rnssHelprtStatus, function () {
            /*
             * 查看后台代码得知 WriteStatus
             * 1没有录入
             * 2录入成功
             * 3录入失败
             * */

            if (rnssResumeData.WriteStatus == 0) {
                // 这里是在实际情况中发现得状态 暂时定位未匹配到简历
                // FrameStructure.insertAndReplaceToWrap(FrameStructure.createInputToRnss(configJson));

                FrameStructure.pageParasitic.insertResumeBarNoContent(configJson, rnssResumeData.Data);

                return;
            };
            if (rnssResumeData.WriteStatus == 1) {
                var count =  rnssResumeData.Count;
                // 创建浮动nav
                // count > 0 ?
                //     FrameStructure.insertAndReplaceToWrap(FrameStructure.createResumeDetail(rnssResumeData)) :
                //     FrameStructure.insertAndReplaceToWrap(FrameStructure.createInputToRnss(configJson));

                // 创建寄生内容
                count > 0 ?
                    FrameStructure.pageParasitic.insertResumeBarContent(rnssResumeData, configJson) :
                    FrameStructure.pageParasitic.insertResumeBarNoContent(configJson, rnssResumeData)


                return
            };
            if (rnssResumeData.WriteStatus == 2) {
                tip("录入成功", 3000, "success")
                return
            };
            if (rnssResumeData.WriteStatus == 3) {
                tip("录入失败", 3000, "error")
                return
            };

        });
        // 更新设置信息
        FrameStructureFuncModule.events.event_getSetData();
        // 挂载滚动
        FrameStructureFuncModule.domEvent.mount_scrollEvents();

        $(".sunHelper__loading").remove();

        moduleMethods.computedHelperLayout();
    };

//页面间通信，向background传递message
    function reportResumeDataToRnss(url, method, data, callback) {
        var str = "?";
        Object.keys(data).forEach((key,index) => {
            str += (index !== 0 ? "&" : "") + `${key}=${data[key]}`;
        })
        var message = {
            type: 'ajax',
            url: method.toLowerCase() == "get" ? url + str : url,
            method: method,
            data: data,
        };
        chrome.runtime.sendMessage(message, function (response) {
            callback(response);
        });
    };

// 创建系统与简历网站的页面关联
    /*
     *  createSystemAssociation 用于创建寄生于页面的HELPER DOM结构
     *  resume 接收一个jquery对象，包含所有的简历相关DOM
     *  inersetPos 寄生结构插入的DOM位置
     *  configJson 解析接口的config json 应该包含 code/type
     *  cb 回调函数
     * */

    function createSystemAssociation (resume, inersetPosObj, configJson, hasone, typeMap, cb) {
        InersetPosObj = inersetPosObj;

        if (resume.length == 0) {
            setHelperState(0);
            return;
        };

        var base = new Base64();

        /**
         *  这里储存简历结构encode
         *  用于领英跳过安全策略的方案
         **/
        resumeEnCode = base.encode(resume.html().replace('+', '%2B') + inersetPosObj.concatVM);
        // 开始寄生功能框架结构
        createFrameStructure(inersetPosObj, -131);
        // 创建完寄生结构，向background推送数据
        sunHelper__utils.logShortcut.loadRnssResumeData();

        reportResumeDataToRnss( sunHelperHost_pro + '/extension/queryresumes',
            'post',
            'type=' +
            configJson.type +
            (hasone !== "" ? ('&hasone='+hasone) : "") +
            '&version=' +
            helper_version +
            '&htmlresume=' +
            resumeEnCode,
            function (response) {
                /*
                 *  rnss关联简历解析状态
                 *  1 正常状态
                 *  2 RNSS未登录  操作(跳出按钮去RNSS登录)
                 *  3 简历助手需要更新 操作（点击下载， 不知是否保留）
                 *  4 无法解析 操作（提示：简历助手可能无法解析该简历，再换一份吧）
                 * */
                let handleBefore = inersetPosObj.resetPageBefore;

                let matchMap = inersetPosObj.matchMap || {};

                if (typeof handleBefore == 'function') { handleBefore() }

                try {
                    response = JSON.parse(response);
                    sunHelper__utils.logShortcut.loadRnssResumeDataOK();
                }catch (e) {
                    sunHelper__utils.logShortcut.loadRnssResumeDataFail(1,"/extension/queryresumes", "简历相关数据", response, response);
                    return
                };

                var sunhelpStatus = response.Status;
                var rnssResumeData = response.Data;

                if (!rnssResumeData) {
                    sunHelper__utils.logShortcut.loadRnssResumeDataFail(2,"/extension/queryresumes", "简历相关数据",  JSON.stringify(response), JSON.stringify(response));
                    return
                };

                var cacheJobData = rnssResumeData.JobSearchView;

                // 保存解析过的简历，用于一键更新
                sun__resolved_resumeData = rnssResumeData.ResumeDTO;

                resumeData = response;
                /*
                 * 简历解析状态
                 * 说明， 该状态是 sunhelpStatus == 1 的情况下会有。
                 * 4 该网站不支持简历助手
                 * 5 在旧版简历助手中的解释是 “未能挖掘到任何联系方式” （条件response.Data.WriteStatus == 1 && response.Data.Count == 0）
                 *   进入系统查看简历 (response.Data.WriteStatus == 1 && response.Data.Count > 0) （跳转功能触发）
                 *
                 * 6 根据已知的邮箱和电话未查询出任何简历 （一键录入功能触发）
                 *  ！！！现在的代码得知，“一键录入”和 “进入系统查看简历” 无论何种状态都是需要展示的
                 * */
                var rnssHelprtStatus = rnssResumeData.Status;

                createFrameStructure(inersetPosObj, sunhelpStatus, rnssHelprtStatus, rnssResumeData, configJson, resume);
                cb && cb(rnssResumeData);
                if (cacheJobData) {
                    FrameStructure.pageParasitic.updateSearchListDetail({
                        numCode: cacheJobData.JobId,
                        posName: cacheJobData.Title,
                        clientName: cacheJobData.ClientName,
                        updateTime: cacheJobData.LastUpdateTime,
                    });
                    $("#searchEl").val(cacheJobData.Title);
                }
                FrameStructureFuncModule.events.event_getRequirement(cacheJobData ? cacheJobData.JobId : 0, resumeData, typeMap);

                window.typeMap = typeMap;
                window.configJson = configJson;
                window.matchMap = matchMap;
            })
    };
    window.createSystemAssociation = createSystemAssociation;
    window.FrameStructureFuncModule = FrameStructureFuncModule;
    window.sunHelper__utils = sunHelper__utils;
    window.convertImgToBase64 = convertImgToBase64;
})();