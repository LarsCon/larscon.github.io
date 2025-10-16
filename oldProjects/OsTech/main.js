// ===================================
// Main JavaScript File
// ===================================


document.addEventListener('DOMContentLoaded', function () {
    // Load Components
    loadComponents();

    // Initialize Navigation
    initNavigation();

    // Initialize Scroll Animations
    initScrollAnimations();

    // Initialize Contact Form
    initContactForm();

    // Update Footer Year
    updateFooterYear();

    // Smooth Scrolling for anchor links
    initSmoothScroll();

    // Initialize Hero Slideshow
    initHeroSlideshow();
});

// ===================================
// Load Components (Navbar, Page Hero & Footer)
// ===================================
async function loadComponents() {
    try {
        // Calculate relative path to components based on current page location
        const path = window.location.pathname;
        let componentsPath;

        // If we're in a subdirectory (pages/), go up one level
        if (path.includes('/pages/')) {
            componentsPath = '../../components/';
        } else {
            // We're at root level
            componentsPath = 'components/';
        }

        // Load Navbar
        const navbarResponse = await fetch(componentsPath + 'navbar.html');
        const navbarHtml = await navbarResponse.text();
        document.getElementById('navbar-container').innerHTML = navbarHtml;

        // Load Page Hero (if container exists)
        const pageHeroContainer = document.getElementById('page-hero-container');
        if (pageHeroContainer) {
            const pageHeroResponse = await fetch(componentsPath + 'page-hero.html');
            const pageHeroHtml = await pageHeroResponse.text();
            pageHeroContainer.innerHTML = pageHeroHtml;

            // Set page title from data attribute
            const pageTitle = pageHeroContainer.getAttribute('data-page-title');
            if (pageTitle) {
                const titleElement = document.getElementById('page-title');
                if (titleElement) {
                    titleElement.textContent = pageTitle;
                }
            }
        }

        // Load Footer
        const footerResponse = await fetch(componentsPath + 'footer.html');
        const footerHtml = await footerResponse.text();
        document.getElementById('footer-container').innerHTML = footerHtml;

        // Re-initialize navigation after components are loaded
        setTimeout(() => {
            setupNavigationLinks();
            initNavigation();
            updateFooterYear();
        }, 100);

    } catch (error) {
        console.error('Error loading components:', error);
    }
}

// ===================================
// Setup Navigation Links with Correct Paths
// ===================================
function setupNavigationLinks() {
    const path = window.location.pathname;
    const inSubfolder = path.includes('/pages/');

    // Determine the base path for navigation
    let basePath = inSubfolder ? '../../' : '';

    // Set logo link
    const logoLink = document.querySelector('.nav-home-link');
    if (logoLink) {
        logoLink.href = basePath + 'index.html';
    }

    // Set logo image source
    const logoImg = document.querySelector('.nav-logo-top .logo-img');
    if (logoImg) {
        logoImg.src = basePath + 'assets/rawLogo.PNG';
    }

    // Set navigation links
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        const page = link.getAttribute('data-page');
        if (page === 'home') {
            link.href = basePath + 'index.html';
        } else {
            link.href = basePath + 'pages/' + page + '/';
        }
    });

    // Fix footer links
    document.querySelectorAll('a[data-footer-link]').forEach(link => {
        const href = link.getAttribute('data-footer-link');
        link.href = basePath + href;
    });
}

// ===================================
// Navigation Functions
// ===================================
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar && window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else if (navbar) {
            navbar.classList.remove('scrolled');
        }
    });

    // Highlight active nav link based on scroll position
    window.addEventListener('scroll', highlightNavLink);
}

function highlightNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ===================================
// Smooth Scrolling
// ===================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const navHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = target.offsetTop - navHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ===================================
// Scroll Animations
// ===================================
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.service-card, .feature-item, .contact-item');

    const revealOnScroll = () => {
        reveals.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('scroll-reveal', 'active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check
}

// ===================================
// Contact Form Handling
// ===================================
function initContactForm() {
    const form = document.getElementById('contactForm');

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                service: document.getElementById('service').value,
                message: document.getElementById('message').value
            };

            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            try {
                // Simulate form submission (replace with actual endpoint)
                await simulateFormSubmission(formData);

                // Show success message
                showNotification('Thank you! Your message has been sent successfully.', 'success');
                form.reset();
            } catch (error) {
                // Show error message
                showNotification('Oops! Something went wrong. Please try again or call us directly.', 'error');
                console.error('Form submission error:', error);
            } finally {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Simulate form submission (replace with actual API call)
function simulateFormSubmission(data) {
    return new Promise((resolve, reject) => {
        console.log('Form data:', data);

        // Simulate network delay
        setTimeout(() => {
            // In a real application, you would send this to your backend
            // For now, we'll just log it and resolve
            resolve({ success: true });
        }, 1500);
    });
}

// Show notification message
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: ${type === 'success' ? '#34a853' : '#ea4335'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 350px;
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Add to DOM
    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// ===================================
// Update Footer Year
// ===================================
function updateFooterYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// ===================================
// Hero Slideshow
// ===================================
function initHeroSlideshow() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    let currentSlide = 0;

    function showNextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    // Change slide every 8 seconds (doubled from 4)
    setInterval(showNextSlide, 8000);
}

// ===================================
// Utility Functions
// ===================================

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

