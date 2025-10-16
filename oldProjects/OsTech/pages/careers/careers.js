// Careers Page - Toggle Job Details

function toggleOpening(button) {
    const openingCard = button.closest('.opening-card');
    const details = openingCard.querySelector('.opening-details');
    const icon = button.querySelector('i');

    // Close all other openings
    document.querySelectorAll('.opening-details').forEach(detail => {
        if (detail !== details) {
            detail.classList.remove('active');
            detail.closest('.opening-card').querySelector('.toggle-btn').classList.remove('active');
        }
    });

    // Toggle current opening
    details.classList.toggle('active');
    button.classList.toggle('active');
}

// Close opening when clicking outside
document.addEventListener('click', function (event) {
    if (!event.target.closest('.opening-card')) {
        document.querySelectorAll('.opening-details').forEach(detail => {
            detail.classList.remove('active');
            detail.closest('.opening-card').querySelector('.toggle-btn').classList.remove('active');
        });
    }
});

