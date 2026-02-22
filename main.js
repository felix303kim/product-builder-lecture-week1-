document.addEventListener('DOMContentLoaded', () => {
    const lottoNumbersContainer = document.getElementById('lotto-numbers');
    const generateBtn = document.getElementById('generate-btn');

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

    generateBtn.addEventListener('click', displayLottoNumbers);

    // Initial load
    displayLottoNumbers();
});
