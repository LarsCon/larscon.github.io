// Get the container and buttons
const scrollContainer = document.querySelector('.contentBox');
const scrollLeftButton = document.querySelector('.scroll-left');
const scrollRightButton = document.querySelector('.scroll-right');

// Calculate the scroll distance based on container width
function getScrollDistance() {
    return window.innerWidth <= 768 ? 260 : 300;
}

// Track the current scroll animation
let isScrolling = false;

scrollLeftButton.addEventListener('click', () => {
    if (isScrolling) return;
    
    isScrolling = true;
    const scrollDistance = getScrollDistance();
    const currentPosition = scrollContainer.scrollLeft;
    const targetPosition = currentPosition - scrollDistance;
    
    scrollContainer.scrollTo({
        left: targetPosition,
        behavior: 'smooth'
    });
    
    // Reset the scrolling flag after animation completes
    setTimeout(() => {
        isScrolling = false;
    }, 300); // Match this to your scroll animation duration
});

scrollRightButton.addEventListener('click', () => {
    if (isScrolling) return;
    
    isScrolling = true;
    const scrollDistance = getScrollDistance();
    const currentPosition = scrollContainer.scrollLeft;
    const targetPosition = currentPosition + scrollDistance;
    
    scrollContainer.scrollTo({
        left: targetPosition,
        behavior: 'smooth'
    });
    
    // Reset the scrolling flag after animation completes
    setTimeout(() => {
        isScrolling = false;
    }, 300); // Match this to your scroll animation duration
});

// Handle touch events for smoother mobile scrolling
let touchStartX = 0;
let touchEndX = 0;

scrollContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

scrollContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchStartX - touchEndX;
    
    if (Math.abs(swipeDistance) > 50) { // Minimum swipe distance
        const direction = swipeDistance > 0 ? 1 : -1;
        const scrollDistance = getScrollDistance();
        
        scrollContainer.scrollTo({
            left: scrollContainer.scrollLeft + (direction * scrollDistance),
            behavior: 'smooth'
        });
    }
});

// Prevent scroll chaining on iOS
scrollContainer.addEventListener('touchmove', (e) => {
    if (scrollContainer.offsetWidth < scrollContainer.scrollWidth) {
        e.preventDefault();
    }
}, { passive: false });