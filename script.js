/* ======================================
   OCEAN GUARDIAN FINAL JAVASCRIPT
   AI SMART OCEAN CLEANING SYSTEM
====================================== */



// ===============================
// LIVE CLOCK
// ===============================


function updateClock(){


let time = new Date();



document.getElementById("clock").innerHTML =

time.toLocaleTimeString();


}



setInterval(updateClock,1000);

updateClock();








// ===============================
// BATTERY SYSTEM
// ===============================


let batteryLevel = 87;



function updateBattery(){


batteryLevel--;



if(batteryLevel <= 20){

batteryLevel = 100;

}



let battery =
document.getElementById("battery");



if(battery){

battery.innerHTML =
batteryLevel + "%";

}



let display =
document.getElementById("batteryDisplay");



if(display){

display.innerHTML =
batteryLevel + "%";

}


}



setInterval(updateBattery,5000);








// ===============================
// PLASTIC COLLECTION COUNTER
// ===============================


let plasticKG = 2450;



function updatePlastic(){


plasticKG += 5;



let counter =
document.getElementById(
"plasticCounter"
);



if(counter){

counter.innerHTML =
plasticKG + " KG";

}


}



setInterval(updatePlastic,7000);








// ===============================
// AI CAMERA IMAGE UPLOAD
// ===============================


let uploadedFile = null;



let upload =
document.getElementById(
"imageUpload"
);



if(upload){



upload.addEventListener(

"change",

function(e){


uploadedFile =
e.target.files[0];



let image =
document.getElementById(
"uploadedImage"
);



if(image && uploadedFile){


image.src =
URL.createObjectURL(
uploadedFile
);



image.style.display =
"block";


}



}

);


}








function scanImage(){


let result =
document.getElementById(
"aiResult"
);



if(!uploadedFile){


result.innerHTML =
"⚠ Upload an ocean image first";


return;


}



result.innerHTML =
"🔍 AI Scanning Image...";





setTimeout(()=>{


let objects=[


"Plastic Bottle",

"Fishing Net",

"Plastic Bag",

"Food Container",

"No Waste Found"


];



let detected =

objects[

Math.floor(

Math.random()

*

objects.length

)

];



let confidence =

Math.floor(

Math.random()*20

)+80;





result.innerHTML =

`
🤖 Detection Complete

<br><br>

Object:
<strong>${detected}</strong>

<br>

Confidence:
<strong>${confidence}%</strong>

<br><br>

Action:

${detected==="No Waste Found"

?

"Continue Monitoring 🌊"

:

"Collecting Waste 🗑️"}

`;



},3000);



}







// ===============================
// MISSION CONTROL
// ===============================



function startMission(){


document.getElementById(
"robotStatus"
).innerHTML =

"Cleaning Mission Active 🚀";


alert(
"Ocean Guardian mission started!"
);


}





function pauseMission(){


document.getElementById(
"robotStatus"
).innerHTML =

"Paused ⏸";


alert(
"Robot paused safely."
);


}





function returnRobot(){


document.getElementById(
"robotStatus"
).innerHTML =

"Returning Base 🏠";


alert(
"Robot returning to base."
);


}

/* ======================================
   LEAFLET REAL OCEAN MAP SYSTEM
====================================== */



let oceanMap;



if(document.getElementById("oceanMap")){


oceanMap = L.map("oceanMap").setView(

[25.2048,55.2708],

5

);





L.tileLayer(

"https://tile.openstreetmap.org/{z}/{x}/{y}.png",

{

maxZoom:18,

}

).addTo(oceanMap);






// Robot Icon


let robotIcon = L.divIcon({

html:"🤖",

className:"robot-icon",

iconSize:[40,40]

});






// Robot Marker


let robotMarker = L.marker(

[25.2048,55.2708],

{

icon:robotIcon

}

)

.addTo(oceanMap)

.bindPopup(

"🤖 Ocean Guardian OG-01<br>Cleaning Active"

);







// Pollution Hotspots


let pollutionLocations = [


[25.8,55.5],

[24.9,56.1],

[26.2,54.8]


];





pollutionLocations.forEach(

function(location){


L.circle(

location,

{

radius:50000,

color:"red",

fillColor:"red",

fillOpacity:0.4

}

)

.addTo(oceanMap)

.bindPopup(

"⚠ Plastic Pollution Hotspot"

);



}

);








// Robot Movement Simulation



let robotLat = 25.2048;

let robotLng = 55.2708;



setInterval(function(){


robotLat +=0.01;

robotLng +=0.01;



robotMarker.setLatLng(

[robotLat,robotLng]

);



},5000);



}









// ======================================
// CHART.JS ANALYTICS
// ======================================



