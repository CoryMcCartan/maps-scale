const FT_PER_METER = 3.28084;
const circleStroke = "#888888";

let lMap, rMap;
let lCircle, rCircle;
let leftLevel = 0, rightLevel = 0;

let names = new Array(2);

function init() {
    let options = {
        zoom: 9,
        streetViewControl: false,
        fullscreenControl: false,
    };

    let leftOptions = {
        zoomControl: false,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP,
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
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
    lMap.controls[google.maps.ControlPosition.LEFT_BOTTOM].push($("#ruler"));

    lBox.addListener("places_changed", handleSearch.bind(lBox, "L"));
    rBox.addListener("places_changed", handleSearch.bind(rBox, "R"));

    let circleOptions = {
        strokeColor: circleStroke,
        strokeOpacity: 0.7,
        strokeWeight: 2,
        fillColor: "#aa44ff",
        fillOpacity: 0.30,
        radius: 8046.72, // 5 miles
        editable: true,
        draggable: true,
        geodesic: true,
        visible: false,
    };

    let leftCircleOptions = {
        map: lMap,
        center: leftOptions.center,
    };
    Object.assign(leftCircleOptions, circleOptions);

    let rightCircleOptions = {
        map: rMap,
        center: rightOptions.center,
    };
    Object.assign(rightCircleOptions, circleOptions);

    lCircle = new google.maps.Circle(leftCircleOptions);
    rCircle = new google.maps.Circle(rightCircleOptions);
    let leftRadius = rightRadius = circleOptions.radius;
    $("#rulerText").innerText = formatRadius(rightRadius);
    let circlesVisible = false;

    google.maps.event.addListener(lCircle, "radius_changed", function() {
        leftRadius = lCircle.getRadius();
        if (rightRadius !== leftRadius) rCircle.setRadius(leftRadius);
        $("#rulerText").innerText = formatRadius(leftRadius);
    });
    google.maps.event.addListener(rCircle, "radius_changed", function() {
        rightRadius = rCircle.getRadius();
        if (rightRadius !== leftRadius) lCircle.setRadius(rightRadius);
        $("#rulerText").innerText = formatRadius(rightRadius);
    });

    $("#rulerToggle").addEventListener("click", function() {
        circlesVisible = !circlesVisible;
        lCircle.setVisible(circlesVisible);
        rCircle.setVisible(circlesVisible);
        $("#rulerIcon").classList = circlesVisible ? ["active"] : [];
        $("#rulerText").hidden = !circlesVisible;
    })
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
    let circle = side === "L" ? lCircle : rCircle;
    let places = this.getPlaces();
    map.setCenter(places[0].geometry.location);
    circle.setCenter(places[0].geometry.location);

    let index = side === "L" ? 0 : 1;
    names[index] = places[0].vicinity;

    if (names[0] && names[1]) {
        document.title = `Comparison: ${names.join(" & ")}`;
    } else {
        document.title = "Map Comparison";
    }
}

function handleMapType() {
    mapType = lMap.getMapTypeId();
    rMap.setMapTypeId(mapType);
    switch (mapType) {
        case "satellite":
        case "hybrid":
            lCircle.setOptions({strokeColor: "#ffffff"});
            rCircle.setOptions({strokeColor: "#ffffff"});
            $("#rulerText").classList = ["white"];
            break;
        case "roadmap":
        case "terrain":
            lCircle.setOptions({strokeColor: circleStroke});
            rCircle.setOptions({strokeColor: circleStroke});
            $("#rulerText").classList = [];
            break;
    }
}

function formatRadius(radius) {
    ft = radius * FT_PER_METER; 
    if (ft > 2640) {
        mi = ft / 5280
        if (mi <= 20) {
            return mi.toFixed(2) + " mi";
        } else if (mi <= 100) {
            return mi.toFixed(1) + " mi";
        } else {
            return mi.toFixed(0) + " mi";
        }
    } else {
        return ft.toFixed(0) + " ft";
    }
}


window.$ = s => document.querySelector(s);
