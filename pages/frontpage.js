document.querySelector('.btn-3d').addEventListener('click', function (e) {
    // Get the position of the button
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create a span element to act as the ripple
    const ripple = document.createElement('span');
    ripple.style.left = ${x}px;
    ripple.style.top = ${y}px;
    ripple.classList.add('ripple');

    // Append the ripple to the button
    this.appendChild(ripple);

    // Remove the ripple after the animation completes
    setTimeout(() => {
        ripple.remove();
    }, 600); // Match this with the duration of the ripple animation