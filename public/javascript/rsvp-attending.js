function toggleRequiredOption() {
  validate();
}

function validate() {
  for (var i = 0; true; i++) {
    var el = document.getElementById(`required-option-${i}`);
    if (!el) {
      document.getElementById('rsvp').classList.remove('invalid');
      return;
    } else {
      var radios = el.getElementsByTagName('input');
      var checked = false
      for (var j = 0; j < radios.length; j++) {
        if (radios[j].checked) {
          checked = true;
          break;
        }
      }
      if (checked === false) {
        document.getElementById('rsvp').classList.add('invalid');
        return;
      }
    }
  }
}

function init() {
  validate();
  preventDuplicateSubmit();
}

let formSubmitted = false;

function processForm(e) {
  if (formSubmitted) {
    e.preventDefault();
    return false;
  } else {
    formSubmitted = true;
  }
}

function preventDuplicateSubmit() {
  const form = document.getElementById('rsvp');
  if (form.attachEvent) {
    form.attachEvent("submit", processForm);
  } else {
    form.addEventListener("submit", processForm);
  }
}

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