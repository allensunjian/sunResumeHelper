/**
 *    Create by Allen.sun on 2020/12/08
 *    Module: linkdin
 *    Collaborator: null
 *    Description: 领英入口
 */

!function () {
    let matchMap = sun_config.matchMap;
    let reloadCount = 0;
    snippet();

    window.location.href.indexOf("www.linkedin.com/in") >= 0  && $().ready(() => {
        sunHelper__utils.logShortcut.start("领英(LinkeDin)");
        let resumeDom = null;
        let typeMap = [
            {concantText: "当前职位", scope: function () {
                    return $("h2").filter(".mt1")
                }, unit: "", key: "job"},
            {concantText: "居住地", scope: function () {
                    return $(".pv-top-card--list").eq(1)
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
        ];  // 0 当前职位 1 居住地 2 工作年限 3 教育 4 行业 5 性别 6  年龄 7 工作状态
        let jsonConfig = { type: 7, code: ""};
        let concatDom = function (className,text) {
            return "<div class='"+className+"'>"+text+"</div>"
        };
        let phone = "";
        let eMail = "";
        let concatVM = "";
        let getPhone = function (cb) {
            sunHelper__utils.logger("log")(sunHelper__utils.page + "尝试获取联系方式（手机号/邮箱）")
            $("#pv-top-card .link-without-visited-state").click();
            $("#artdeco-modal-outlet").css({opacity: 0})
            setTimeout(_ => {
                $("#artdeco-modal-outlet").css({opacity: 1})
                cb()
            }, 1000)
        }
        function srollToView () {
            sunHelper__utils.logShortcut.tryScroll();
            document.getElementsByTagName("html")[0].scrollTop = 1000;
        }

        function ContentNext (isNext) {
            let workShowMore = $(".pv-experience-section__see-more .pv-profile-section__see-more-inline");
            let skillsShowMore = $(".pv-skills-section__additional-skills");
            let edusShowMore = $("#education-section .pv-profile-section__see-more-inline")
            resumeDom = $(".core-rail");
            if ((resumeDom.length === 0 ||
                $(".pv-top-card--list").length === 0 ||
                $(".pv-entity__position-group-pager").length === 0) && !isNext)
            {
                reloadCount && sunHelper__utils.logShortcut.wait(reloadCount);
                reloadCount < 10
                    ? setTimeout(_ => {reloadCount++;ContentNext(); reloadCount == 3 && srollToView()}, 1000)
                    : ContentNext(true);
                return
            }

            if (workShowMore.length > 0 && !workShowMore.attr("hasMore")) {
                workShowMore.click();
                workShowMore.attr("hasMore", true)
                sunHelper__utils.logger("log")(sunHelper__utils.page + "尝试获取更多工作工作经历")
                setTimeout(_ => {ContentNext()}, 1000)
                return
            }
            $(".inline-show-more-text__button").click();

            if (skillsShowMore.length > 0 && !skillsShowMore.attr("hasMore")) {
                skillsShowMore.click();
                skillsShowMore.attr("hasMore", true)
                sunHelper__utils.logger("log")(sunHelper__utils.page + "尝试获取更多技能")
                setTimeout(_ => {ContentNext()}, 1000)
                return
            }


            if (edusShowMore.length > 0 && !edusShowMore.attr("hasMore")) {
                edusShowMore.click()
                edusShowMore.attr("hasMore", true)
                sunHelper__utils.logger("log")(sunHelper__utils.page + "尝试获取更多教育经历")
                setTimeout(_ => {ContentNext()}, 1000)
                return
            }
            $("#line-clamp-show-more-button")[0] &&  $("#line-clamp-show-more-button")[0].click();

            sunHelper__utils.logShortcut.getSuccess();

            getPhone(function () {
                phone = $(".ci-phone .t-normal").eq(0).text();
                eMail = $(".ci-email .pv-contact-info__contact-link").text();
                $(".artdeco-modal__dismiss").click();
                phone && (concatVM += concatDom("rnssPhoneNumber", phone));
                eMail && (concatVM += concatDom("rnssEMail", eMail));

                createSystemAssociation($(".core-rail"),
                    {
                        concatVM,
                        mainControll: $("body"),
                        detailControll: function () {
                            return $(".pv-top-card--list")
                        },
                        resumeBodyClassName: [
                            $("#experience-section"),
                            $(".pv-about-section"),
                            $(".pv-skill-categories-section"),
                            $("#education-section")
                        ],
                        workDiffControll: function () {
                            return $("#experience-section li .pv-entity__summary-info .pv-entity__secondary-title")
                        },
                        matchMap
                    }, jsonConfig ,"", typeMap, function () {
                        $("head").append("<style> " +
                            "#sunHelperResumebar { top: 0; } " +
                            "#parasiticDetail {margin-top: 54px} " +
                            ".artdeco-modal {top: 160px !important;}" +
                            ".pv-profile-sticky-header--is-showing {top: 85px !important;}" +
                            ".authentication-outlet {padding-top: 0}" +
                            "</style>");
                    });
            })
        };
        ContentNext();
    })

    function snippet () {
        function sun_injector_center_v01 (type) {
            let pathName = window.location.pathname;
            let linkeDinMethods = {
                removeFrameStructure: function () {
                    let fs = document.getElementById("parasiticDetail");
                    fs && fs.remove();
                },
                pageReload: function () {
                    window.location.reload();
                }
            };
            return function () {
                let currentPathName = window.location.pathname;
                if (currentPathName.indexOf("/in") >= 0) {
                    (pathName.indexOf(currentPathName) >= 0 || currentPathName.indexOf(pathName) >= 0)
                        ? ""
                        : linkeDinMethods.pageReload();
                    return
                };
                linkeDinMethods.removeFrameStructure();
            }
        }
        var scriptMain = document.createElement("script");
        var scriptPart =  document.createElement("script");
        scriptMain.setAttribute('src', chrome.extension.getURL("src/js/core/linkedin-interceptor.js"));
        scriptPart.innerText= sun_injector_center_v01.toString();
        document.documentElement.appendChild(scriptPart);
        document.documentElement.appendChild(scriptMain);
    }
} ();