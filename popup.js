//Labels
let sittingId = document.getElementById("base-timer-label-div-sitting");
let standingId = document.getElementById("base-timer-label-div-standing");
let activeId = document.getElementById("base-timer-label-div-active");
let waterId = document.getElementById("base-timer-label-div-water");

//Sitting input
let sittingInput = document.getElementById("sittingInput");
let standingInput = document.getElementById("standingInput");
let activeInput = document.getElementById("activeInput");
let waterInput = document.getElementById("waterInput");

//Timer Limit
let TIME_LIMIT;
let WATER_TIME_LIMIT;

//Default labels
let sittingDefault = chrome.storage.sync.get(function(result) {
  sittingDefault= result.sittingDefault
  sittingId.innerHTML = formatTime(sittingDefault);
  TIME_LIMIT = sittingDefault
  return sittingDefault
});
let standingDefault = chrome.storage.sync.get(function(result) {
  standingDefault = result.standingDefault
  standingId.innerHTML = formatTime(standingDefault);
  return standingDefault
 });
let activeDefault = chrome.storage.sync.get(function(result) {
 activeDefault = result.activeDefault
 activeId.innerHTML =  formatTime(activeDefault);
 return activeDefault
});
let waterDefault = chrome.storage.sync.get(function(result) {
  waterDefault = result.waterDefault
  waterId.innerHTML =  formatTime(waterDefault);
  WATER_TIME_LIMIT = waterDefault;
  return waterDefault
 });

//Buttons
let btnBar = document.getElementById("buttonBar");
let startBtn = document.getElementById("startBtn");
let pauseBtn = document.getElementById("pauseBtn");
let restartBtn = document.getElementById("restartBtn");
let editBtn = document.getElementById("editBtn");

//circles
let sittingCircle = document.getElementById("base-timer-path-remaining-sitting");
let standingCircle = document.getElementById("base-timer-path-remaining-standing");
let activeCircle = document.getElementById("base-timer-path-remaining-active");
let waterCircle = document.getElementById("base-timer-path-remaining-water");

/////Function Related///////
const FULL_DASH_ARRAY = 283;
let currentTimer
let timeLeft = TIME_LIMIT;
let activated = false;

//Timer 
let timePassed = 0;
let timerInterval = null;
let actived = false;
let currentTimeLimit;
let currentTimerName;

//Water Timer
let waterTimerInterval = null;
let timePassedWater = 0;
let timeLeftWater = WATER_TIME_LIMIT;
let waterActivated = false;
let waterTimerName;

//Buttons
let startButton = false;
let pauseButton = false;
let resetButton = false;
let editButton = false;

//Timer circle formatting 
let sittingCircleFunc = function (){
  sittingId.innerHTML = formatTime(timeLeft);
  setCircleDasharray(sittingCircle);  
}
let standingCircleFunc = function (){
  standingId.innerHTML = formatTime(timeLeft);
  setCircleDasharray(standingCircle);
}
  
let activeCircleFunc = function (){
  activeId.innerHTML = formatTime(timeLeft);
  setCircleDasharray(activeCircle);
}

let waterCircleFunc = function(){
  waterId.innerHTML = formatTimeWater(timeLeftWater);
  setCircleDasharrayWater(waterCircle);
}

let resetCircleFunc = function(id, timeDefault, circle){
  id.innerHTML = formatTime(timeDefault);
  setCircleDasharray(circle);
}


//Port connection to background
var port = chrome.runtime.connect({name: "popup"});

