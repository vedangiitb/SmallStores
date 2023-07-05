mapboxgl.accessToken = 'pk.eyJ1IjoidmVkYW5naWl0YiIsImEiOiJjbGl2dHg0emkwY2R2M3NuNTF2c2Z2NHp4In0.yRK2FNlaIwNGujG51viPuw';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: store.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});
//console.log(store.geometry.coordinates)
map.addControl(new mapboxgl.NavigationControl());
new mapboxgl.Marker()
    .setLngLat(store.geometry.coordinates) 
    .setPopup(
        new mapboxgl.Popup({offset:25})
            .setHTML(
                `<h3>${store.title}</h3>`
            )
         )
.addTo(map)