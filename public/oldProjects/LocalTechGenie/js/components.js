// ===============================================
// Component Loader - Loads navbar and footer
// ===============================================

async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error(`Error loading component from ${componentPath}:`, error);
    }
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', async function () {
    // Load navbar and footer
    await loadComponent('navbar-placeholder', '../components/navbar.html');
    await loadComponent('footer-placeholder', '../components/footer.html');

    // After components are loaded, set up navigation
    setupNavigation();
    setupMobileMenu();
    setupContactForm();
    setupNavbarScroll();
});

function setupNavigation() {
    // Set active nav link based on current page
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'home';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const page = link.getAttribute('data-page');
        if (page === currentPage) {
            link.classList.add('active');
        }
    });
}

function setupMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navMenu.classList.remove('active');
            if (mobileMenuToggle) {
                mobileMenuToggle.classList.remove('active');
            }
        });
    });
}

function setupContactForm() {
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                service: document.getElementById('service').value,
                message: document.getElementById('message').value
            };

            // Basic validation
            if (!formData.name || !formData.email || !formData.message) {
                alert('Please fill in all required fields.');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Success message
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
}

function setupNavbarScroll() {
    const navbar = document.querySelector('.navbar');

    if (navbar) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 20px rgba(212, 175, 55, 0.2)';
            } else {
                navbar.style.boxShadow = '0 4px 20px rgba(212, 175, 55, 0.1)';
            }
        });
    }
}

console.log('Tech Genie website loaded successfully!');
