// Authentication Check - Include this on every page
(function () {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('ostech_authenticated');

    // If not authenticated and not on the gate page, redirect to gate
    if (!isAuthenticated && !window.location.pathname.endsWith('gate.html')) {
        // Get the base directory (everything before the last file/folder)
        const currentPath = window.location.pathname;
        let baseDir;

        if (currentPath.includes('/pages/')) {
            // We're in a subfolder, go to root of project
            baseDir = currentPath.split('/pages/')[0];
        } else {
            // We're at root level, just get directory
            baseDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
        }

        window.location.href = baseDir + '/gate.html';
    }
})();

