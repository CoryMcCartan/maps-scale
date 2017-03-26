let lMap, rMap;
let leftLevel = 0, rightLevel = 0;

let names = new Array(2);

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

    lBox.addListener("places_changed", handleSearch.bind(lBox, "L"));
    rBox.addListener("places_changed", handleSearch.bind(rBox, "R"));
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

function handleSearch(side) {
    let map = side === "L" ? lMap : rMap;
    let places = this.getPlaces();
    map.setCenter(places[0].geometry.location);

    let index = side === "L" ? 0 : 1;
    names[index] = places[0].vicinity;

    if (names[0] && names[1]) {
        document.title = `Comparison: ${names.join(" & ")}`;
    } else {
        document.title = "Map Comparison";
    }
}

function handleMapType() {
    rMap.setMapTypeId(lMap.getMapTypeId());
}

window.$ = s => document.querySelector(s);
