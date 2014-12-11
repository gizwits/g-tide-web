// JavaScript Document
var maxG = 254.00;//浮点类型
var maxTime = 10; //分钟

var girl_name,boy_name,time;
var sec = 0,t;
var girl_g_ele = $(".girl_g");
var boy_g_ele = $(".boy_g");
var start_time = true;
function GetQueryString(name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r ! = null) return unescape(r[2]); return null;
}
function setName() {
	girl_name = GetQueryString("girl");
	boy_name = GetQueryString("boy");
	if( girl_name == "null" || typeof(girl_name) == "undefined"){
		$(".girl_name").text("");
	}else{
		$(".girl_name").text(girl_name);
	}
	if( boy_name == "null" || typeof(boy_name) == "undefined" ){
		$(".boy_name").text("");
	}else{
		$(".boy_name").text(boy_name);
	}
}
function saveResult(boyName, girlName, time, second) {
	if(window.localStorage){
		var result = new Array();
		var resultItem = {};
		resultItem.boyName = boyName;
		resultItem.girlName = girlName;
		resultItem.time = time;
		resultItem.second = second;
		var jsonString = JSON.stringify(resultItem);
		if(localStorage['result'] == null){
			result.push(jsonString);
			localStorage['result'] = JSON.stringify(result);
		}else{
			result = JSON.parse(localStorage['result']);
			if(result.constructor == Array){
				result.push(jsonString);
				localStorage['result'] = JSON.stringify(result);
			}
		}
	}else{
		console.info('This browser does NOT support localStorage');
	}
}
function clearTimeMeter() {
	clearTimeout(t);
	$(".complete").fadeIn();
	return false;
}
function timeMeter() {
	minute = parseInt(sec / 60);// 分钟数
	if(minute>=60){
	    minute = minute%60
	}
	seconds = sec % 60;
	time = minute + "m" + seconds + "s";
	$(".timer").text(time);
	if(minute == maxTime){
		clearTimeMeter();
		return false;
	}
	sec = sec + 1;
	t = setTimeout(function(){timeMeter();},1000);
}