port.postMessage({runPopup: "popupInit"});
port.onMessage.addListener(function(msg) {
  console.log(msg)
  //Timer
  TIME_LIMIT = msg.currentTimeLimit
  timeLeft = msg.timeLeft
  currentTimerName = msg.currentTimerName
  timePassed = msg.currentTimePassed
  activated = msg.activated

  //Water Timer
  WATER_TIME_LIMIT = msg.currentTimeLimitWater
  timeLeftWater = msg.timeLeftWater
  waterTimerName = msg.waterName
  timePassedWater = msg.currentTimePassedWater 
  waterActivated = msg.waterActivated
  
  if (currentTimerName === 'sitting'){
    
    if (activated === true){
      console.log("Start Sitting")
      startTimer();
      waterTimer();
    } else {
      sittingCircleFunc();
      waterCircleFunc();
    }
  } else if (currentTimerName === 'standing'){
    if (activated === true){
      console.log("Start Standing")
      startTimerStanding();
      waterTimer();
    } else {
      standingCircleFunc();
      waterCircleFunc();
    }
  } else if (currentTimerName === 'active'){
    if (activated === true){
      console.log("Start Active")
      startTimerActive();
      waterTimer();
    } else {
      activeCircleFunc();
      waterCircleFunc();
    }
  } else{
    console.log("Nothing activated")
  }
});



//////////////////////////////////////////////////////////////BUTTONS
//Start
startBtn.addEventListener("click", function () {
  
  if(startButton === false){
    startButton = true
    pauseButton = false

    if (activated === false){
      activated = true;
      waterActivated = true;

      if (currentTimerName === undefined){
        console.log("Start Sitting")
        startTimer();
        waterTimer();

      } else if (currentTimerName === 'sitting' ){
        console.log("Start Standing")
        startTimer();
        waterTimer();

      }  else if (currentTimerName === 'standing'){
        console.log("Start Standing")
        startTimerStanding();
        waterTimer();

      } else if (currentTimerName === 'active'){
        console.log("Start Active")
        startTimerActive();
        waterTimer();
  
      } else if (currentTimerName === ''){
        console.log("Program hasn't started")

      } else {
        console.log("Nothing")
      } 
    }
    chrome.runtime.sendMessage({message: "start"}, function (response){
      console.log("Start Clicked");
    });

  }else{
    alert("Timer already playing");
  }
});

//Pause
pauseBtn.addEventListener("click", function () {
  
  if(pauseButton === false){
    startButton = false;
    pauseButton = true;
    activated = false;
      onTimesUp();
      onTimesUpWater();
      chrome.runtime.sendMessage({message: "pause"}, function (response){
        console.log("Pause clicked");
      });

  }else{
    alert("Timer already paused");
}
});

//Restart
restartBtn.addEventListener("click", function () {

  startButton = false;
  pauseButton = false;

  chrome.runtime.sendMessage({message: "reset"}, function (response){
    onTimesUp();
    onTimesUpWater();

    //Timer timer
    TIME_LIMIT = response.currentTimeLimit
    timeLeft = response.timeLeft
    currentTimerName = response.currentTimerName
    timePassed = response.currentTimePassed
    activated = response.activated

    //Water timer
    WATER_TIME_LIMIT = response.currentTimeLimitWater
    timeLeftWater = response.timeLeftWater
    waterTimerName = response.waterName
    timePassedWater = response.currentTimePassedWater 
    waterActivated = response.waterActivated

    //Clear circles 
    resetCircleFunc(sittingId,sittingDefault,sittingCircle );
    resetCircleFunc(standingId,standingDefault,standingCircle );
    resetCircleFunc(activeId,activeDefault, activeCircle );
    resetCircleFunc(waterId,waterDefault, waterCircle );
    
  });
  sittingId.innerHTML = sittingDefault;
  standingId.innerHTML = standingDefault;
  activeId.innerHTML =  activeDefault;
  waterId.innerHTML =  waterDefault;
});

