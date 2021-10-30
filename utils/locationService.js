
var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
}

export function success(pos) {
  var crd = pos.coords;

  console.log("Your current position is:");
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
  console.log(`More or less ${crd.accuracy} meters.`);
}

function error(err) {
  console.log(err)
}

export async function setupGeolocate(callback) {
  if (navigator.geolocation) {
    await navigator.permissions
      .query({ name: 'geolocation' })
      .then(result => {
        switch (result.state) {
          case 'denied':
            console.log('denied')
            setTimeout(setupGeolocate, 1)
            break

          case 'prompt':
            navigator.geolocation.getCurrentPosition(
              (...args) => {
                setTimeout(() => {
                  callback(...args); setupGeolocate(callback)
                }, 5000)
              }, (...args) => {
                setTimeout(() => {
                  error(...args); setupGeolocate(callback)
                }, 5000)
                error(setupGeolocate, ...args)
              }, options
            )
            break

          case 'granted':
            navigator.geolocation.getCurrentPosition(
              (...args) => { 
                setTimeout(() => {
                  callback(...args); setupGeolocate(callback)
                }, 5000)
              }
            )
            break
        }
      })
  }

}
