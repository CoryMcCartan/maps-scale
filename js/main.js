let lMap, rMap;
let leftLevel = 0, rightLevel = 0;

function init() {
    let options = {
        zoom: 9,
        streetViewControl: false,
    };

    let leftOptions = {
        zoomControl: false,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM,
        },
        center: {lng: -122.23, lat: 47.52},
    };
    Object.assign(leftOptions, options);

    let rightOptions = {
        mapTypeControl: false,
        center: {lng: -122.24, lat: 37.64},
    };
    Object.assign(rightOptions, options);

    lMap = new google.maps.Map($("#left"),  leftOptions);
    rMap = new google.maps.Map($("#right"), rightOptions);

    lMap.addListener("maptypeid_changed", handleMapType);
    lMap.addListener("zoom_changed", handleLeftZoom);
    rMap.addListener("zoom_changed", handleRightZoom);

    let lBox = new google.maps.places.SearchBox($("#leftSearch"));
    let rBox = new google.maps.places.SearchBox($("#rightSearch"));

    lMap.controls[google.maps.ControlPosition.TOP_LEFT].push($("#leftSearch"));
    rMap.controls[google.maps.ControlPosition.TOP_RIGHT].push($("#rightSearch"));

    lBox.addListener("places_changed", handleSearch.bind(lBox, lMap));
    rBox.addListener("places_changed", handleSearch.bind(rBox, rMap));
}

function handleLeftZoom() {
    leftLevel = lMap.getZoom();
    if (leftLevel !== rightLevel) {
        rMap.setZoom(leftLevel);
    }
}

function handleRightZoom() {
    rightLevel = rMap.getZoom();
    if (rightLevel !== leftLevel) {
        lMap.setZoom(rightLevel);
    }
}

function handleSearch(map) {
    let places = this.getPlaces();
    map.setCenter(places[0].geometry.location);
}

function handleMapType() {
    rMap.setMapTypeId(lMap.getMapTypeId());
}

window.$ = s => document.querySelector(s);
