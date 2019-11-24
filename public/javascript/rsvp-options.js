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

function isHidden(el) {
  return (el.offsetParent === null)
}

function getValidatorStatusElement(el) {
  const validatorStatusId = el.getAttribute('validator-status');
  return document.getElementById(validatorStatusId);
}

function initOnBlurDefault(validationFn) {
  return event => {
    let target = event.target;
    target.classList.add('touched');
    getValidatorStatusElement(target).classList.add('touched');
    valildationFns[validationFn](target);
    validateForm();
  };
}

// function requiredEmail(id, forId) {
//   const input = document.getElementById(id);
//   if (input.classList.contains('touched')) {
//     const statusElements = [document.getElementById(forId), input];
//     if (input.value.length < 1) {
//       //red border
//       addErrorClass(statusElements, 'empty');
//       formErrors[input.id] = 'empty';
//     } else if ((input.type === "email" && !emailRegex.test(input.value))) {
//       addErrorClass(statusElements, 'email');
//       formErrors[input.id] = 'email';
//     } else {
//       removeClasses(statusElements, ['error', 'error-empty', 'error-email']);
//       delete formErrors[input.id];
//     }
//   }
// }

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

function requiredInput(target) {
  if (isHidden(target)) {
    return;
  }
  const input = target;
  const statusElement = getValidatorStatusElement(input);
  const statusElements = [statusElement, input];
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
}

function meatVegValidator(target) {
  if (!target.hasAttribute('validator')) {
    return;
  }
  var radios = target.getElementsByTagName('input');
  var checked = false;
  for (var j = 0; j < radios.length; j++) {
    if (radios[j].checked) {
      checked = true;
      break;
    }
  }
  if (checked === false) {
    formErrors[target.id] = 'required';
  } else {
    delete formErrors[target.id];
  }
  validateForm();
}

function requiredOption(target) {
  if (!target.value || isNaN(target.value)) {
    formErrors[target.id] = 'required';
  } else {
    delete formErrors[target.id];
  }
  validateForm();
}

function mealMeat() {
  rerunValidation(document.getElementById('rsvp'));
  validateForm();
}

function mealVeg() {
  rerunValidation(document.getElementById('rsvp'));
  validateForm();
}

function initialiseFormErrors(form) {
  form.querySelectorAll('[required]').forEach(e => {
    formErrors[e.id] = 'empty';
  });
}

const valildationFns = {
  requiredInput,
  meatVegValidator,
  requiredOption
};

function initValidator(target, validatorFn) {
  const fn = valildationFns[validatorFn];
  fn(target);
  return e => {
    fn(e.target);
    validateForm();
  }
}

function rerunValidation(parent) {
  const elements = parent.querySelectorAll('[validator]');
  for (let i = 0; i < elements.length; i++) {
    const validatorFn = elements[i].getAttribute('validator');
    valildationFns[validatorFn](elements[i]);
  }
}

function attachOnchangeToElements(parent) {
  const elements = parent.querySelectorAll('[validator]');
  for (let i = 0; i < elements.length; i++) {
    const validatorFn = elements[i].getAttribute('validator');
    elements[i].addEventListener('onchange', initValidator(elements[i], validatorFn));
    elements[i].addEventListener('change', initValidator(elements[i], validatorFn));
    elements[i].addEventListener('onkeyup', initValidator(elements[i], validatorFn));
    elements[i].addEventListener('keyup', initValidator(elements[i], validatorFn));
    elements[i].addEventListener('onblur', initOnBlurDefault(validatorFn));
    elements[i].addEventListener('blur', initOnBlurDefault(validatorFn));
  }
  rerunValidation(parent);
}

function initialiseFormValidation(form) {
  // initialiseFormErrors(form);
  attachOnchangeToElements(form);
  // const emailValidationEvents = ['onkeyup', 'keyup'];
  // const emailInput = document.getElementById('email');
  // emailValidationEvents.forEach(event => emailInput.addEventListener(event, () => requiredEmail('email-field', 'email')));
  validateForm();
}

function validateForm() {
  if (Object.keys(formErrors).length < 1) {
    document.getElementById('rsvp').classList.remove('invalid')
  } else {
    document.getElementById('rsvp').classList.add('invalid')
  }
}

function createRoomOptions(rooms) {
  function createRoomOptionNode(value, text) {
    let option = document.createElement('option');
    option.setAttribute('value', value);
    option.appendChild(document.createTextNode(text));
    return option;
  }

  const roomSelect = document.getElementById('room-field');

  let selectOption = createRoomOptionNode('', 'Select room');
  selectOption.setAttribute('disabled', true);
  selectOption.setAttribute('selected', true);
  selectOption.setAttribute('style', 'style="display: none"');

  roomSelect.appendChild(selectOption);

  rooms
    .filter(room => !room.assignee && !room.paid)
    .sort((a, b) => a.room < b.room ? -1 : 1)
    .map(room => createRoomOptionNode(room._id, room.room))
    .forEach(optionNode => roomSelect.appendChild(optionNode));

}

function init() {
  var xmlhttp = new XMLHttpRequest();
  var url = "/room";

  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var myArr = JSON.parse(this.responseText);
      createRoomOptions(myArr);
    }
  };

  xmlhttp.open("GET", url, true);
  xmlhttp.send();

  const form = document.getElementById('rsvp');
  initialiseFormValidation(form);
  let radios = document.querySelectorAll('[type="radio"]');
  for(var i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      radios[i].click();
    }
  }
  // form.addEventListener('submit', function (event) {
  //   let attendingClassList = document.getElementById('attending').classList;
  //   if (emailValid && (document.getElementById('attending-yes').checked || document.getElementById('attending-yes').checked)) {
  //     form.classList.add('disabled');
  //     attendingClassList.remove('error');
  //     attendingClassList.remove('error-required');
  //   } else {
  //     event.preventDefault();
  //     attendingClassList.add('error');
  //     attendingClassList.add('error-required');
  //   }
  // });
};

if (document.attachEvent) {
  document.attachEvent("onreadystatechange", function () {
    // check if the DOM is fully loaded
    if (document.readyState === "complete") {
      // remove the listener, to make sure it isn't fired in future
      document.detachEvent("onreadystatechange", arguments.callee);
      init();
    }
  });
} else {
  document.addEventListener("DOMContentLoaded", function () {
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

function toggleClicked(el){
  el.classList.toggle("clicked");
}
