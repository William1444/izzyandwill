const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const formErrors = {};

function checkEmail(str, statusElement) {
  if (!emailRegex.test(str)) {
    document.getElementById(statusElement).classList.add('error');
    return false;
  } else {
    document.getElementById(statusElement).classList.remove('error');
  }
}

function addErrorClass(els, error) {
  els.forEach(e => {
    e.classList.add('error');
    e.classList.add('error-' + error);
  });
}

function removeClasses(els, classes) {
  els.forEach(e => classes.forEach(c => e.classList.remove(c)));
}

function checkTouchedFieldsErrors(ids, forId) {
  let fields = ids.map(id =>
    document.getElementById(id)
  );
  const statusElements = [document.getElementById(forId)];
  if (fields.every(field => field.classList.contains('touched'))) {
    if (fields.some(field => field.classList.contains('error'))) {
      addErrorClass(statusElements, 'multi');
    } else {
      removeClasses(statusElements, ['error', 'error-empty'])
    }
  }
}

function requiredInput(input, forId) {
  const statusElements = [document.getElementById(forId), input];
  if (input.value.length < 1) {
    //red border
    addErrorClass(statusElements, 'empty');
    formErrors[input.id] = 'empty';
  } else if ((input.type === "email" && !emailRegex.test(input.value))) {
    addErrorClass(statusElements, 'email');
    formErrors[input.id] = 'email';
  } else {
    removeClasses(statusElements, ['error', 'error-empty', 'error-email']);
    delete formErrors[input.id];
  }
  validateForm();
  input.classList.add('touched');
}

function onBlurDefault(el, forId) {
  el.classList.add('touched');
  requiredEmail(el.id, forId);
}

function requiredEmail(id, forId) {
  const input = document.getElementById(id);
  if (input.classList.contains('touched')) {
    const statusElements = [document.getElementById(forId), input];
    if (input.value.length < 1) {
      //red border
      addErrorClass(statusElements, 'empty');
      formErrors[input.id] = 'empty';
    } else if ((input.type === "email" && !emailRegex.test(input.value))) {
      addErrorClass(statusElements, 'email');
      formErrors[input.id] = 'email';
    } else {
      removeClasses(statusElements, ['error', 'error-empty', 'error-email']);
      delete formErrors[input.id];
    }
    validateForm();
  }
}

function toggleMenu(id) {
  document.getElementById(id).classList.toggle('menu-open')
}

function initMap() {
  // The location of Orchardleigh
  var orchardleigh = {lat: 51.24874, lng: -2.33930};
  // The map, centered at Orchardleigh
  var map = new google.maps.Map(
    document.getElementById('map'), {zoom: 12, center: orchardleigh});
  // The marker, positioned at Uluru
  var marker = new google.maps.Marker({position: orchardleigh, map: map});
}

function attending(attending) {
  let attendingId = 'attending-answer-' + attending;
  document.getElementById(attendingId).style.display='block';
  document.getElementById(attendingId).style.display='none';
  document.getElementById('other-guests-field').attributes["required"] = attending === 'yes';
  document.getElementById('room-field').attributes["required"] = attending === 'yes';
}

function attendingYes() {
  document.getElementById('attending-answer-yes').style.display='block';
  document.getElementById('attending-answer-no').style.display='none';
  document.getElementById('other-guests-field').attributes["required"] = true;
  document.getElementById('room-field').attributes["required"] = true;
}

function attendingNo() {
  document.getElementById('attending-answer-yes').style.display='none';
  document.getElementById('attending-answer-no').style.display='block';
  document.getElementById('other-guests-field').attributes["required"] = false
  document.getElementById('room-field').attributes["required"] = false;
}

function initialiseFormErrors(form) {
  form.querySelectorAll('[required]').forEach(e => {
    formErrors[e.id] = 'empty';
  });
}

function attachOnchangeToElements(parent, tagNames) {
  tagNames.forEach(t => {
    const elements = parent.getElementsByTagName(t);
    for (let i = 0; i < elements.length; i++) {
      elements[i].onchange = validateForm;
    }
  });
}

function initialiseFormValidation(form) {
  initialiseFormErrors(form);
  attachOnchangeToElements(form, ['input', 'select', 'textarea']);
  const emailValidationEvents = ['onkeyup', 'keyup'];
  const emailInput = document.getElementById('email');
  emailValidationEvents.forEach(event => emailInput.addEventListener(event, () => requiredEmail('email-field', 'email')));
  validateForm();
}

function validateForm(){
  if (Object.keys(formErrors).length < 1) {
    document.getElementById('rsvp').classList.remove('invalid')
  } else {
    document.getElementById('rsvp').classList.add('invalid')
  }
}

function key(){
  debugger;
}

function init(){
  const form = document.getElementById('rsvp');
  initialiseFormValidation(form);
  form.addEventListener('submit', function (event) {
    let attendingClassList = document.getElementById('attending').classList;
    if (!emailValid || document.getElementById('attending-yes').value !== 'Yes' || document.getElementById('attending-yes').value !== 'No') {
      event.preventDefault();
      attendingClassList.add('error');
      attendingClassList.add('error-required');
    } else {
      form.classList.add('disabled');
      attendingClassList.remove('error');
      attendingClassList.remove('error-required');
    }
  });
};

if (document.attachEvent) {
  document.attachEvent("onreadystatechange", function(){
    // check if the DOM is fully loaded
    if(document.readyState === "complete"){
      // remove the listener, to make sure it isn't fired in future
      document.detachEvent("onreadystatechange", arguments.callee);
      init();
    }
  });
} else {
  document.addEventListener("DOMContentLoaded", function(){
    if (
      document.readyState === "complete" ||
      (document.readyState !== "loading" && !document.documentElement.doScroll)
    ) {
      init();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  });
}
