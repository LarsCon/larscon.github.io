const contentBox = document.querySelector('.contentBox');
const scrollLeft = document.querySelector('.scroll-left');
const scrollRight = document.querySelector('.scroll-right');
const scrollAmount = 275;

scrollLeft.addEventListener('click', () => {
    smoothScroll(-scrollAmount);
});

scrollRight.addEventListener('click', () => {
    smoothScroll(scrollAmount);
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
