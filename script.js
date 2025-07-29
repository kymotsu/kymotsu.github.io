const randomNumberSpan = document.getElementById('randomNumber');
const mousePositionSpan = document.getElementById('mousePosition');
const timestampSpan = document.getElementById('timestamp');
const mathRandSpan = document.getElementById('mathRand');
const mouseBufferSpan = document.getElementById('mouseBuffer');

let mouseBuffer = [];
let timeout;

function initializeValues() {
    mousePositionSpan.textContent = 'N/A';
    timestampSpan.textContent = 'N/A';
    mathRandSpan.textContent = 'N/A';
    mouseBufferSpan.textContent = 'N/A';
    randomNumberSpan.textContent = 'N/A';

    const header = document.querySelector('h1');
    const scrollbox = document.getElementById('mouseBufferWrapper');
    scrollbox.style.width = `${header.offsetWidth}px`;
}

document.addEventListener('mousemove', (event) => {
    const { clientX, clientY } = event;
    mousePositionSpan.textContent = `${clientX}, ${clientY}`;
    mouseBuffer.push([clientX, clientY]);

    clearTimeout(timeout);
    timeout = setTimeout(generateRandomNumber, 500);
});

function generateRandomNumber() {
    const date = new Date();
    const timestamp = date.getTime();
    const mathRand = Math.random();
    const mouseBufferString = JSON.stringify(mouseBuffer);

    timestampSpan.textContent = timestamp;
    mathRandSpan.textContent = mathRand;
    mouseBufferSpan.textContent = mouseBufferString;

    // Combine the values into a single string
    const combinedString = `${timestamp}${mathRand}${mouseBufferString}`;

    // Hash the string to create a more random-looking number
    let hash = 0;
    for (let i = 0; i < combinedString.length; i++) {
        const char = combinedString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }

    // Make the hash positive and take the modulo to get a number in a specific range
    const finalRandomNumber = Math.abs(hash) % 10000000000; // Example range: 0-9999999999

    randomNumberSpan.textContent = finalRandomNumber;
    mouseBuffer = []; // Clear the buffer
}

initializeValues();

const themeSwitch = document.getElementById('checkbox');

function toggleDarkMode() {
    const body = document.body;
    const container = document.querySelector('.container');
    const h1 = document.querySelector('h1');
    const h2 = document.querySelector('h2');
    const p = document.querySelectorAll('p');
    const randomNumber = document.getElementById('randomNumber');
    const mouseBufferWrapper = document.getElementById('mouseBufferWrapper');

    body.classList.toggle('dark-mode');
    container.classList.toggle('dark-mode');
    h1.classList.toggle('dark-mode');
    h2.classList.toggle('dark-mode');
    p.forEach(el => el.classList.toggle('dark-mode'));
    randomNumber.classList.toggle('dark-mode');
    mouseBufferWrapper.classList.toggle('dark-mode');
}

themeSwitch.addEventListener('change', toggleDarkMode);
