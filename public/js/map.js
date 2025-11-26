document.addEventListener("DOMContentLoaded", () => {
  mapboxgl.accessToken = mapToken;
  if (
    listing.geometry &&
    listing.geometry.coordinates &&
    listing.geometry.coordinates.length === 2
  ) {
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: listing.geometry.coordinates,
      zoom: 9,
    });

    const el = document.createElement("div");
    el.className = "custom-marker";
    el.style.backgroundImage = "url('/favicon.svg')";
    el.style.width = "35px";
    el.style.height = "35px";
    el.style.backgroundSize = "cover";
    el.style.borderRadius = "50%";

    new mapboxgl.Marker({ element: el, color: "#fe424d" })
      .setLngLat(listing.geometry.coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<h5>${listing.title}</h5><p>Exact Location provided after booking</p>`
        )
      )
      .addTo(map);

    map.addControl(
      new mapboxgl.GeolocateControl({
        trackUserLocation: true,
        showUserLocation: true,
        showAccuracyCircle: true,
        showUserHeading: true,
      })
    );
    // Add a circle layer around listing coordinates
    map.on("load", () => {
      map.addSource("listing-radius", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: listing.geometry.coordinates,
          },
        },
      });

      map.addLayer({
        id: "listing-radius-circle",
        type: "circle",
        source: "listing-radius",
        paint: {
          "circle-radius": 70, // in pixels
          "circle-color": "#fe424d",
          "circle-opacity": 0.2,
        },
      });
    });
  } else {
    console.error("Invalid geometry:", listing.geometry);
    document.getElementById("map").innerHTML =
      "<p>Map unavailable for this listing</p>";
  }
});
