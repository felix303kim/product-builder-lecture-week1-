document.addEventListener('DOMContentLoaded', () => {
    const lottoNumbersContainer = document.getElementById('lotto-numbers');
    const generateBtn = document.getElementById('generate-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const THEME_STORAGE_KEY = 'lotto-theme';

    function generateLottoNumbers() {
        const numbers = new Set();
        while (numbers.size < 6) {
            const randomNumber = Math.floor(Math.random() * 45) + 1;
            numbers.add(randomNumber);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }

    function displayLottoNumbers() {
        lottoNumbersContainer.innerHTML = '';
        const numbers = generateLottoNumbers();
        numbers.forEach(number => {
            const numberElement = document.createElement('div');
            numberElement.classList.add('lotto-number');
            numberElement.textContent = number;
            numberElement.style.backgroundColor = getNumberColor(number);
            lottoNumbersContainer.appendChild(numberElement);
        });
    }

    function getNumberColor(number) {
        if (number <= 10) return '#f39c12'; // Yellow
        if (number <= 20) return '#3498db'; // Blue
        if (number <= 30) return '#e74c3c'; // Red
        if (number <= 40) return '#2ecc71'; // Green
        return '#9b59b6'; // Purple
    }

    function applyTheme(theme) {
        const isLightMode = theme === 'light';
        document.body.classList.toggle('light-mode', isLightMode);
        themeToggleBtn.textContent = isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }

    function initializeTheme() {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        const initialTheme = savedTheme || (prefersLight ? 'light' : 'dark');
        applyTheme(initialTheme);
    }

    function toggleTheme() {
        const nextTheme = document.body.classList.contains('light-mode') ? 'dark' : 'light';
        applyTheme(nextTheme);
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    }

    generateBtn.addEventListener('click', displayLottoNumbers);
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Initial load
    initializeTheme();
    displayLottoNumbers();
});
