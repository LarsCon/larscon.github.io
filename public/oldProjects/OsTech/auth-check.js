// Authentication Check - Include this on every page
(function () {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('ostech_authenticated');

    // If not authenticated and not on the gate page, redirect to gate
    if (!isAuthenticated && !window.location.pathname.endsWith('gate.html')) {
        // Get base URL
        const currentURL = window.location.href;
        let baseURL;

        if (currentURL.includes('/pages/')) {
            // We're in a subfolder - get URL up to before /pages/
            baseURL = currentURL.split('/pages/')[0] + '/';
        } else {
            // We're at root - get URL up to last /
            baseURL = currentURL.substring(0, currentURL.lastIndexOf('/') + 1);
        }

        const gateURL = baseURL + 'gate.html';
        console.log('Auth Check - Redirecting to gate:', gateURL);
        window.location.href = gateURL;
    }
})();

