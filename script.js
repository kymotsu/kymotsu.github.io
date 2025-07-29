const randomNumberSpan = document.getElementById('randomNumber');
const mousePositionSpan = document.getElementById('mousePosition');

let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    mousePositionSpan.textContent = `${mouseX}, ${mouseY}`;
    generateRandomNumber();
});

function generateRandomNumber() {
    const date = new Date();
    const timestamp = date.getTime();
    const mathRand = Math.random();

    // Combine the values into a single string
    const combinedString = `${timestamp}${mathRand}${mouseX}${mouseY}`;

    // Hash the string to create a more random-looking number
    let hash = 0;
    for (let i = 0; i < combinedString.length; i++) {
        const char = combinedString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }

    // Make the hash positive and take the modulo to get a number in a specific range
    const finalRandomNumber = Math.abs(hash) % 1000000; // Example range: 0-999999

    randomNumberSpan.textContent = finalRandomNumber;
}
