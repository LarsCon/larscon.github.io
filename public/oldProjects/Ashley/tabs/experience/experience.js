// Tab switching functionality
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const tabNav = document.querySelector('.tab-nav');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Show corresponding content
            const targetContent = document.getElementById(`${targetTab}-content`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // Add shadow to tab nav when scrolling
    if (tabNav) {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) {
                    tabNav.classList.add('stuck');
                } else {
                    tabNav.classList.remove('stuck');
                }
            },
            { threshold: [1] }
        );

        // Create a sentinel element right above the tab nav
        const sentinel = document.createElement('div');
        sentinel.style.height = '1px';
        tabNav.parentNode.insertBefore(sentinel, tabNav);
        observer.observe(sentinel);
    }

    // View More functionality for experience sections
    const experienceSectionGroups = document.querySelectorAll('.experience-section-group');

    experienceSectionGroups.forEach(section => {
        const experienceList = section.querySelector('.experience-list');
        const viewMoreBtn = section.querySelector('.view-more-btn');

        if (!experienceList || !viewMoreBtn) return;

        const items = experienceList.querySelectorAll('.experience-item');

        // Hide items after the first 3
        items.forEach((item, index) => {
            if (index >= 3) {
                item.classList.add('experience-item-hidden');
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
                        item.classList.add('experience-item-hidden');
                    }
                });
                viewMoreBtn.textContent = 'View More';
                section.classList.remove('expanded');
            } else {
                // Expand: show all items
                items.forEach(item => {
                    item.classList.remove('experience-item-hidden');
                });
                viewMoreBtn.textContent = 'View Less';
                section.classList.add('expanded');
            }
        });
    });
});

