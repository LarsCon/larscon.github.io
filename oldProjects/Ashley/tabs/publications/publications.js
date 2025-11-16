// Handle expandable publication cards
document.addEventListener('DOMContentLoaded', () => {
    const pubCards = document.querySelectorAll('.pub-card');

    pubCards.forEach(card => {
        // Make entire card clickable
        const toggleExpand = () => {
            card.classList.toggle('expanded');
            card.classList.toggle('collapsed');
        };

        card.addEventListener('click', (e) => {
            // Don't toggle if clicking on a link
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return;
            }
            toggleExpand();
        });

        // Prevent link clicks from bubbling
        const links = card.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    });
});

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
});

