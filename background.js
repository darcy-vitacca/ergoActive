let TIME_LIMIT;
let WATER_TIME_LIMIT;
let sittingDefault;
let standingDefault;
let activeDefault;
let waterDefault;

//Get defaults from storage
chrome.runtime.onInstalled.addListener(function (details) {

  let defaultSettings = {
    sittingDefault : 20 * 60,
    standingDefault: 15 * 60,
    activeDefault : 2 * 60,
    waterDefault :30 * 60
  }

chrome.storage.sync.set(defaultSettings, function() {

  sittingDefault = chrome.storage.sync.get(function(result) {
    sittingDefault= result.sittingDefault
    TIME_LIMIT = sittingDefault
    return sittingDefault
  });

standingDefault = chrome.storage.sync.get(function(result) {
  standingDefault = result.standingDefault
  return standingDefault
 });

activeDefault = chrome.storage.sync.get(function(result) {
 activeDefault = result.activeDefault
 return activeDefault
});

waterDefault = chrome.storage.sync.get(function(result) {
  waterDefault = result.waterDefault
  WATER_TIME_LIMIT = waterDefault;
  return waterDefault
 });
});

});

 //Timer
let currentTimerName;
let timeLeft = TIME_LIMIT;
let timePassed = 0;
let timerInterval = null;
let activated = false;

//Water Timer
let waterTimerInterval = null;
let timePassedWater = 0;
let timeLeftWater = WATER_TIME_LIMIT;
let waterActivated = false;
let waterTimerName = 'water'

//Notifications
let iconNotif = chrome.runtime.getURL('images/eactive128.png')
let notif = {
  type: 'basic',
  iconUrl: iconNotif,
  title: '',
  message : '',
  requireInteraction: true
}
let runNotif = function(){
  chrome.notifications.create('swapNotif', notif);
  chrome.notifications.clear('swapNotif');
} 


//Start button
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "start"){
  console.log("Recieved Start");
  sendResponse({ message: "hi to you" });
  if (activated === false){
    activated = true;
    waterActivated = true;
    if (currentTimerName === undefined){
      console.log("This is Sitting")
      startTimer();
      waterTimer();

    } else if (currentTimerName === 'sitting' ){
      console.log("This is Standing")
      startTimer();
      waterTimer();

    }  else if (currentTimerName === 'standing'){
      console.log("This is Standing")
      startTimerStanding();
      waterTimer();

    } else if (currentTimerName === 'active'){
      console.log("This is  Active")
      startTimerActive();
      waterTimer();
  
    } else if (currentTimerName === ''){
      console.log("Program hasn't started")
    } else {
      console.log("Nothing")
    }
    
  }
}
});

let pauseCheck  = function(){
  onTimesUp();
  onTimesUpWater();
  waterTimer();
}
//Pause button
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "pause"){
  console.log("Recieved Pause");
  sendResponse({ message: "hi to you" });
  if (activated === true){
    activated = false;
    waterActivated = false;
    //then pause timer
    if (currentTimerName === undefined){
      console.log("This is Sitting")
      pauseCheck();
      startTimer();

    } else if (currentTimerName === 'sitting' ){
      console.log("This is Sitting")
      pauseCheck();
      startTimer();


    }  else if (currentTimerName === 'standing'){
      console.log("This is Standing")
      pauseCheck();
      startTimerStanding();

    } else if (currentTimerName === 'active'){
      console.log("This is  Active")
      pauseCheck();
      startTimerActive();
  
    } else if (currentTimerName === ''){
      console.log("Program hasn't started")
      onTimesUp();
      onTimesUpWater();
    } else {
      console.log("Nothing")
      onTimesUp();
      onTimesUpWater();
    }
  } else{
    console.log("Nothing is actiavted")
  }
  }
});

//Reset
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {


  if (request.message === "reset"){
    console.log("Recieved Reset");
    //timer
    TIME_LIMIT = sittingDefault
    timePassed = 0 
    currentTimerName = undefined
    timeLeft = TIME_LIMIT
    activated = false;
    //water timer
    WATER_TIME_LIMIT = waterDefault
    timeLeftWater = WATER_TIME_LIMIT
    waterTimerName = waterTimerName
    timePassedWater = 0;
    waterActivated = false;



    onTimesUp();
    onTimesUpWater();
    // send over default values again
    let currentTimer = {
      currentTimeLimit: TIME_LIMIT,
      timeLeft : timeLeft,
      currentTimerName :currentTimerName,
      currentTimePassed : timePassed,
      activated : activated,

      currentTimeLimitWater: WATER_TIME_LIMIT,
      timeLeftWater : timeLeftWater,
      waterName: waterTimerName,
      currentTimePassedWater : timePassedWater,
      waterActivated : waterActivated
    }
    console.log(currentTimer)
    sendResponse(currentTimer);
  
  }
});

