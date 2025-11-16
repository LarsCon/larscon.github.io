// Tab switching functionality for Leadership & Service page
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

    // View More functionality for leadership sections
    const leadershipSectionGroups = document.querySelectorAll('.leadership-section-group');

    leadershipSectionGroups.forEach(section => {
        const leadershipList = section.querySelector('.leadership-list');
        const viewMoreBtn = section.querySelector('.view-more-btn');

        if (!leadershipList || !viewMoreBtn) return;

        const items = leadershipList.querySelectorAll('.leadership-item');

        // Hide items after the first 3
        items.forEach((item, index) => {
            if (index >= 3) {
                item.classList.add('leadership-item-hidden');
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
                        item.classList.add('leadership-item-hidden');
                    }
                });
                viewMoreBtn.textContent = 'View More';
                section.classList.remove('expanded');
            } else {
                // Expand: show all items
                items.forEach(item => {
                    item.classList.remove('leadership-item-hidden');
                });
                viewMoreBtn.textContent = 'View Less';
                section.classList.add('expanded');
            }
        });
    });

    // Dropdown functionality for Academic Service sections
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const section = toggle.closest('.dropdown-section');
            const isActive = section.classList.contains('active');

            // Close all dropdowns
            document.querySelectorAll('.dropdown-section').forEach(s => {
                s.classList.remove('active');
                s.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
            });

            // Toggle current dropdown
            if (!isActive) {
                section.classList.add('active');
                toggle.setAttribute('aria-expanded', 'true');
            }
        });
    });
});

