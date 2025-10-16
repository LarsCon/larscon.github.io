// Authentication Check - Include this on every page
(function () {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('ostech_authenticated');

    // If not authenticated and not on the gate page, redirect to gate
    if (!isAuthenticated && !window.location.pathname.endsWith('gate.html')) {
        window.location.href = '/gate.html';
    }
})();

