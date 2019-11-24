function toggleAttending() {
  validateAttending();
}

function validateAttending() {
  const form = document.getElementsByTagName('form');
  for (var i = 0; true; i++) {
    var el = document.getElementById(`attending-${i}`);
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
  validateAttending();
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