function fight(ele,num){
	var height = (51*num)/maxG + 29;
	height = height + "%";
	$(ele).animate({height:height},500);
}
function expression(ele,num) {
	var array = new Array();
	if(ele == ".girl_expression"){
		array = ["img/g1.png","img/g2.png","img/g3.png","img/g4.png","img/g5.png"];
	}
	if(ele == ".boy_expression"){
		array = ["img/b1.png","img/b2.png","img/b3.png","img/b4.png","img/b5.png"];
	}
	var bottom = (50*num)/maxG + 22;
	bottom = bottom + "%";
	var src;
	$(ele).animate({bottom:bottom},500,function(){
		if( num < 51 ){
			src = array[0];
		}
		if( num > 50 && num < 101) {
			src = array[1];
		}
		if( num > 100 && num < 151) {
			src = array[2];
		}
		if( num > 150 && num < 201) {
			src = array[3];
		}
		if( num > 200 ) {
			src = array[4];
		}
		$(this).attr("src",src);
	});
}

	var websocket;
	var last_health = -1;
	var gvalue_1 = 0;
	var gvalue_2 = 0;
	var appid = "2415895d7c89453da8e05051301b5572";
		var uid = "7035193c40f1433b9247061f2d7d267e";
		var token = "273df64357134575844ca426dabc7b00";
		var p0_type = "attrs_v4";
		var url = "ws://m2m.gizwits.com:8080/ws/app/v1";
		var did1="FARBuG8potLbidPpupndUE";
		var did2="ZvxAYGhhtg3Q3JtUigokjK";

	
	// == connection functions ===================================================
	function connect() {
		wsHost = url;
		websocket = new WebSocket(wsHost);
		
		websocket.onopen = function(evt) {
			onOpen(evt);
			//打开通道以后需要登录
			opLogin();
			//每三分钟发送一次心跳包
			st = setInterval(function() {
				keepAlive();
			}, 180000);
		};
		websocket.onclose = function(evt) {
			onClose(evt);
		};
		websocket.onmessage = function(evt) {
			onMessage(evt);
		};
		websocket.onerror = function(evt) {
			onError(evt);
		};
	};

	function keepAlive() {
		if (last_health != -1 && (new Date().getTime() - last_health > 180000)) {
			clearInterval(st);
			disconnect();
			connect();
		} else {
			opPing();
		}
	};

	function disconnect() {
		websocket.close();
	};

	// == send functions ===================================================
	
	function sendJson(json) {
		var data = JSON.stringify(json);
		return sendData(data);
	};

	function sendData(data) {
		if (websocket.readyState == websocket.OPEN) {
			websocket.send(data);
		
			return true;
		} else {
		
			return false;
		}
		;
	};

	// == websocket callbacks =============================================
	function onOpen(evt) {
	console.log('open');
	};

	function onClose(evt) {
		console.log('close');
	};

	function onMessage(evt) {
		var res = JSON.parse(evt.data);
		console.log(res);
		switch (res.cmd) {
		case "pong":
			last_health = new Date().getTime();
		
			break;
		case "login_res":
			var data = res.data;
			if (data.success == true) {
				console.log("login success!");
			} else {
				console.log("login failed!");
			}
			;
			break;
			case "s2c_noti":
				var data = res.data;
				if(start_time){
					timeMeter();
					start_time = false;
				}
				if(data.did==did1){
					var cmdText='{"cmd": "c2s_write","data":{"did": "'+did2+'","attrs": {"gvalue": '+data.attrs.gvalue+'}}}';
					console.log(cmdText);
					gvalue_1 = data.attrs.gvalue;
					fight(".girl_g",gvalue_1);
					expression(".girl_expression",gvalue_1);
					if( gvalue_1 > 250 && gvalue_2 > 250 ){
						var cmdText1='{"cmd": "c2s_write","data":{"did": "'+did1+'","attrs": {"gvalue":'+maxG+'}}}';
						var cmdText2='{"cmd": "c2s_write","data":{"did": "'+did2+'","attrs": {"gvalue":'+maxG+'}}}';
						sendData(cmdText1);
						sendData(cmdText2);
						fight(".girl_g",maxG);
						fight(".boy_g",maxG);
						expression(".girl_expression",maxG);
						expression(".boy_expression",maxG);
						clearTimeMeter();
						disconnect();
						break;
					}else{
						sendData(cmdText);
					}
				}else{
					var cmdText='{"cmd": "c2s_write","data":{"did": "'+did1+'","attrs": {"gvalue": '+data.attrs.gvalue+'}}}';
					console.log(cmdText);
					gvalue_2 = data.attrs.gvalue;
					fight(".boy_g",gvalue_2);
					expression(".boy_expression",gvalue_2);
					sendData(cmdText);
					if( gvalue_1 > 250 && gvalue_2 > 250 ){
						var cmdText1='{"cmd": "c2s_write","data":{"did": "'+did1+'","attrs": {"gvalue":'+maxG+'}}}';
						var cmdText2='{"cmd": "c2s_write","data":{"did": "'+did2+'","attrs": {"gvalue":'+maxG+'}}}';
						sendData(cmdText1);
						sendData(cmdText2);
						fight(".girl_g",maxG);
						fight(".boy_g",maxG);
						expression(".girl_expression",maxG);
						expression(".boy_expression",maxG);
						clearTimeMeter();
						disconnect();
						break;
					}else{
						sendData(cmdText);
					}
				}
				
				break;
			default:
				break;
		}
	};

	function onError(evt) {
		console.log("error");
	};

	// == operation functions =============================================
	function opToggleConn() {
		if (websocket != undefined && websocket.readyState == websocket.OPEN) {
			disconnect();
		} else {
			connect();
		}
		;
	};

	function opLogin() {
		var Json = {
			cmd : "login_req",
			data : {
				appid : appid,
				uid : uid,
				token : token,
				p0_type : p0_type,
				heartbeat_interval : 180
			}
		};
		sendJson(Json);
	};

	function opPing() {
		sendJson({
			cmd : "ping"
		});
	};
	

$(document).ready(function(e) {
	setName();
	$("#play").click(function(e) {
		connect();
        $(".fight").show();
		$(".play_page").hide();
    });
	$(".complete").click(function(e) {
		saveResult ( boy_name, girl_name, time, sec );
        window.location.href = "third.html";
    });
});
