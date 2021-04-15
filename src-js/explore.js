(function () {
  const Getter = "__defineGetter__";
  
  const UAStroage = "sun_helper_ua";
  
  const agent = "Agent";
  
  const id = "exploreChanger";
  
  const domTypeList = ["documentElement", "createElement", "setAttribute", "insertBefore","textContent", "children", "script", "navigator", "user", "getElementById"];
  
  const $d = document;
  
  const UaConfig = [
	{type: "ios", ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML%2C like Gecko) Mobile/15E148"},
	{type: "firefoxos", ua: "Mozilla/5.0 (Android 6.0.1; Mobile; rv:43.0) Gecko/43.0 Firefox/43.0"},
	{type: "ie11", ua: "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko"},
	{type: "mac", ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:56.0) Gecko/20100101 Firefox/56.0"},
	{type: "linux", ua: "Mozilla/5.0 (X11; Linux i586; rv:31.0) Gecko/20100101 Firefox/31.0"},
	{type: "ibm", ua: "Mozilla/5.0 (OS/2; U; Warp 4.5; en-US; rv:1.7.12) Gecko/20050922 Firefox/1.0.7"},
  ];
  
  const polyfill = [
	function () {
	  return ["id", "polyfillTar"]
	},
	// 创建 script
	function (tagOrNode, attr, val) {
	  var target = null;
	  if (typeof tagOrNode == 'string') {
		target = uaMethods[1]('script');
	  } else {
		target = tagOrNode;
	  }
	  target[domTypeList[2]](attr, val)
	  
	},
	// 保存被删除的元素
	function () {
	  var observer = new MutationObserver(function (arr) {
		arr.forEach(function (mOb) {
		  var addEl = mOb.addedNodes[0];
		  if (addEl && addEl.id == 'resume-detail') {
			polyfill[3](addEl);
			observer.disconnect();
		  }
		});
	  });
	  observer.observe(document, {
		childList: true,
		subtree: true
	  });
	},
	// 监控逻辑
	function (target) {
	  var tryCount = 0;
	  var removedEls = []; // 保存被删除的DOM   暂时不用
	  var observer = new MutationObserver(function (arr) {
		var filterArr = arr.filter(function (mOb) {
		  var removedNodes = mOb.removedNodes;
		  var isRemove = removedNodes.length > 0;
		  return isRemove
		}).map(function (mOb) {
		  return mOb.removedNodes[0]
		});
		
		removedEls = Array.prototype.concat.call(removedEls, filterArr);
		// 如果删除了关键信息， 则重新挂载
		if (!target.textContent) tryMethod();
	  });
	  observer.observe(target, {
		childList: true,
		subtree: true
	  });
	  
	  function tryMethod () {
		sunHelper__tip("【sunHelper】监测到简历信息被【猎聘】安全机制劫持，开始智能破解尝试。", 999999, "warn");
		var retFn = randomExplore();
		retFn(function () {
		  sunHelper__tip("正在尝试最终解决方案", 999999, "warn");
		  remount();
		});
	  };
	  
	  function remount () {
		removedEls.forEach(function (el) {
		  target.appendChild(el)
		});
	  }
	  
	}
  ]
  
  const uaMethods = [
	function () {
	  return $d[domTypeList[0]]
	},
	function (elname) {
	  return $d[domTypeList[1]](elname)
	},
	function (el) {
	  return el
	},
	function (el) {
	  el[domTypeList[2]].apply(el, uaMethods[4]());
	  el[domTypeList[2]].apply(el, uaMethods[5]());
	  return el
	},
	function () {
	  return ["type", "text/javascript"]
	},
	function () {
	  return ["id", "exploreChanger"]
	},
	function (data) {
	  var ua = `${domTypeList[7]}.${Getter}('${domTypeList[8]}${agent}', function () { return '${data.ua}'});`;
	  return ua;
	},
	function (el, data) {
	  el[domTypeList[4]] = uaMethods[6](data);
	  return el
	},
	function (el) {
	  uaMethods[0]()[domTypeList[3]](el,  uaMethods[0]().children[0])
	},
	function () {
	  return $d[domTypeList[9]](id)
	}
  ];
  
  
  
  let _RandomExplore = function () {
	let idx = window.localStorage.getItem(UAStroage) || 0;
	let UaNum = UaConfig.length;
	return function () {
	  var currNum = idx;
	  if (idx >= UaNum)  {
		currNum = 0;
		window.localStorage.setItem(UAStroage, currNum);
		return function (cb) {
		  cb();
		}
	  }
	  sunHelper__tip("【sunHelper】正在尝试方案：【" + (Number(currNum) + 1) + "】， 3秒后刷新", 999999, "warn");
	  _ExploreChanger(UaConfig[currNum], currNum);
	  currNum++;
	  window.localStorage.setItem(UAStroage, currNum);
	  setTimeout(function () {
		window.location.reload(true);
	  },3000)
	}
  };
  
  function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  function _ExploreInit () {
	let uaIdx = window.localStorage.getItem(UAStroage);
	_ExploreChanger(UaConfig[uaIdx], uaIdx);
	polyfill[2]();
  };
  
  function _ExploreChanger (uaData, uaIdx){
	let exploreUaChanger = uaMethods[9]();
	exploreUaChanger && exploreUaChanger.remove();
	chengeUA(uaData || UaConfig[2])
  };
  
  function UAgetter (data) {
	uaMethods[8](uaMethods[7](uaMethods[3](uaMethods[1](domTypeList[6])), data));
	
  };
  
  function chengeUA (uaData) {
	UAgetter(uaData)
  };
  
  var randomExplore = _RandomExplore();
  window.ExploreChanger = _ExploreChanger;
  window.randomExplore = randomExplore;
  
  _ExploreInit();
})()

