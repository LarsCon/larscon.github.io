// Determine base path based on current directory
const isInTabsFolder = window.location.pathname.includes('/tabs/');
const isInTabsSubfolder = window.location.pathname.match(/\/tabs\/[^\/]+\//);
const basePath = isInTabsSubfolder ? '../../components/' : (isInTabsFolder ? '../components/' : 'components/');

// Load navbar component
fetch(basePath + 'navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-placeholder').innerHTML = data;

        // Fix navigation paths based on current directory
        const navHome = document.getElementById('nav-home');
        const navAbout = document.getElementById('nav-about');
        const navPublications = document.getElementById('nav-publications');
        const navExperience = document.getElementById('nav-experience');
        const navPresentations = document.getElementById('nav-presentations');
        const navLeadership = document.getElementById('nav-leadership');
        const navConnect = document.getElementById('nav-connect');

        // Set headshot image path
        const photoBasePath = isInTabsSubfolder ? '../../photos/' : (isInTabsFolder ? '../photos/' : 'photos/');
        const navHeadshot = document.getElementById('nav-headshot');
        if (navHeadshot) {
            navHeadshot.src = photoBasePath + 'ashleymaeconard_square_2-scaled.jpeg';
        }

        if (isInTabsSubfolder) {
            // We're in a tabs subfolder (e.g., tabs/publications/)
            if (navHome) navHome.href = '../../index.html';
            if (navAbout) navAbout.href = '../../index.html';
            if (navPublications) navPublications.href = '../publications/publications.html';
            if (navExperience) navExperience.href = '../experience/experience.html';
            if (navPresentations) navPresentations.href = '../presentations/presentations.html';
            if (navLeadership) navLeadership.href = '../leadership/leadership.html';
            if (navConnect) navConnect.href = '../connect/connect.html';
        } else if (isInTabsFolder) {
            // We're in tabs folder (legacy - shouldn't happen now)
            if (navHome) navHome.href = '../index.html';
            if (navAbout) navAbout.href = '../index.html';
            if (navPublications) navPublications.href = 'publications/publications.html';
            if (navExperience) navExperience.href = 'experience/experience.html';
            if (navPresentations) navPresentations.href = 'presentations/presentations.html';
            if (navLeadership) navLeadership.href = 'leadership/leadership.html';
            if (navConnect) navConnect.href = 'connect/connect.html';
        } else {
            // We're in root
            if (navHome) navHome.href = 'index.html';
            if (navAbout) navAbout.href = 'index.html';
            if (navPublications) navPublications.href = 'tabs/publications/publications.html';
            if (navExperience) navExperience.href = 'tabs/experience/experience.html';
            if (navPresentations) navPresentations.href = 'tabs/presentations/presentations.html';
            if (navLeadership) navLeadership.href = 'tabs/leadership/leadership.html';
            if (navConnect) navConnect.href = 'tabs/connect/connect.html';
        }

        // Set active nav item based on current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const pathParts = window.location.pathname.split('/').filter(p => p);
        const isPublications = pathParts.includes('publications') || currentPage === 'publications.html';
        const isExperience = pathParts.includes('experience') || currentPage === 'experience.html';
        const isPresentations = pathParts.includes('presentations') || currentPage === 'presentations.html';
        const isLeadership = pathParts.includes('leadership') || currentPage === 'leadership.html';
        const isConnect = pathParts.includes('connect') || currentPage === 'connect.html';

        if (currentPage === 'index.html' || currentPage === '' || pathParts.length === 0) {
            const aboutLink = document.getElementById('nav-about');
            if (aboutLink) aboutLink.classList.add('active');
        } else if (isPublications) {
            const pubLink = document.getElementById('nav-publications');
            if (pubLink) pubLink.classList.add('active');
        } else if (isExperience) {
            const experienceLink = document.getElementById('nav-experience');
            if (experienceLink) experienceLink.classList.add('active');
        } else if (isPresentations) {
            const presentationsLink = document.getElementById('nav-presentations');
            if (presentationsLink) presentationsLink.classList.add('active');
        } else if (isLeadership) {
            const leadershipLink = document.getElementById('nav-leadership');
            if (leadershipLink) leadershipLink.classList.add('active');
        } else if (isConnect) {
            const connectLink = document.getElementById('nav-connect');
            if (connectLink) connectLink.classList.add('active');
        }

        // Initialize theme toggle after navbar is loaded
        initializeThemeToggle();

        // Initialize hamburger menu
        initializeHamburgerMenu();
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

// Hamburger Menu Initialization
function initializeHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        // Add nav-ready class after a brief delay to enable transitions
        setTimeout(() => {
            navLinks.classList.add('nav-ready');
        }, 50);

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
}

// Load hero component
fetch(basePath + 'hero.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('hero-placeholder').innerHTML = data;

        // Fix image paths based on current directory
        const photoBasePath = isInTabsSubfolder ? '../../photos/' : (isInTabsFolder ? '../photos/' : 'photos/');

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
            if (isInTabsSubfolder) {
                footerConnect.href = '../connect/connect.html';
            } else if (isInTabsFolder) {
                footerConnect.href = 'connect/connect.html';
            } else {
                footerConnect.href = 'tabs/connect/connect.html';
            }
        }
    })
    .catch(error => console.error('Error loading footer:', error));

