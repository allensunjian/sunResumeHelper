"use strict";!function(){var matchMap=sun_config.matchMap;sunHelper__utils.logShortcut.start("猎聘(liepin)");var getResumeDataHtml=function(resumeDom,json,hasone){var typeMap=[{concantText:"当前职位",scope:function(){return $($(".basic-cont .sep-info")[1])},unit:"",key:"job"},{concantText:"居住地",scope:function(){return $($(".basic-cont .sep-info")[0])},unit:"",key:"local"},{concantText:"工作年限",scope:function(){return $($(".basic-cont .sep-info")[0])},unit:"年",key:"year"},{concantText:"教育",scope:function(){return $($(".basic-cont .sep-info")[0])},unit:"",key:"edu"},{concantText:"行业",scope:function(){return $($(".rd-info-col-cont")[0])},unit:"",key:"indus"},{concantText:"性别",scope:function(){return $($(".basic-cont .sep-info")[0])},unit:"",key:"genter"},{concantText:"年龄",scope:function(){return $($(".basic-cont .sep-info")[0])},unit:"岁",key:"old"},{concantText:"工作状态",scope:function(){return $(".user-status-tag")},unit:"",key:"workStatus"}];$(".rd-info-other-link").click(),createSystemAssociation(resumeDom,{mainControll:$("body"),detailControll:$(".hunt-spin-main"),resumeBodyClassName:[$(".rd-info-col-cont"),function(){return $(".resume-detail-self-evaluation-info")},function(){return $(".job-name")},function(){return $(".tags-box")},function(){return $(".rd-edu-info-item")},function(){return $(".rd-lang-item")},function(){return $(".skill-tag-box")}],workDiffControll:function(){return $(".rd-info-tpl-item-head")},resetPageBefore:function(){Array.prototype.forEach.call($("font"),function(n,index){$(n).before($(n).text()),$(n).remove()})},matchMap:matchMap},json,hasone,typeMap,function(rnssResumeData){$("head").append("<style> body .operation-affixed {top: 84px !important;width: 1200px !important;left: 50%;margin-left: -600px} .hunt-affix {top: 156px !important;} .hfw-header-wrap { position: absolute; top: 0; width: 100%} .sunHelper__detail_wrap {margin-top: 58px}</style>")})};$().ready(function(){var $exp=$("#resume-detail-work-info"),iExpReadyCheck=setInterval(function(){{if(iExpReadyCheckLoopCount+=1,$exp=$("#resume-detail-work-info"),100<iExpReadyCheckLoopCount)return void clearInterval(iExpReadyCheck);if(0==$exp.length||$exp.html().length<50)return;clearInterval(iExpReadyCheck),setTimeout(function(_){var phone,eMail,resumeDom,json,ohasone,hasone;resumeDom=null,json={type:2,code:$(".resume-extra-info").text().match(/(?<=：).*?(?=\|)/g)[0]},ohasone=document.getElementsByClassName("text-error"),hasone=!1,2==ohasone.length?hasone=!1:(hasone=!0,phone=$(".connect-box img")[0],eMail=$(".connect-box img")[1],phone&&convertImgToBase64(phone.src,function(b64){phone.src=b64,phone.className="telphone",resumeDom=$("div[class=resume-body]"),getResumeDataHtml(resumeDom,json,hasone)}),eMail&&convertImgToBase64(eMail.src,function(b64){eMail.src=b64,eMail.className="email",resumeDom=$("div[class=resume-body]")}),phone||(resumeDom=$("div[class=resume-body]"),getResumeDataHtml(resumeDom,json,hasone)))},200)}},500),iExpReadyCheckLoopCount=0})}();