//edit 
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "edit"){

      sittingDefault = chrome.storage.sync.get(function(result) {
      sittingDefault= result.sittingDefault
      TIME_LIMIT = sittingDefault
      return sittingDefault
    });
    
    standingDefault = chrome.storage.sync.get(function(result) {
      standingDefault = result.standingDefault
      return standingDefault
    });

    activeDefault = chrome.storage.sync.get(function(result) {
      activeDefault = result.activeDefault
      return activeDefault
    });

    waterDefault = chrome.storage.sync.get(function(result) {
      waterDefault = result.waterDefault
      WATER_TIME_LIMIT = waterDefault;
      return waterDefault
    });
  }
sendResponse("edit recieved")
});



chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "knockknock");
  port.onMessage.addListener(function(msg) {
    let joke = msg.joke 
    console.log(joke)
    if (msg.joke === "Knock knock"){
        let currentTimer = {
          currentTimeLimit: TIME_LIMIT,
          timeLeft : timeLeft,
          currentTimerName :currentTimerName,
          currentTimePassed : timePassed,
          activated : activated,

          currentTimeLimitWater: WATER_TIME_LIMIT,
          timeLeftWater : timeLeftWater,
          waterName: waterTimerName,
          currentTimePassedWater : timePassedWater,
          waterActivated : waterActivated
        }
        console.log(currentTimer)
       port.postMessage(currentTimer);
      }
  });
});



//WATER
function waterTimer() {

  console.log(waterActivated)
  if (waterActivated === true){
    waterTimerInterval =  setInterval(() => {
      console.log("WATER  :" + timeLeftWater)
  
      timePassedWater = timePassedWater += 1;
      timeLeftWater = WATER_TIME_LIMIT - timePassedWater;
    
      if (timeLeftWater === 0) {
        notif['title'] = 'Drink some water'
        notif['message'] =  'Keep yourself hydrated throughout the day for increased producivtiy.'
        runNotif();
        onTimesUpWater();
        WATER_TIME_LIMIT = waterDefault;
        timePassedWater = 0;
        waterTimer();
      }
    }, 1000);
  }else {
    console.log("paused")
  }
}




// 1st timer
function startTimer() {
  console.log(activated)
  if (activated === true){
    timerInterval = setInterval(() => {
      console.log(timeLeft)
      console.log(currentTimerName)
      timePassed = timePassed += 1;
      timeLeft = TIME_LIMIT - timePassed;
      currentTimerName = 'sitting'
  
      if (timeLeft === 0) {
        notif['title'] = 'Stand time'
        notif['message'] =  'The alloted sitting time has passed time to stand.'
        runNotif();
        console.log("stand")
        onTimesUp();
        TIME_LIMIT = standingDefault;
        timePassed = 0;
        startTimerStanding();
      }
    }, 1000);
  }else {
    console.log("paused")
  }
}

// 2nd timer
function startTimerStanding() {
  console.log(activated)
  if (activated === true){
  timerInterval = setInterval(() => {
    console.log(timeLeft)
    console.log(currentTimerName)
    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;
    currentTimerName = 'standing'
   
    if (timeLeft === 0) {
      notif['title'] = 'Active time'
      notif['message'] =  'The alloted standing time has passed time to be active.'
      runNotif();
      console.log("active")
      onTimesUp();
      TIME_LIMIT = activeDefault;
      timePassed = 0;
      startTimerActive();
    }
  }, 1000);
}else {
  console.log("paused")
}
}
//3rd timer
function startTimerActive() {
  console.log(activated)
  if (activated === true){
  timerInterval = setInterval(() => {
    console.log(timeLeft)
    console.log(currentTimerName)
    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;
    currentTimerName = 'active'

    if (timeLeft === 0) {
      notif['title'] = 'Sitting time'
      notif['message'] =  'The alloted active time has passed time to sit.'
      runNotif();
      console.log("sit")
      onTimesUp();
      TIME_LIMIT = sittingDefault;
      timePassed = 0;
      startTimer();
    }
  }, 1000);
}else {
  console.log("paused")
}
}

//clear timer
function onTimesUp() {
  clearInterval(timerInterval);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${minutes}:${seconds}`;
}


////////////////////////////////////////////////////////////////////// MAIN 3 TIMERS
//Clear main timers
function onTimesUp() {
  clearInterval(timerInterval);
}
//Main Timer functions
function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${minutes}:${seconds}`;
}
function calculateTimeFraction() {
  const rawTimeFraction = timeLeft / TIME_LIMIT;
  return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray(circle) {
  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  circle.setAttribute("stroke-dasharray", circleDasharray);
}


///////////////////////////////////////////////////////////////////////////////WATER TIMER 
//Clear water timers
function onTimesUpWater() {
  clearInterval(waterTimerInterval);
}
//Water Timer functions
function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
}

function waterTimeFraction() {
  const rawTimeFractionWater = timeLeftWater / WATER_TIME_LIMIT;
  return rawTimeFractionWater - (1 / WATER_TIME_LIMIT) * (1 - rawTimeFractionWater);
}

function setCircleDasharrayWater(circle) {
  const circleDasharrayWater = `${(
    waterTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  circle.setAttribute("stroke-dasharray", circleDasharrayWater);
}
