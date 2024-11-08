<!DOCTYPE html>
<html>
<body>
    <h2>FRONTPAGE</h2>
    <button type="button" onclick="document.getElementById('demo').innerHTML = Date()">
        Click me to display Date and Time.
    </button>
    <p id="demo"></p>
</body>
</html>

document.querySelector('.btn-3d').addEventListener('click', function (e) {

    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.style.left = ${x}px;
    ripple.style.top = ${y}px;
    ripple.classList.add('ripple');

    this.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
});

const bodyframe = document.querySelector('bodyframe');
let startTime = null;
let reverse = false;
let alternateAngle = false;

function animateDimensionalEffect(timestamp) {
    if (!startTime) startTime = timestamp;
    let progress = (timestamp - startTime) / 3000;

    if (progress >=1) {
        reverse = !reverse;
        alternateAngle =!alternateAngle;
        startTime = timestamp;
        progress = 0;
    }

    let directionMultiplier = reverse ? -1 : 1;
    let angleMultiplier = alternateAngle ? -1 : 1;

    let rotateX = Math.sin(progress * 2 * Math.PI) * 20 * directionMultiplier;
    let rotateY = Math.cos(progress * 2 * Math.PI) * 20 * angleMultiplier;
    let scale = 1 + Math.sin(progress * 2 * Math.PI + Math.random() * 0.1) * 0.1;

    let translateZ = Math.sin(progress * 2 * Math.PI) * 100 * directionMultiplier;

    bodyframe.style.transform = 'perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})';

    let brightness = 1 + Math.sin(progress * 2 * Math.PI) * 0.2;
    bodyframe.style.filter = 'brightness(${brightness})';

    let colorHue = (progress * 360 * (reverse ? -1 : 1)) & 360;
    bodyframe.style.background = 'radial-gradient(circle, hsla(${colorHue}, 135deg, #ff0000 7%, #FFD700 50.33%, #FFB732 40.66%) 0%, rgba(135deg, #ff0000 7%, #FFD700 50.33%, #FFB732 40.66%) 70%)';

    if (progress < 1) {
        requestAnimationFrame(animateDimensionalEffect);
    } else {
        startTime = null;
        requestAnimationFrame(animateDimensionalEffect);
    }
}

requestAnimationFrame(animateDimensionalEffect);