//Edit
editBtn.addEventListener("click", function () {

  pauseBtn.click();

  if (editButton === false){

      // UI function
      startBtn.disabled = true;
      pauseBtn.disabled = true;
      restartBtn.disabled = true;
  
      editBtn.innerHTML = "Save"
      editButton = true;

      sittingId.style.display = "none"
      standingId.style.display = "none"
      activeId.style.display = "none"
      waterId.style.display = "none"

      sittingInput.style.display = "block"
      standingInput.style.display = "block"
      activeInput.style.display = "block"
      waterInput.style.display = "block"
    
  } else {
       // checks if values entered are above 1min
      if ((sittingInput.value || standingInput.value || activeInput.value || waterInput.value) < 1){

        // checks if values are entered above 
        alert("Please enter a value greater than 1 minute on each item")
        sittingId.innerHTML = sittingDefault;
        standingId.innerHTML = standingDefault;
        activeId.innerHTML = activeDefault;
        waterId.innerHTML = waterDefault;
        
      }else {
        //set new default settings
        let defaultSettings = {
          sittingDefault :  sittingInput.value * 60,
          standingDefault: standingInput.value * 60,
          activeDefault : activeInput.value * 60,
          waterDefault :waterInput.value * 60
        }

        chrome.storage.sync.set(defaultSettings, function() {
          console.log(defaultSettings);

          sittingId.innerHTML = formatTime(defaultSettings["sittingDefault"]);
          standingId.innerHTML = formatTime(defaultSettings["standingDefault"]);
          activeId.innerHTML = formatTime(defaultSettings["activeDefault"]);
          waterId.innerHTML = formatTimeWater(defaultSettings["waterDefault"]);
          TIME_LIMIT = sittingDefault;
          WATER_TIME_LIMIT = waterDefault;
          restartBtn.click();
        });
  
        chrome.runtime.sendMessage({message: "edit"}, function (response){
          console.log(response)
        });

        sittingDefault = defaultSettings["sittingDefault"];
        standingDefault = defaultSettings["standingDefault"];
        activeDefault = defaultSettings["activeDefault"];
        waterDefault = defaultSettings["waterDefault"];
  
        // UI function
        sittingInput.style.display = "none"
        standingInput.style.display = "none"
        activeInput.style.display = "none"
        waterInput.style.display = "none"
  
        sittingId.style.display = "block"
        standingId.style.display = "block"
        activeId.style.display = "block"
        waterId.style.display = "block"

        editBtn.innerHTML = "Edit"
        console.log("click")
        editButton = false;
        startBtn.disabled = false;
        pauseBtn.disabled = false;
        restartBtn.disabled = false;
      }     
  }
});




//////////////////////////////////////////////////////////////TIMERS
//WATER
function waterTimer() {
    waterTimerInterval =  setInterval(() => {
  
      timePassedWater = timePassedWater += 1;
      timeLeftWater = WATER_TIME_LIMIT - timePassedWater;

      waterId.innerHTML = formatTimeWater(timeLeftWater);
      setCircleDasharrayWater(waterCircle);
    
      if (timeLeftWater === 0) {
        onTimesUpWater();
        WATER_TIME_LIMIT = waterDefault;
        timePassedWater = 0;
        waterTimer();
      }
    }, 1000);
  }




//SITTING
function startTimer() {
  timerInterval = setInterval(() => {

    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;
    currentTimerName = 'sitting'
   
    sittingCircleFunc();

    if (timeLeft === 0) {
      onTimesUp();
      TIME_LIMIT = standingDefault;
      timePassed = 0;
      sittingId.innerHTML = formatTime(sittingDefault);
      startTimerStanding();
    }
  }, 1000);
}


//STANDING
function startTimerStanding() {
  timerInterval = setInterval(() => {

    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;
    currentTimerName = 'standing'

    standingCircleFunc();

    if (timeLeft === 0) {
      onTimesUp();
      TIME_LIMIT = activeDefault;
      timePassed = 0;
      standingId.innerHTML = formatTime(standingDefault);
      startTimerActive();
    }
  }, 1000);
}

//ACTIVE
function startTimerActive() {
  timerInterval = setInterval(() => {

    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;
    currentTimerName = 'active'

    activeCircleFunc();

    if (timeLeft === 0) {
      onTimesUp();
      TIME_LIMIT = sittingDefault;
      timePassed = 0;
      activeId.innerHTML =  formatTime(activeDefault);
      startTimer();
      
    }
  }, 1000);
}

//////////////////////////////////////////////////////////////FUNCTIONS
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


// MAIN 3 TIMERS
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
function formatTimeWater(time) {
  const minutesWater = Math.floor(time / 60);
  let secondsWater = time % 60;

  if (secondsWater < 10) {
    secondsWater = `0${secondsWater}`;
  }
  return `${minutesWater}:${secondsWater}`;
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
