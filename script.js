/* =====================================================
   OCEAN GUARDIAN - WEEK 3
   ===================================================== */

let batteryLevel = 87;
let plasticKG = 2450;
let solarEnergy = 94;

let missionActive = false;
let missionPaused = false;
let missionSeconds = 0;
let missionTimer = null;

let uploadedFile = null;

let robotLat = 25.2048;
let robotLng = 55.2708;

let robotMoving = false;
let robotMarker = null;
let oceanMap = null;

let plasticChart = null;
let wasteChart = null;
let oceanHealthChart = null;



/* =====================================================
   FIREBASE / CLOUD FIRESTORE
   ===================================================== */

const firebaseConfig = {
    apiKey: "AIzaSyBbvpMbVw0BsRbzhP3K7n-3f4nrEpBaCGE",
    authDomain: "ocean-guardian-3c430.firebaseapp.com",
    projectId: "ocean-guardian-3c430",
    storageBucket: "ocean-guardian-3c430.firebasestorage.app",
    messagingSenderId: "1008529712670",
    appId: "1:1008529712670:web:fd05b29e7b8fa01dc6f00f",
    measurementId: "G-4R7XY7RT0D"
};

let oceanDb = null;
let firebaseReady = false;
let firebaseSetupMessage = "Connecting to Firebase...";

function setDatabaseStatus(message, isOnline = false) {
    const status = document.getElementById("databaseStatus");
    if (status) {
        status.textContent = message;
        status.classList.toggle("db-online", isOnline);
        status.classList.toggle("db-offline", !isOnline);
    }
}

function initializeOceanFirebase() {
    if (typeof firebase === "undefined") {
        firebaseSetupMessage = "Firebase SDK did not load. Check your internet connection.";
        setDatabaseStatus(firebaseSetupMessage);
        return;
    }

    try {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        oceanDb = firebase.firestore();
        setDatabaseStatus("Signing in securely...", false);

        // Anonymous Authentication must be enabled in Firebase Console.
        firebase.auth().signInAnonymously()
            .then(() => {
                firebaseReady = true;
                firebaseSetupMessage = "Connected to Cloud Firestore";
                setDatabaseStatus(firebaseSetupMessage, true);
                loadRecentActivity();
            })
            .catch((error) => {
                firebaseReady = false;
                firebaseSetupMessage = "Firebase sign-in blocked: " + error.message;
                setDatabaseStatus(firebaseSetupMessage, false);
                console.error("Firebase anonymous sign-in failed:", error);
            });
    } catch (error) {
        setDatabaseStatus("Firebase setup error: " + error.message, false);
        console.error("Firebase initialization failed:", error);
    }
}

