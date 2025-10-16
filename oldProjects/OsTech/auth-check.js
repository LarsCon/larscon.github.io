// Authentication Check - Include this on every page
(function () {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('ostech_authenticated');

    // If not authenticated and not on the gate page, redirect to gate
    if (!isAuthenticated && !window.location.pathname.endsWith('gate.html')) {
        // Calculate relative path to gate.html
        const currentPath = window.location.pathname;
        const depth = (currentPath.match(/\//g) || []).length - 1;
        const relativePath = '../'.repeat(depth) + 'gate.html';
        window.location.href = relativePath;
    }
})();

