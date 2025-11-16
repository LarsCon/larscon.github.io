// Tab switching functionality for Presentations & Media page
document.addEventListener('DOMContentLoaded', function () {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${targetTab}-content`).classList.add('active');
        });
    });

    // View More functionality for presentations sections
    const presentationsSectionGroups = document.querySelectorAll('.presentations-section-group');

    presentationsSectionGroups.forEach(section => {
        const presentationsList = section.querySelector('.presentations-list');
        const viewMoreBtn = section.querySelector('.view-more-btn');

        if (!presentationsList || !viewMoreBtn) return;

        const items = presentationsList.querySelectorAll('.presentation-item');

        // Hide items after the first 3
        items.forEach((item, index) => {
            if (index >= 3) {
                item.classList.add('presentation-item-hidden');
            }
        });

        // Hide button if there are 3 or fewer items
        if (items.length <= 3) {
            viewMoreBtn.style.display = 'none';
        }

        // Toggle view more
        viewMoreBtn.addEventListener('click', () => {
            const isExpanded = section.classList.contains('expanded');

            if (isExpanded) {
                // Collapse: hide items after first 3
                items.forEach((item, index) => {
                    if (index >= 3) {
                        item.classList.add('presentation-item-hidden');
                    }
                });
                viewMoreBtn.textContent = 'View More';
                section.classList.remove('expanded');
            } else {
                // Expand: show all items
                items.forEach(item => {
                    item.classList.remove('presentation-item-hidden');
                });
                viewMoreBtn.textContent = 'View Less';
                section.classList.add('expanded');
            }
        });
    });
});