async function saveActivity(record) {
    if (!firebaseReady || !oceanDb) {
        createCustomAlert("Database is not connected yet. Check Firebase setup.", "warning");
        return false;
    }

    try {
        await oceanDb.collection("activityRecords").add({
            ...record,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await loadRecentActivity();
        return true;
    } catch (error) {
        console.error("Could not save activity:", error);
        createCustomAlert("Could not save to database: " + error.message, "warning");
        return false;
    }
}

async function loadRecentActivity() {
    const list = document.getElementById("databaseActivityList");
    const count = document.getElementById("databaseRecordCount");
    if (!oceanDb || !firebaseReady || !list) return;

    try {
        const snapshot = await oceanDb.collection("activityRecords")
            .orderBy("createdAt", "desc")
            .limit(10)
            .get();

        if (count) count.textContent = String(snapshot.size);
        if (snapshot.empty) {
            list.innerHTML = '<p class="db-empty">No saved activity yet. Scan an image or record a cleanup to create the first entry.</p>';
            return;
        }

        list.innerHTML = "";
        snapshot.forEach((doc) => {
            const data = doc.data();
            const item = document.createElement("div");
            item.className = "db-activity-item";

            const title = document.createElement("strong");
            title.textContent = data.title || data.type || "Ocean activity";
            const detail = document.createElement("span");
            detail.textContent = data.details || "Saved Ocean Guardian activity";
            const date = document.createElement("small");
            date.textContent = data.createdAt && data.createdAt.toDate
                ? data.createdAt.toDate().toLocaleString()
                : "Just saved";

            item.append(title, detail, date);
            list.appendChild(item);
        });
    } catch (error) {
        console.error("Could not load activity:", error);
        setDatabaseStatus("Connected, but could not read records. Check Firestore rules.", false);
    }
}

window.loadRecentActivity = loadRecentActivity;

/* =====================================================
   CLOCK
   ===================================================== */

function updateClock() {

    const clock = document.getElementById("clock");

    if (clock) {
        clock.textContent =
            new Date().toLocaleTimeString();
    }
}

setInterval(updateClock, 1000);
updateClock();


/* =====================================================
   BATTERY
   ===================================================== */

function updateBattery() {

    if (missionActive && !missionPaused) {
        batteryLevel -= 0.2;
    } else {
        batteryLevel += 0.1;
    }

    batteryLevel =
        Math.max(20, Math.min(100, batteryLevel));

    const battery =
        document.getElementById("battery");

    const display =
        document.getElementById("batteryDisplay");

    const fill =
        document.querySelector(".battery-fill");

    if (battery) {
        battery.textContent =
            Math.round(batteryLevel) + "%";
    }

    if (display) {
        display.textContent =
            Math.round(batteryLevel) + "%";
    }

    if (fill) {
        fill.style.width =
            batteryLevel + "%";

        fill.textContent =
            Math.round(batteryLevel) + "%";
    }
}

setInterval(updateBattery, 5000);


/* =====================================================
   PLASTIC COLLECTION
   ===================================================== */

function updatePlasticDisplay() {

    const counter =
        document.getElementById("plasticCounter");

    const completed =
        document.getElementById("completedPlastic");

    const progress =
        document.getElementById("cleanupProgress");

    const progressBar =
        document.getElementById("cleanupProgressBar");

    const percentage =
        Math.min(
            100,
            (plasticKG / 5000) * 100
        );

    if (counter) {
        counter.textContent =
            Math.round(plasticKG) + " KG";
    }

    if (completed) {
        completed.textContent =
            Math.round(plasticKG) + " KG";
    }

    if (progress) {
        progress.textContent =
            Math.round(percentage) + "%";
    }

    if (progressBar) {
        progressBar.style.width =
            percentage + "%";
    }
}

function collectPlastic(amount = 5) {

    plasticKG += amount;

    updatePlasticDisplay();
    updateCharts();

    saveActivity({
        type: "cleanup",
        title: "Plastic cleanup recorded",
        details: amount + " KG plastic collected",
        amountKg: amount,
        totalPlasticKg: Math.round(plasticKG)
    });

    createCustomAlert(
        "♻️ " + amount +
        " KG plastic collected",
        "success"
    );
}

updatePlasticDisplay();


/* =====================================================
   IMAGE UPLOAD
   ===================================================== */

const upload =
    document.getElementById("imageUpload");

if (upload) {

    upload.addEventListener(
        "change",
        function(event) {

            uploadedFile =
                event.target.files[0];

            const image =
                document.getElementById(
                    "uploadedImage"
                );

            if (image && uploadedFile) {

                image.src =
                    URL.createObjectURL(
                        uploadedFile
                    );

                image.style.display =
                    "block";

                const result =
                    document.getElementById(
                        "aiResult"
                    );

                if (result) {

                    result.innerHTML =
                        "📷 Image uploaded<br><br>" +
                        "Ready for AI scanning 🤖";
                }
            }
        }
    );
}


/* =====================================================
   AI SCANNER
   ===================================================== */

function scanImage() {

    const result =
        document.getElementById("aiResult");

    const object =
        document.getElementById(
            "detectedObject"
        );

    const confidence =
        document.getElementById(
            "aiConfidence"
        );

    const status =
        document.getElementById(
            "aiStatus"
        );

    if (!result) return;

    if (!uploadedFile) {

        result.innerHTML =
            "⚠️ Upload an ocean image first";

        createCustomAlert(
            "⚠️ Please upload an image",
            "warning"
        );

        return;
    }

    result.innerHTML =
        "🔍 AI scanning image...<br><br>" +
        "Analyzing objects 🤖";

    if (status) {
        status.textContent = "Scanning...";
    }

    const camera =
        document.querySelector(
            ".camera-view"
        );

    if (camera) {
        camera.classList.add(
            "ai-scanning"
        );
    }

    setTimeout(function() {

        const objects = [
            "Plastic Bottle",
            "Fishing Net",
            "Plastic Bag",
            "Food Container",
            "Plastic Waste",
            "No Waste Found"
        ];

        const detected =
            objects[
                Math.floor(
                    Math.random() *
                    objects.length
                )
            ];

        const score =
            Math.floor(
                Math.random() * 16
            ) + 84;

        saveActivity({
            type: "scan",
            title: "Image scan completed",
            details: "Detected: " + detected + " | Confidence: " + score + "%",
            detectedObject: detected,
            confidence: score,
            imageName: uploadedFile ? uploadedFile.name : "uploaded image"
        });

        if (camera) {
            camera.classList.remove(
                "ai-scanning"
            );
        }

        if (object) {
            object.textContent =
                detected;
        }

        if (confidence) {
            confidence.textContent =
                score + "%";
        }

        if (status) {
            status.textContent =
                "Complete";
        }

        if (detected === "No Waste Found") {

            result.innerHTML =
                "🤖 <strong>AI Detection Complete</strong>" +
                "<br><br>" +
                "Object: <strong>" +
                detected +
                "</strong>" +
                "<br>" +
                "Confidence: <strong>" +
                score +
                "%</strong>" +
                "<br><br>" +
                "Action: Continue Monitoring 🌊";

        } else {

            result.innerHTML =
                "🤖 <strong>AI Detection Complete</strong>" +
                "<br><br>" +
                "Object: <strong>" +
                detected +
                "</strong>" +
                "<br>" +
                "Confidence: <strong>" +
                score +
                "%</strong>" +
                "<br><br>" +
                "Action: <strong>Collecting Waste 🗑️</strong>";

            createCustomAlert(
                "🤖 AI detected " +
                detected +
                " (" +
                score +
                "%)",
                "warning"
            );

            setTimeout(function() {
                collectPlastic(5);
            }, 1500);
        }

    }, 3000);
}


/* =====================================================
   MISSION CONTROL
   ===================================================== */

function startMission() {

    missionActive = true;
    missionPaused = false;
    robotMoving = true;

    const status =
        document.getElementById(
            "robotStatus"
        );

    const movement =
        document.getElementById(
            "movementStatus"
        );

    const speed =
        document.getElementById(
            "robotSpeed"
        );

    if (status) {
        status.textContent =
            "Cleaning Mission Active 🚀";
    }

    if (movement) {
        movement.textContent =
            "Moving";
    }

    if (speed) {
        speed.textContent =
            "8 km/h";
    }

    startMissionTimer();

    createCustomAlert(
        "🚀 Ocean Guardian mission started!",
        "success"
    );

    moveRobot();
}


function pauseMission() {

    missionPaused = true;
    robotMoving = false;

    const status =
        document.getElementById(
            "robotStatus"
        );

    const movement =
        document.getElementById(
            "movementStatus"
        );

    const speed =
        document.getElementById(
            "robotSpeed"
        );

    if (status) {
        status.textContent =
            "Paused ⏸";
    }

    if (movement) {
        movement.textContent =
            "Paused";
    }

    if (speed) {
        speed.textContent =
            "0 km/h";
    }

    createCustomAlert(
        "⏸ Robot paused safely",
        "warning"
    );
}


function returnRobot() {

    missionActive = false;
    missionPaused = false;
    robotMoving = false;

    stopMissionTimer();

    const status =
        document.getElementById(
            "robotStatus"
        );

    const movement =
        document.getElementById(
            "movementStatus"
        );

    const speed =
        document.getElementById(
            "robotSpeed"
        );

    if (status) {
        status.textContent =
            "Returning Base 🏠";
    }

    if (movement) {
        movement.textContent =
            "Returning";
    }

    if (speed) {
        speed.textContent =
            "5 km/h";
    }

    if (robotMarker) {

        robotLat = 25.2048;
        robotLng = 55.2708;

        robotMarker.setLatLng([
            robotLat,
            robotLng
        ]);

        updateGPSDisplay();

        if (oceanMap) {
            oceanMap.setView(
                [robotLat, robotLng],
                5
            );
        }
    }

    createCustomAlert(
        "🏠 Robot returning to base",
        "info"
    );
}


/* =====================================================
   MISSION TIMER
   ===================================================== */

function startMissionTimer() {

    if (missionTimer) return;

    missionTimer =
        setInterval(function() {

            if (
                !missionActive ||
                missionPaused
            ) return;

            missionSeconds++;

            const minutes =
                Math.floor(
                    missionSeconds / 60
                );

            const seconds =
                missionSeconds % 60;

            const time =
                String(minutes)
                    .padStart(2, "0") +
                ":" +
                String(seconds)
                    .padStart(2, "0");

            document
                .querySelectorAll(
                    ".mission-timer"
                )
                .forEach(function(el) {

                    el.textContent = time;
                });

        }, 1000);
}


function stopMissionTimer() {

    clearInterval(missionTimer);

    missionTimer = null;
}


/* =====================================================
   MAP
   ===================================================== */

function initializeOceanMap() {

    const mapElement =
        document.getElementById(
            "oceanMap"
        );

    if (
        !mapElement ||
        typeof L === "undefined"
    ) {
        return;
    }

    oceanMap =
        L.map("oceanMap")
            .setView(
                [25.2048, 55.2708],
                5
            );

    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 18,
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(oceanMap);


    const robotIcon =
        L.divIcon({

            html: "🤖",

            className:
                "robot-icon",

            iconSize: [
                40,
                40
            ]
        });


    robotMarker =
        L.marker(
            [robotLat, robotLng],
            {
                icon: robotIcon
            }
        )
        .addTo(oceanMap)
        .bindPopup(
            "🤖 Ocean Guardian OG-01<br>" +
            "AI Cleaning Robot"
        );


    const pollutionLocations = [
        [25.8, 55.5],
        [24.9, 56.1],
        [26.2, 54.8]
    ];

    pollutionLocations.forEach(
        function(location) {

            L.circle(
                location,
                {
                    radius: 50000,
                    color: "red",
                    fillColor: "red",
                    fillOpacity: .4
                }
            )
            .addTo(oceanMap)
            .bindPopup(
                "⚠️ Plastic Pollution Hotspot"
            );
        }
    );
}


/* =====================================================
   ROBOT MOVEMENT
   ===================================================== */

function moveRobot() {

    if (
        !oceanMap ||
        !robotMarker ||
        !robotMoving
    ) {
        return;
    }

    robotLat += .01;
    robotLng += .01;

    robotMarker.setLatLng([
        robotLat,
        robotLng
    ]);

    updateGPSDisplay();

    setTimeout(
        moveRobot,
        5000
    );
}


/* =====================================================
   GPS DISPLAY
   ===================================================== */

function updateGPSDisplay() {

    const latitude =
        document.getElementById(
            "latitude"
        );

    const longitude =
        document.getElementById(
            "longitude"
        );

    if (latitude) {
        latitude.textContent =
            robotLat.toFixed(4) + "°";
    }

    if (longitude) {
        longitude.textContent =
            robotLng.toFixed(4) + "°";
    }
}


/* =====================================================
   CHARTS
   ===================================================== */

function initializeCharts() {

    if (typeof Chart === "undefined") {
        return;
    }

    const plasticCanvas =
        document.getElementById(
            "plasticChart"
        );

    if (plasticCanvas) {

        plasticChart =
            new Chart(
                plasticCanvas,
                {
                    type: "line",

                    data: {

                        labels: [
                            "Jan",
                            "Feb",
                            "Mar",
                            "Apr",
                            "May",
                            "Jun",
                            "Now"
                        ],

                        datasets: [{
                            label:
                                "Plastic Collected KG",

                            data: [
                                500,
                                900,
                                1300,
                                1700,
                                2100,
                                2450,
                                plasticKG
                            ],

                            borderWidth: 3,
                            tension: .3
                        }]
                    },

                    options: {
                        responsive: true
                    }
                }
            );
    }


    const wasteCanvas =
        document.getElementById(
            "wasteChart"
        );

    if (wasteCanvas) {

        wasteChart =
            new Chart(
                wasteCanvas,
                {
                    type: "doughnut",

                    data: {

                        labels: [
                            "Plastic",
                            "Fishing Waste",
                            "Other"
                        ],

                        datasets: [{
                            data: [
                                70,
                                20,
                                10
                            ],

                            borderWidth: 2
                        }]
                    },

                    options: {
                        responsive: true
                    }
                }
            );
    }


    const healthCanvas =
        document.getElementById(
            "oceanHealthChart"
        );

    if (healthCanvas) {

        oceanHealthChart =
            new Chart(
                healthCanvas,
                {
                    type: "bar",

                    data: {

                        labels: [
                            "Water",
                            "Marine Life",
                            "Cleanliness",
                            "Safety"
                        ],

                        datasets: [{
                            label:
                                "Ocean Health %",

                            data: [
                                90,
                                92,
                                85,
                                95
                            ],

                            borderWidth: 2
                        }]
                    },

                    options: {
                        responsive: true
                    }
                }
            );
    }
}


function updateCharts() {

    if (!plasticChart) return;

    const data =
        plasticChart
            .data
            .datasets[0]
            .data;

    data[data.length - 1] =
        plasticKG;

    plasticChart.update();
}


/* =====================================================
   SOLAR
   ===================================================== */

function updateSolar() {

    if (missionActive) {
        solarEnergy -= .5;
    } else {
        solarEnergy += .2;
    }

    solarEnergy =
        Math.max(
            70,
            Math.min(100, solarEnergy)
        );

    document
        .querySelectorAll(
            ".solar-energy"
        )
        .forEach(function(el) {

            el.textContent =
                Math.round(
                    solarEnergy
                ) + "%";
        });
}

setInterval(
    updateSolar,
    8000
);


/* =====================================================
   ALERTS
   ===================================================== */

const alertMessages = [

    "✅ Plastic waste collected successfully",

    "⚠️ Pollution hotspot detected",

    "🐢 Marine animal detected - avoiding area",

    "📡 Ocean data uploaded",

    "☀️ Solar charging activated",

    "🤖 AI scan completed",

    "🌊 Ocean conditions monitored",

    "♻️ Waste collection system ready"
];


function createAlert() {

    const alertBox =
        document.querySelector(
            ".alerts"
        );

    if (!alertBox) return;

    const message =
        alertMessages[
            Math.floor(
                Math.random() *
                alertMessages.length
            )
        ];

    createCustomAlert(
        message,
        "info"
    );
}


function createCustomAlert(
    message,
    type = "info"
) {

    const alertBox =
        document.querySelector(
            ".alerts"
        );

    if (!alertBox) return;

    const newAlert =
        document.createElement(
            "div"
        );

    newAlert.className =
        "alert " + type;

    newAlert.innerHTML =
        message;

    alertBox.prepend(
        newAlert
    );

    while (
        alertBox.children.length > 5
    ) {

        alertBox.removeChild(
            alertBox.lastChild
        );
    }
}

setInterval(
    createAlert,
    7000
);


/* =====================================================
   AI DECISIONS
   ===================================================== */

function aiDecision() {

    const decisions = [

        "Scanning ocean surface",

        "Detecting plastic waste",

        "Avoiding marine animals",

        "Collecting garbage",

        "Sending satellite data",

        "Charging with solar energy",

        "Checking pollution hotspot",

        "Planning safest cleaning route"
    ];

    const choice =
        decisions[
            Math.floor(
                Math.random() *
                decisions.length
            )
        ];

    document
        .querySelectorAll(
            ".ai-decision"
        )
        .forEach(function(el) {

            el.textContent =
                choice;
        });
}

setInterval(
    aiDecision,
    4000
);


/* =====================================================
   MARINE SAFETY
   ===================================================== */

function marineProtection() {

    const safety = [

        "Marine life safe",

        "No animals nearby",

        "Safe cleaning distance maintained",

        "AI protection active",

        "Cleaning route adjusted"
    ];

    const choice =
        safety[
            Math.floor(
                Math.random() *
                safety.length
            )
        ];

    console.log(
        "🐢 Marine Safety:",
        choice
    );
}

setInterval(
    marineProtection,
    5000
);


/* =====================================================
   ROBOT STATUS
   ===================================================== */

function updateRobotStatus() {

    const status =
        document.getElementById(
            "robotStatus"
        );

    if (!status) return;

    if (!missionActive) {

        status.textContent =
            "Ready for Mission 🟢";

        return;
    }

    if (missionPaused) {

        status.textContent =
            "Paused ⏸";

        return;
    }

    const statuses = [

        "Scanning Ocean 🌊",

        "Detecting Plastic 🤖",

        "Collecting Waste 🗑️",

        "Checking Marine Life 🐢",

        "Moving to Pollution Zone 🛰️"
    ];

    status.textContent =
        statuses[
            Math.floor(
                Math.random() *
                statuses.length
            )
        ];
}

setInterval(
    updateRobotStatus,
    4000
);


/* =====================================================
   ROBOT ROTATION
   ===================================================== */

let rotation = 0;

function rotateRobot() {

    const robot =
        document.querySelector(
            ".robot-model"
        );

    if (!robot) return;

    rotation += 5;

    robot.style.transform =
        "rotateY(" +
        rotation +
        "deg)";
}

setInterval(
    rotateRobot,
    100
);


/* =====================================================
   AUTOMATIC CLEANING
   ===================================================== */

setInterval(
    function() {

        if (
            missionActive &&
            !missionPaused
        ) {

            collectPlastic(1);
        }

    },
    12000
);


/* =====================================================
   STARTUP
   ===================================================== */

window.addEventListener(
    "load",
    function() {

        console.log(
            "🌊 Ocean Guardian Week 3 Started"
        );

        console.log(
            "🤖 AI Module: ONLINE"
        );

        console.log(
            "🛰 Satellite: ACTIVE"
        );

        console.log(
            "☀️ Solar Power: ACTIVE"
        );

        console.log(
            "♻️ Waste Collection: READY"
        );

        initializeOceanMap();

        initializeCharts();

        updatePlasticDisplay();

        updateBattery();

        updateSolar();

        updateGPSDisplay();

        createCustomAlert(
            "🌊 Ocean Guardian system online",
            "success"
        );
    }
);


/* =====================================================
   KEYBOARD SHORTCUTS
   ===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key.toLowerCase() === "s"
        ) {
            scanImage();
        }

        if (
            event.key.toLowerCase() === "m"
        ) {
            startMission();
        }

        if (
            event.key.toLowerCase() === "p"
        ) {
            pauseMission();
        }

        if (
            event.key.toLowerCase() === "r"
        ) {
            returnRobot();
        }
    }
);

/* Start Firebase after the dashboard markup is available. */
document.addEventListener("DOMContentLoaded", initializeOceanFirebase);
