const scrollContainer = document.querySelector('.contentBox');
const scrollLeftButton = document.querySelector('.scroll-left');
const scrollRightButton = document.querySelector('.scroll-right');

scrollLeftButton.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
});

scrollRightButton.addEventListener('click', () => {
    scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
});

function smoothScroll(amount) {
    let start = contentBox.scrollLeft;
    const end = start + amount;
    const step = amount > 0 ? 15 : -15;
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
