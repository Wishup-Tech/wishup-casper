// fetchGeoLocation.js
// Returns the Cloudflare-detected country (e.g., "IN" or "US").
// Caches results in cookies named `geoLocation` and `clientIP` as requested.

(function () {
    'use strict';

    function fetchGeoLocation() {
        function getCookie(name) {
            var value = '; ' + document.cookie;
            var parts = value.split('; ' + name + '=');
            if (parts.length === 2) return parts.pop().split(';').shift();
        }

        function setCookie(name, value, days) {
            var expires = new Date(Date.now() + days * 864e5).toUTCString();
            document.cookie = name + '=' + value + '; expires=' + expires + '; path=/';
        }

        // Check if geoLocation cookie exists
        var cachedGeoLocation = getCookie('geoLocation');
        var cachedIP = getCookie('clientIP');

        if (cachedGeoLocation && cachedIP) {
            // Return cached value as-is
            return Promise.resolve(cachedGeoLocation);
        }

        return fetch('https://www.cloudflare.com/cdn-cgi/trace')
            .then(function(response) {
                return response.text();
            })
            .then(function(responseText) {
                // Parse Cloudflare trace into an object
                var data = responseText.replace(/[\r\n]+/g, '","').replace(/\=+/g, '":"');
                data = '{"' + data.slice(0, data.lastIndexOf('","')) + '"}';
                var trace = JSON.parse(data);

                // trace.loc is country (e.g., IN). Normalize to uppercase for consistency
                var geoLocation = (trace.loc || 'US').toString().toUpperCase();
                var ipAddress = trace.ip || '';

                // Store or update geoLocation cookie (7 days)
                setCookie('geoLocation', geoLocation, 7);

                // Always update the IP cookie (30 days)
                if (ipAddress) setCookie('clientIP', ipAddress, 30);

                return geoLocation;
            })
            .catch(function(error) {
                // On failure, default to US
                console.error('[fetchGeoLocation] Error fetching location:', error);
                setCookie('geoLocation', 'US', 7);
                return 'US';
            });
    }

    // Expose for module and global usage
    if (typeof window !== 'undefined') {
        window.fetchGeoLocation = fetchGeoLocation;
    }

    // Support ES module import if bundler is used
    try {
        if (typeof exports === 'object') {
            exports.default = fetchGeoLocation;
        }
    } catch (e) {
        // ignore
    }
})();
