// Determine base path based on current directory
const isInTabsFolder = window.location.pathname.includes('/tabs/');
const basePath = isInTabsFolder ? '../components/' : 'components/';

// Load navbar component
fetch(basePath + 'navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-placeholder').innerHTML = data;

        // Fix navigation paths based on current directory
        const navHome = document.getElementById('nav-home');
        const navAbout = document.getElementById('nav-about');
        const navPublications = document.getElementById('nav-publications');
        const navConnect = document.getElementById('nav-connect');

        if (isInTabsFolder) {
            // We're in tabs folder
            navHome.href = '../index.html';
            navAbout.href = '../index.html';
            navPublications.href = 'publications.html';
            navConnect.href = 'connect.html';
        } else {
            // We're in root
            navHome.href = 'index.html';
            navAbout.href = 'index.html';
            navPublications.href = 'tabs/publications.html';
            navConnect.href = 'tabs/connect.html';
        }

        // Set active nav item based on current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPage === 'index.html' || currentPage === '') {
            const aboutLink = document.getElementById('nav-about');
            if (aboutLink) aboutLink.classList.add('active');
        } else if (currentPage === 'publications.html') {
            const pubLink = document.getElementById('nav-publications');
            if (pubLink) pubLink.classList.add('active');
        } else if (currentPage === 'connect.html') {
            const connectLink = document.getElementById('nav-connect');
            if (connectLink) connectLink.classList.add('active');
        }

        // Initialize theme toggle after navbar is loaded
        initializeThemeToggle();
    })
    .catch(error => console.error('Error loading navbar:', error));

// Theme Toggle Initialization
function initializeThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', currentTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const theme = htmlElement.getAttribute('data-theme');
            const newTheme = theme === 'light' ? 'dark' : 'light';

            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

// Load hero component
fetch(basePath + 'hero.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('hero-placeholder').innerHTML = data;

        // Fix image paths based on current directory
        const photoBasePath = isInTabsFolder ? '../photos/' : 'photos/';

        const heroPhoto = document.getElementById('hero-photo');
        const githubIcon = document.getElementById('github-icon');
        const linkedinIcon = document.getElementById('linkedin-icon');
        const twitterIcon = document.getElementById('twitter-icon');
        const scholarIcon = document.getElementById('scholar-icon');
        const bloggerIcon = document.getElementById('blogger-icon');

        if (heroPhoto) heroPhoto.src = photoBasePath + 'ashleymaeconard_square_2-scaled.jpeg';
        if (githubIcon) githubIcon.src = photoBasePath + 'github-icon.png';
        if (linkedinIcon) linkedinIcon.src = photoBasePath + 'linkedin-3-256.png';
        if (twitterIcon) twitterIcon.src = photoBasePath + 'x-social-media-logo-icon.png';
        if (scholarIcon) scholarIcon.src = photoBasePath + 'google_scholar_icon_130918.png';
        if (bloggerIcon) bloggerIcon.src = photoBasePath + 'blogger-logo-black-transparent.png';
    })
    .catch(error => console.error('Error loading hero:', error));

// Load footer component
fetch(basePath + 'footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer-placeholder').innerHTML = data;

        // Fix footer link path based on current directory
        const footerConnect = document.getElementById('footer-connect');
        if (footerConnect) {
            if (isInTabsFolder) {
                footerConnect.href = 'connect.html';
            } else {
                footerConnect.href = 'tabs/connect.html';
            }
        }
    })
    .catch(error => console.error('Error loading footer:', error));

