// Contact Form Handler
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Show "Coming soon" alert
            alert('Coming soon');

            // Optionally reset the form
            // contactForm.reset();
        });
    }
});

