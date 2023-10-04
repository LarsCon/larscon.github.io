const cube = document.querySelector('.cube');
const cubeContainer = document.querySelector('#cube-container');
const frontFace = document.querySelector('#front-face');

let isMouseOverWindow = true;

document.addEventListener('mouseenter', () => {
    isMouseOverWindow = true;
    frontFace.textContent = ':)';
});

document.addEventListener('mouseleave', () => {
    isMouseOverWindow = false;
    frontFace.textContent = ':(';
});

document.addEventListener('mousemove', (e) => {
    const cubeRect = cubeContainer.getBoundingClientRect();
    const cubeCenterX = cubeRect.left + cubeRect.width / 2;
    const cubeCenterY = cubeRect.top + cubeRect.height / 2;
    const deltaX = e.clientX - cubeCenterX;
    const deltaY = e.clientY - cubeCenterY;
    const rotationY = deltaX / cubeRect.width * 3;
    const rotationX = -deltaY / cubeRect.height * 7;

    cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;

    if (isMouseOverWindow) {
        frontFace.textContent = ':)';
    }
});