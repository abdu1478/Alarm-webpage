"use strict";

const timeValue = document.getElementById("time-input");
const startButton = document.getElementById("add-btn");
const alarmContainerDiv = document.querySelector(".alarm-div");

const alarms = {
  alarm: [],
  convertTo12HourFormat(time) {
    let [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
  },
};

let id = 0;
let currentAudio = null;

startButton.addEventListener("click", () => {
  if (timeValue.value === "") {
    alert("Please enter a time value");
  } else {
    const formattedTime = alarms.convertTo12HourFormat(timeValue.value);
    alarms.alarm.push({
      id: ++id,
      time: formattedTime,
      originalTime: timeValue.value,
      active: false,
    });

    const alarmElement = document.createElement("div");
    alarmElement.classList.add("alarm-item");
    alarmElement.innerHTML = `
    <div class="alarms">
      <span class="alarm-time"> ${formattedTime}</span>
        <span class="toggle"></span><i class="fa-solid fa-trash"></i>
        <span class="countdown" id="countdown-${id}"></span>
    </div>
    `;

    alarmContainerDiv.appendChild(alarmElement);

    const toggleBtn = alarmElement.querySelector(".toggle");
    toggleBtn.addEventListener("click", () => {
      toggleBtn.classList.toggle("active");
      const alarm = alarms.alarm.find((a) => a.id === id);
      alarm.active = !alarm.active;

      if (!alarm.active) {
        stopAudio(alarm.id);
      }

      alarms.alarm.forEach((alarm) => {
        console.log(alarm.id, alarm.active);
      });
    });

    const deleteBtn = alarmElement.querySelector(".fa-solid");
    deleteBtn.addEventListener("click", () => {
      const alarm = alarms.alarm.find((a) => a.id === id);
      const alarmIndex = alarms.alarm.indexOf(alarm);
      if (alarmIndex !== -1) {
        alarms.alarm.splice(alarmIndex, 1);
        stopAudio(alarm.id);
      }

      alarmElement.remove();

      console.log(alarms.alarm);
    });

    startCountdown(alarms.alarm[alarms.alarm.length - 1]);

    timeValue.value = "";
  }
});

function startCountdown(alarm) {
  const now = new Date();
  const [hours, minutes] = alarm.originalTime.split(":").map(Number);
  let alarmTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );

  if (alarmTime <= now) {
    alarmTime.setDate(alarmTime.getDate() + 1);
  }

  alarm.interval = setInterval(() => {
    const now = new Date();
    const diff = alarmTime - now;

    if (diff <= 0) {
      clearInterval(alarm.interval);
      playAlarm(alarm.id);
    } else {
      const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(
        2,
        "0"
      );
      const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(
        2,
        "0"
      );
      const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");
    }
  }, 1000);
}

function playAlarm(alarmId) {
  const audio = new Audio("alarm_sound.mp3");
  currentAudio = audio;
  const alarm = alarms.alarm.find((a) => a.id === alarmId);
  if (alarm && alarm.active) {
    audio.play();
  }
}

function stopAudio(alarmId) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}
