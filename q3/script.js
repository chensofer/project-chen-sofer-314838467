'use strict';

const LS_KEY = 'emotionShows';
let items = [];

const form = document.getElementById('showForm');
const errorsBox = document.getElementById('errorsBox');
const errorsList = document.getElementById('errorsList');
const successBox = document.getElementById('successBox');

const fullNameEl = document.getElementById('fullName');
const emailEl = document.getElementById('email');
const showNameEl = document.getElementById('showName');
const emotionEl = document.getElementById('emotion');
const durationEl = document.getElementById('duration');
const descriptionEl = document.getElementById('description');

const ageLimitWrap = document.getElementById('ageLimitWrap');
const ageLimitEl = document.getElementById('ageLimit');
const ageRestrictRadios = document.querySelectorAll('input[name="ageRestrict"]');

const itemsContainer = document.getElementById('itemsContainer');
const filterEmotion = document.getElementById('filterEmotion');
const filterStatus = document.getElementById('filterStatus');
const statsBox = document.getElementById('statsBox');

document.addEventListener('DOMContentLoaded', function () {
  loadItems();
  if (form) initFormPage();
  if (itemsContainer) initViewPage();
});

function initFormPage() {
  ageRestrictRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      if (radio.value === 'yes') {
        ageLimitWrap.classList.remove('hidden');
      } else {
        ageLimitWrap.classList.add('hidden');
        if (ageLimitEl) ageLimitEl.value = '';
      }
    });
  });

  form.addEventListener('submit', onSubmitForm);
}

function initViewPage() {
  renderItems();

  if (filterEmotion) {
    filterEmotion.value = 'all';
    filterEmotion.addEventListener('change', renderItems);
  }
  if (filterStatus) {
    filterStatus.value = 'all';
    filterStatus.addEventListener('change', renderItems);
  }

  itemsContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('btnDelete')) {
      const card = e.target.closest('.item-card');
      const id = Number(card.dataset.id);
      deleteItem(id);
    }
  });

  itemsContainer.addEventListener('change', function (e) {
    if (e.target.classList.contains('statusSelect')) {
      const card = e.target.closest('.item-card');
      const id = Number(card.dataset.id);
      const newStatus = e.target.value;
      updateItem(id, { status: newStatus });
    }
  });
}

function onSubmitForm(e) {
  e.preventDefault();

  errorsList.innerHTML = '';
  errorsBox.classList.add('hidden');
  successBox.classList.add('hidden');

  const errors = [];

  if (fullNameEl.value.trim() === '') {
    errors.push('יש למלא שם מלא של מציע/ת הרעיון');
  }

  const emailVal = emailEl.value.trim();
  if (emailVal === '') {
    errors.push('יש למלא כתובת אימייל');
  } else if (!isValidEmail(emailVal)) {
    errors.push('האימייל שהוזן אינו תקין');
  }

  if (showNameEl.value.trim() === '') {
    errors.push('יש למלא שם מופע');
  }

  if (emotionEl.value === '') {
    errors.push('יש לבחור רגש מרכזי');
  }

  const participationSelected = document.querySelector('input[name="participation"]:checked');
  if (!participationSelected) {
    errors.push('יש לבחור האם המופע מצריך השתתפות או רק צפייה');
  }

  const durationVal = durationEl.value.trim();
  const durationNum = Number(durationVal);
  if (durationVal === '') {
    errors.push('יש למלא משך מופע מוערך זמן בדקות');
  } else if (isNaN(durationNum) || !Number.isInteger(durationNum) || durationNum < 1 || durationNum > 480) {
    errors.push('משך זמן המופע המוערך חייב להיות מספר שלם בין 1 ל-480');
  }

  const ageRestrictSelected = document.querySelector('input[name="ageRestrict"]:checked');
  if (!ageRestrictSelected) {
    errors.push('יש לבחור האם קיימת מגבלת גיל');
  } else if (ageRestrictSelected.value === 'yes') {
    const ageVal = ageLimitEl.value.trim();
    const ageNum = Number(ageVal);
    if (ageVal === '' || isNaN(ageNum) || !Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) {
      errors.push('הגיל המינימלי חייב להיות מספר שלם בין 1 ל-120');
    }
  }

  if (errors.length > 0) {
    errors.forEach(function (msg) {
      const li = document.createElement('li');
      li.textContent = msg;
      errorsList.appendChild(li);
    });
    errorsBox.classList.remove('hidden');
    return;
  }

  successBox.textContent = 'טופס הצעת המופע נשלח בהצלחה!';
  successBox.classList.remove('hidden');

  const newItem = {
    id: Date.now(),
    fullName: fullNameEl.value.trim(),
    email: emailVal,
    showName: showNameEl.value.trim(),
    emotion: emotionEl.value,
    participation: participationSelected ? participationSelected.value : '',
    duration: durationNum,
    ageRestrict: ageRestrictSelected ? ageRestrictSelected.value : '',
    ageMin: (ageRestrictSelected && ageRestrictSelected.value === 'yes') ? ageLimitEl.value.trim() : '',
    description: descriptionEl ? descriptionEl.value.trim() : '',
    status: 'waiting'
  };

  saveItem(newItem);

  form.reset();
  ageLimitWrap.classList.add('hidden');
}

