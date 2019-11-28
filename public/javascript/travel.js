function initMap() {
  // The location of Orchardleigh
  var orchardleigh = {lat: 51.24874, lng: -2.33930};
  // The map, centered at Orchardleigh
  var map = new google.maps.Map(
    document.getElementById('map'), {zoom: 12, center: orchardleigh});
  // The marker, positioned at Uluru
  var marker = new google.maps.Marker({position: orchardleigh, map: map});
}