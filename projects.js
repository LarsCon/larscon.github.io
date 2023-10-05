const contentBox = document.querySelector('.contentBox');
const scrollLeft = document.querySelector('.scroll-left');
const scrollRight = document.querySelector('.scroll-right');
const scrollAmount = 525; // Adjust the scroll amount for smoothness

scrollLeft.addEventListener('click', () => {
    smoothScroll(-scrollAmount); // Scroll left by the specified amount
});

scrollRight.addEventListener('click', () => {
    smoothScroll(scrollAmount); // Scroll right by the specified amount
});

function smoothScroll(amount) {
    let start = contentBox.scrollLeft;
    const end = start + amount;
    const step = amount > 0 ? 10 : -10; // Adjust the step size for smoother scrolling
    let timer;

    function scroll() {
        if ((amount > 0 && start < end) || (amount < 0 && start > end)) {
            start += step;
            contentBox.scrollLeft = start;
            timer = requestAnimationFrame(scroll);
        } else {
            cancelAnimationFrame(timer);
        }
    }

    scroll();
}