function isValidEmail(str) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(str);
}

function loadItems() {
  const str = localStorage.getItem(LS_KEY);
  if (!str) { items = []; return; }
  try {
    items = JSON.parse(str);
    if (!Array.isArray(items)) items = [];
  } catch (e) {
    items = [];
  }
}

function saveItem(obj) {
  items.push(obj);
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

function deleteItem(id) {
  items = items.filter(function (it) { return it.id !== id; });
  localStorage.setItem(LS_KEY, JSON.stringify(items));
  if (itemsContainer) renderItems();
}

function updateItem(id, changes) {
  const idx = items.findIndex(function (it) { return it.id === id; });
  if (idx === -1) return;
  items[idx] = Object.assign({}, items[idx], changes);
  localStorage.setItem(LS_KEY, JSON.stringify(items));
  if (itemsContainer) renderItems();
}

function renderItems() {
  if (!itemsContainer) return;

  itemsContainer.innerHTML = '';

  const emotionFilterVal = filterEmotion ? filterEmotion.value : 'all';
  const statusFilterVal = filterStatus ? filterStatus.value : 'all';

  var listToShow = items.slice();

  if (emotionFilterVal !== 'all') {
    listToShow = listToShow.filter(function (it) { return it.emotion === emotionFilterVal; });
  }
  if (statusFilterVal !== 'all') {
    listToShow = listToShow.filter(function (it) { return (it.status || 'waiting') === statusFilterVal; });
  }

  listToShow.forEach(function (obj) {
    itemsContainer.appendChild(buildCard(obj));
  });

  renderStats();
}

function buildCard(obj) {
  const emotionsMap = {
    fear: 'פחד',
    joy: 'שמחה',
    confusion: 'בלבול',
    longing: 'געגוע'
  };
  const participationMap = {
    active: 'השתתפות פעילה',
    view: 'צפייה בלבד'
  };
  const statusMap = {
    waiting: { txt: 'ממתינה', cls: 'waiting' },
    approved: { txt: 'מאושרת', cls: 'approved' },
    rejected: { txt: 'נדחתה', cls: 'rejected' }
  };

  var card = document.createElement('div');
  card.className = 'item-card';
  card.dataset.id = obj.id;

  card.innerHTML =
    '<h3 class="title-line">' +
      '<span class="field">שם המופע:</span>' +
      '<span class="show-name">' + obj.showName + '</span>' +
    '</h3>' +

    '<span class="badge status-badge ' + statusMap[(obj.status || 'waiting')].cls + '">' +
      statusMap[(obj.status || 'waiting')].txt +
    '</span>' +

    '<div class="submitted-lines">' +
      '<p class="info-row"><span class="field">הוגש על ידי:</span><span class="value name">' + obj.fullName + '</span>' +
      '<p class="info-row"><span class="field">אימייל:</span> <span class="value email">' + obj.email + '</span>' +
      '<p class="info-row"><span class="field">רגש מרכזי:</span> ' + (emotionsMap[obj.emotion] || '') + '</p>' +
      '<p class="info-row"><span class="field">אופי ההשתתפות:</span> ' + (participationMap[obj.participation] || '') + '</p>' +
      '<p class="info-row"><span class="field">משך זמן מופע  משוער:</span> ' + obj.duration + ' דקות</p>' +
      '<p class="info-row"><span class="field">מגבלת גיל:</span> ' + (obj.ageRestrict === "yes" ? (obj.ageMin + "+") : "ללא מגבלת גיל") + '</p>' +
      (obj.description ? '<p class="info-row"><span class="field">תיאור:</span> ' + obj.description + '</p>' : '') +
    '</div>' +

    '<div class="card-actions">' +
      '<label class="field" for="status-' + obj.id + '">סטטוס:</label>' +
      '<select id="status-' + obj.id + '" class="statusSelect short">' +
        '<option value="waiting" '  + (((obj.status || "waiting") === "waiting")  ? "selected" : "") + '>ממתינה</option>' +
        '<option value="approved" ' + (((obj.status || "waiting") === "approved") ? "selected" : "") + '>מאושרת</option>' +
        '<option value="rejected" ' + (((obj.status || "waiting") === "rejected") ? "selected" : "") + '>נדחתה</option>' +
      '</select>' +
      '<button class="btn-delete btnDelete" type="button">מחק</button>' +
    '</div>';

  return card;
}

function renderStats() {
  if (!statsBox) return;

  var counts = { fear: 0, joy: 0, confusion: 0, longing: 0 };
  items.forEach(function (it) {
    if (counts[it.emotion] !== undefined) counts[it.emotion]++;
  });

  statsBox.classList.remove('hidden');

  statsBox.innerHTML =
    (items.length === 0 ? '<p class="muted">אין עדיין הצעות במערכת.</p>' : '') +
    '<p class="stats-header"> סה"כ ספירת ההצעות לפי סוג רגש:</p>' +
    '<ul class="stats-list">' +
      '<li>פחד: <b>'    + counts.fear      + '</b></li>' +
      '<li>שמחה: <b>'   + counts.joy       + '</b></li>' +
      '<li>בלבול: <b>'  + counts.confusion + '</b></li>' +
      '<li>געגוע: <b>'  + counts.longing   + '</b></li>' +
    '</ul>';
}


