"use strict";!function(){var matchMap=sun_config.matchMap;sunHelper__utils.logShortcut.start("脉脉(maimai)"),$().ready(function(){var resumeDom=null;!function ContentNext(){var typeMap;0!==(resumeDom=$(".main___1fJUR")).length&&$(".name___FMaLD h5").html()?(typeMap=[{concantText:"当前职位",scope:function(){return $(".name___FMaLD")},unit:"",key:"job"},{concantText:"居住地",scope:function(){return $(".line2___UHjhk span").eq(0)},unit:"",key:"local"},{concantText:"工作年限",scope:function(){return $(".line2___UHjhk span").eq(4)},unit:"年",key:"year"},{concantText:"教育",scope:function(){return $(".line2___UHjhk span").eq(3)},unit:"",key:"edu"},{concantText:"行业",scope:function(){return $(".rd-info-col-cont").eq(0)},unit:"",key:"indus"},{concantText:"性别",scope:function(){return $(".line2___UHjhk span").eq(1)},unit:"",key:"genter"},{concantText:"年龄",scope:function(){return $(".line2___UHjhk span").eq(2)},unit:"岁",key:"old"},{concantText:"工作状态",scope:function(){return $(".line2___UHjhk span").eq(6)},unit:"",key:"workStatus"}],createSystemAssociation(resumeDom,{mainControll:$("body"),detailControll:$(".main-container"),resumeBodyClassName:$(".main___1fJUR"),workDiffControll:function(){return $(".line1___21GmV")},matchMap:matchMap},{type:15,code:""},"",typeMap,function(){$("head").append("<style> #sunHelperResumebar { top: 0; }</style>")})):setTimeout(ContentNext,1e3)}()})}();