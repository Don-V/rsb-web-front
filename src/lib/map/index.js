import { showError } from '../../mixins/notifiable';
import redirect from '../navigator';
import { scriptHandler } from '../utils';

const googleScriptName = 'rsb-google-maps';

export async function getCurrentLocation() {
    let position = {};
    try {
        const { coords } = await _getCurrentLocation();
        position = {
            lat: coords.latitude,
            lng: coords.longitude,
        }
    } catch (err) {
        position = Promise.resolve({ lat: 42.41315919699359, lng: -92.42620756015623 });

        // if err.code === 1 that means the user refused to let us get their location
        if (err.code === 1) {
            //notify the user that we need their location
            showError({ title: 'Location not found', message: 'You might have disabled location services on your browser. This app works best with location turned on' })
        } else {
            //TODO: log the unknown error   
            showError('An unknown error has occurred');
        }
        redirect();
    }

    return position;
}

const _getCurrentLocation = () => {
    return new Promise(function (resolve, reject) {
        //TODO: check if browser supports navigator.geolocation
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
};

export const googleApiKey = 'AIzaSyABplRWPbn89WsMUko7bMI83SXCiWVTHLY';
export const googleApiVersion = '3.28';

export const loadGoogleMaps = () => scriptHandler.load(`https://maps.googleapis.com/maps/api/js?v=${googleApiVersion}&key=${googleApiKey}&libraries=places`, { async: true, name: googleScriptName });

export const removeGoogleMaps = () => {
    scriptHandler.remove({ name: googleScriptName });
    delete window.google.maps;
    delete window.google;
}