
// Cookie functions for storing and getting data
function setCookie(cname,cvalue,exdays) {
    var d = new Date(); 
    d.setTime(d.getTime() + (exdays*1000*60*60*24));
    var expires = "expires=" + d.toGMTString(); 
    window.document.cookie = cname+"="+cvalue+"; "+expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var cArr = window.document.cookie.split(';');
    for(var i=0; i<cArr.length; i++) {
        var c = cArr[i].trim();
        if (c.indexOf(name) == 0) 
            return c.substring(name.length, c.length);
    }
    return "";
}

function deleteCookie(cname) {
    var d = new Date();
    d.setTime(d.getTime() - (1000*60*60*24));
    var expires = "expires=" + d.toGMTString();
    window.document.cookie = cname+"="+"; "+expires;
}

function checkCookie() {
    var vistor=getCookie("vistorname");
    if (vistor != "") {
        var welcome_msg = window.document.getElementById('welcome-msg');
        welcome_msg.innerHTML="Welcome "+vistor;
    } else {
       vistor = prompt("What is your name?","");
       if (vistor != "" && vistor != null) {
           setCookie("vistorname", vistor, 30);
       }
    }
}

function updateCookie(cname, cvalue) {

    if(getCookie(cname) == "") {
        console.log('Created cookie with value: ' + JSON.stringify(cvalue))
        let exdays = 365;
        setCookie(cname,cvalue,exdays);
    }
    if(JSON.stringify(cvalue) != getCookie(cname)) {
        deleteCookie(cname);
        let exdays = 365;
        setCookie(cname,cvalue,exdays);
    }
}

// Save color to cookie if there is no color saved
if(getCookie('userColor') != "") {
    $("#color").val(JSON.parse(getCookie('userColor')));
} else {
    document.getElementById("color").value = getRandomHEX();
}   

// If name is empty change value of nametag to cookie value
if(getCookie('userName') != "") {
var nameBox = document.getElementById("name");
nameBox.value = JSON.parse(getCookie('userName'))
}

/*
function setCookie(){
    var cname = window.document.getElementById('cname').value;
    var cvalue = window.document.getElementById('cvalue').value;
    var exdays = window.document.getElementById('exdays').value;
     
    setCookie(cname, cvalue, exdays);
    window.location.reload();
}
 
function deleteCookie(){
    var cname = window.document.getElementById('cname').value;
    deleteCookie(cname);
    window.location.reload();
}
 
function disPlayAllCookies()
{
    var cookieDiv = window.document.getElementById('cookies');
    var cArr = window.document.cookie.split(';');
    for(var i=0; i<cArr.length; i++)
    {
        var pElm = window.document.createElement("p");
        pElm.innerHTML=cArr[i].trim();
        cookieDiv.appendChild(pElm);
    }
}*/