'use strict';

const addBtn = document.getElementById('add-btn');
const timeInput = document.getElementById('time-input');
const alarmContainerDiv = document.querySelector('.alarm-div');

const alarmsObj = {
  alarmsArray: [],
};

let currentAudio = null;

const localStorageHandler = {
  saveToLocal() {
    localStorage.setItem('alarms', JSON.stringify(alarmsObj.alarmsArray));
  },
  getFromLocal() {
    return JSON.parse(localStorage.getItem('alarms')) || [];
  },
};

function convertTimeFormat(time) {
  let [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')} ${period}`;
}

function renderAlarms() {
  alarmContainerDiv.innerHTML = '';

  const alarmsFromLocal = localStorageHandler.getFromLocal();

  if (alarmsFromLocal.length === 0) {
    alarmContainerDiv.classList.add('hidden');
    return;
  }

  alarmContainerDiv.classList.remove('hidden');

  alarmsFromLocal.reverse().forEach((alarm) => {
    const { id, formattedTime, isActive } = alarm;

    const alarmElement = document.createElement('div');
    alarmElement.classList.add('alarm-item');
    alarmElement.innerHTML = `
      <span class="alarm-time">${formattedTime}</span>
      <span class="toggle"></span>
      <i class="fa-solid fa-trash" data-id="${id}"></i>
      <span class="countdown" id="countdown-${id}"></span>
    `;

    alarmContainerDiv.appendChild(alarmElement);
    const toggleBtn = alarmElement.querySelector('.toggle');
    if (isActive) {
      toggleBtn.classList.add('active');
    } else {
      toggleBtn.classList.remove('active');
    }
    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle('active');

      const alarmUptodate = alarmsObj.alarmsArray.find((a) => a.id === id);

      if (alarmUptodate) {
        alarmUptodate.isActive = !alarmUptodate.isActive;
        localStorageHandler.saveToLocal();
      }

      if (!alarmUptodate.isActive) {
        stopAudio(alarmUptodate.id);
      }
    });

    const deleteBtn = alarmElement.querySelector('.fa-solid');
    deleteBtn.addEventListener('click', () => {
      const alarm = alarmsObj.alarmsArray.find((a) => a.id === id);
      const alarmIndex = alarmsObj.alarmsArray.indexOf(alarm);
      if (alarmIndex !== -1) {
        alarmsObj.alarmsArray.splice(alarmIndex, 1);
        stopAudio(alarm.id);
        alarmElement.remove();
        localStorageHandler.saveToLocal();
      }
      if (alarmsObj.alarmsArray.length === 0) {
        alarmContainerDiv.classList.add('hidden');
      }
    });
  });
  alarmsFromLocal.forEach((alarm) => startCountdown(alarm));
}

let id = localStorageHandler
  .getFromLocal()
  .reduce((max, alarm) => Math.max(max, alarm.id), 0);

addBtn.addEventListener('click', () => {
  if (timeInput.value === '') {
    alert('Please enter a time then try again');
  } else {
    const formattedTime = convertTimeFormat(timeInput.value);

    alarmsObj.alarmsArray.push({
      id: ++id,
      time: timeInput.value,
      formattedTime,
      isActive: true,
    });

    localStorageHandler.saveToLocal();

    renderAlarms();

    timeInput.value = '';
  }
});

function startCountdown(alarm) {
  const { id, time } = alarm;
  const [hours, minutes] = time.split(':').map(Number);

  const now = new Date();
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
      playAlarm(id);
    }
  }, 1000);
}

function playAlarm(alarmId) {
  const audio = new Audio('alarm_sound.mp3');

  audio.play();
  currentAudio = audio;
  const alarm = alarmsObj.alarmsArray.find((a) => a.id === alarmId);
  if (alarm && alarm.isActive) {
    audio.play();
  }
}

function stopAudio(alarmId) {
  const alarm = alarmsObj.alarmsArray.find((a) => a.id === alarmId);

  if (alarm != -1 && currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

window.onload = () => {
  alarmsObj.alarmsArray = localStorageHandler.getFromLocal();
  renderAlarms();
};
