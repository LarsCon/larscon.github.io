const cube = document.querySelector('.cube');
const text = document.getElementById('text');

document.addEventListener('mousemove', (e) => {
    const xPos = -(window.innerWidth / 2 - e.pageX) / 5;
    const yPos = (window.innerHeight / 2 - e.pageY) / 5;

    cube.style.transform = `rotateX(${yPos}deg) rotateY(${xPos}deg)`;

    text.style.opacity = '0';
});
