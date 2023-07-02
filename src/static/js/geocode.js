const access_token = "AAPK0935c5e69f6b41209b83b65c6d1142c8RhIxwlDmGo6x9fm-BgdVEy711mRD4k4MKxOqiivNeSOTM9ek-MzTAqTjql9L-kZj"

export function getGeoCode(place) {
    fetch(`https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?token=${access_token}&f=pjson&singleLine=${place}`)
        .then(response => response.json())
        // .then(data => console.log(data))
        .catch(error => console.error(error))
};