if(document.getElementById("plasticChart")){


new Chart(

document.getElementById(
"plasticChart"
),

{


type:"line",



data:{


labels:[

"Jan",
"Feb",
"Mar",
"Apr",
"May",
"Jun"

],



datasets:[{


label:

"Plastic Collected KG",



data:[

500,
900,
1300,
1700,
2100,
2450

],



borderWidth:3


}]

},



options:{


responsive:true


}



}

);



}









if(document.getElementById("wasteChart")){


new Chart(

document.getElementById(
"wasteChart"
),

{


type:"doughnut",



data:{


labels:[

"Plastic",

"Fishing Waste",

"Other"

],



datasets:[{


data:[

70,
20,
10

],



borderWidth:2


}]

},



options:{


responsive:true


}



}

);



}









if(document.getElementById("oceanHealthChart")){


new Chart(

document.getElementById(
"oceanHealthChart"
),

{


type:"bar",



data:{


labels:[

"Water",

"Marine Life",

"Cleanliness",

"Safety"

],



datasets:[{


label:

"Ocean Health %",



data:[

90,
92,
85,
95

],



borderWidth:2


}]

},



options:{


responsive:true


}



}

);



}









// ======================================
// SOLAR ENERGY SYSTEM
// ======================================



let solarEnergy = 94;



function updateSolar(){



solarEnergy++;



if(solarEnergy>=100){


solarEnergy=70;


}



console.log(

"Solar Energy:",

solarEnergy+"%"

);



}



setInterval(updateSolar,8000);

/* ======================================
   FINAL OCEAN GUARDIAN SYSTEM LOGIC
====================================== */







// ======================================
// LIVE ALERT SYSTEM
// ======================================



let alertMessages = [


"✅ Plastic waste collected successfully",

"⚠ Pollution hotspot detected",

"🐢 Marine animal detected - avoiding area",

"📡 Ocean data uploaded",

"☀ Solar charging activated",

"🤖 AI scan completed"


];





function createAlert(){



let alertBox =
document.querySelector(".alerts");



if(alertBox){



let newAlert =
document.createElement("div");



newAlert.className =
"alert info";



newAlert.innerHTML =

alertMessages[

Math.floor(

Math.random()

*

alertMessages.length

)

];



alertBox.prepend(newAlert);





if(alertBox.children.length>5){


alertBox.removeChild(

alertBox.lastChild

);


}



}



}



setInterval(createAlert,7000);









// ======================================
// AI DECISION SYSTEM
// ======================================



function aiDecision(){



let decisions=[


"Scanning ocean surface",

"Detecting plastic waste",

"Avoiding marine animals",

"Collecting garbage",

"Sending satellite data",

"Charging with solar energy"


];





let choice =

decisions[

Math.floor(

Math.random()

*

decisions.length

)

];



console.log(

"AI Decision:",

choice

);



}





setInterval(aiDecision,4000);









// ======================================
// MARINE SAFETY SYSTEM
// ======================================



function marineProtection(){



let safety=[


"Marine life safe",

"No animals nearby",

"Safe cleaning distance maintained",

"AI protection active"


];





console.log(

"🐢",

safety[

Math.floor(

Math.random()

*

safety.length

)

]

);



}



setInterval(marineProtection,5000);









// ======================================
// ROBOT STATUS AUTOMATION
// ======================================



let cleaningMode=true;



function updateRobotStatus(){



let status =
document.getElementById(
"robotStatus"
);



if(status){



if(cleaningMode){


status.innerHTML =

"Scanning Ocean 🌊";


}

else{


status.innerHTML =

"Collecting Waste 🗑️";


}



cleaningMode =
!cleaningMode;



}



}



setInterval(updateRobotStatus,4000);









// ======================================
// ROBOT 3D ROTATION EFFECT
// ======================================



let rotation = 0;



function rotateRobot(){



let robot =
document.querySelector(
".robot-model"
);



if(robot){



rotation += 5;



robot.style.transform =

"rotateY("+rotation+"deg)";


}



}



setInterval(rotateRobot,100);









// ======================================
// SYSTEM STARTUP
// ======================================



window.onload=function(){



console.log(

"🌊 Ocean Guardian System Started"

);



console.log(

"🤖 AI Module: ONLINE"

);



console.log(

"🛰 Satellite Connection: ACTIVE"

);



console.log(

"☀ Solar Power: ACTIVE"

);



console.log(

"🌊 Ocean Monitoring: ACTIVE"

);



};









// ======================================
// SMOOTH NAVIGATION
// ======================================



document
.querySelectorAll(".sidebar li")
.forEach(

item=>{


item.addEventListener(

"click",

function(){


window.scrollTo({

top:0,

behavior:"smooth"

});


}


);


}

);