document.addEventListener('DOMContentLoaded', () => {
    const lottoNumbersContainer = document.getElementById('lotto-numbers');
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const saveBtn = document.getElementById('save-btn');
    const includeInput = document.getElementById('include-numbers');
    const excludeInput = document.getElementById('exclude-numbers');
    const setCountInput = document.getElementById('set-count');
    const favoriteNoteInput = document.getElementById('favorite-note');
    const generatorMessage = document.getElementById('generator-message');
    const favoritesList = document.getElementById('favorites-list');
    const favoritesEmpty = document.getElementById('favorites-empty');

    const checkBtn = document.getElementById('check-btn');
    const resetCheckerBtn = document.getElementById('reset-checker');
    const winningInput = document.getElementById('winning-numbers');
    const bonusInput = document.getElementById('bonus-number');
    const myNumbersInput = document.getElementById('my-numbers');
    const checkerResult = document.getElementById('checker-result');

    const calcOddsBtn = document.getElementById('calc-odds');
    const ticketCountInput = document.getElementById('ticket-count');
    const oddsOutput = document.getElementById('odds-output');

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const THEME_STORAGE_KEY = 'lotto-theme';
    const FAVORITES_KEY = 'lotto-favorites';
    const LAST_RESULTS_KEY = 'lotto-last-results';

    const RANGE_MIN = 1;
    const RANGE_MAX = 45;

    const safeText = (value) => (value || '').trim();

    function parseNumberList(value) {
        if (!value) return [];
        const nums = value
            .split(/[^0-9]+/)
            .map((num) => parseInt(num, 10))
            .filter((num) => !Number.isNaN(num));
        const unique = Array.from(new Set(nums));
        return unique.filter((num) => num >= RANGE_MIN && num <= RANGE_MAX);
    }

    function formatNumbers(numbers) {
        return numbers.join(', ');
    }

    function getNumberColor(number) {
        if (number <= 10) return '#f59f0b';
        if (number <= 20) return '#38bdf8';
        if (number <= 30) return '#f97316';
        if (number <= 40) return '#22c55e';
        return '#a855f7';
    }

    function generateLottoSet(include, exclude) {
        const numbers = new Set(include);
        const available = [];
        for (let i = RANGE_MIN; i <= RANGE_MAX; i += 1) {
            if (!numbers.has(i) && !exclude.includes(i)) {
                available.push(i);
            }
        }
        while (numbers.size < 6 && available.length > 0) {
            const pickIndex = Math.floor(Math.random() * available.length);
            const pick = available.splice(pickIndex, 1)[0];
            numbers.add(pick);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }

    function renderSets(sets) {
        if (!lottoNumbersContainer) return;
        lottoNumbersContainer.innerHTML = '';
        sets.forEach((numbers, index) => {
            const row = document.createElement('div');
            row.className = 'lotto-set';
            row.setAttribute('aria-label', `세트 ${index + 1}`);
            numbers.forEach((number) => {
                const ball = document.createElement('div');
                ball.className = 'lotto-number';
                ball.textContent = number;
                ball.style.backgroundColor = getNumberColor(number);
                row.appendChild(ball);
            });
            lottoNumbersContainer.appendChild(row);
        });
    }

    function setGeneratorMessage(text, isError = false) {
        if (!generatorMessage) return;
        generatorMessage.textContent = text;
        generatorMessage.style.color = isError ? '#f97316' : '';
    }

    function generateSets() {
        const include = parseNumberList(safeText(includeInput?.value));
        const exclude = parseNumberList(safeText(excludeInput?.value));
        const setCount = Math.min(Math.max(parseInt(setCountInput?.value || '1', 10), 1), 10);

        if (include.length > 6) {
            setGeneratorMessage('포함 번호는 최대 6개까지 가능합니다.', true);
            return null;
        }

        const overlap = include.filter((num) => exclude.includes(num));
        if (overlap.length > 0) {
            setGeneratorMessage('포함 번호와 제외 번호가 겹칩니다.', true);
            return null;
        }

        const availableCount = RANGE_MAX - RANGE_MIN + 1 - exclude.length;
        if (availableCount < 6) {
            setGeneratorMessage('제외 번호가 너무 많습니다.', true);
            return null;
        }

        const sets = [];
        for (let i = 0; i < setCount; i += 1) {
            const numbers = generateLottoSet(include, exclude);
            sets.push(numbers);
        }

        renderSets(sets);
        localStorage.setItem(LAST_RESULTS_KEY, JSON.stringify(sets));
        setGeneratorMessage(`총 ${sets.length}세트를 생성했습니다.`);
        return sets;
    }

    function loadLastResults() {
        if (!lottoNumbersContainer) return;
        const saved = localStorage.getItem(LAST_RESULTS_KEY);
        if (!saved) return;
        try {
            const sets = JSON.parse(saved);
            if (Array.isArray(sets) && sets.length > 0) {
                renderSets(sets);
            }
        } catch (error) {
            // ignore
        }
    }

    function copyResults() {
        const saved = localStorage.getItem(LAST_RESULTS_KEY);
        if (!saved) {
            setGeneratorMessage('복사할 결과가 없습니다. 먼저 번호를 생성하세요.', true);
            return;
        }
        let sets = [];
        try {
            sets = JSON.parse(saved);
        } catch (error) {
            setGeneratorMessage('결과를 불러오는 데 실패했습니다.', true);
            return;
        }
        const text = sets.map((set, index) => `세트 ${index + 1}: ${formatNumbers(set)}`).join('\n');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                setGeneratorMessage('결과가 클립보드에 복사되었습니다.');
            }).catch(() => {
                setGeneratorMessage('복사에 실패했습니다.', true);
            });
        } else {
            setGeneratorMessage('클립보드 복사를 지원하지 않는 브라우저입니다.', true);
        }
    }

    function getFavorites() {
        try {
            return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
        } catch (error) {
            return [];
        }
    }

    function saveFavorites(favorites) {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }

    function renderFavorites() {
        if (!favoritesList) return;
        const favorites = getFavorites();
        favoritesList.innerHTML = '';
        if (favoritesEmpty) {
            favoritesEmpty.style.display = favorites.length === 0 ? 'block' : 'none';
        }
        if (favorites.length === 0) {
            return;
        }
        favorites.forEach((item, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'favorite-item';

            const header = document.createElement('div');
            header.className = 'favorite-header';
            header.textContent = `${item.note || '저장된 번호'} · ${item.savedAt}`;

            const numbersRow = document.createElement('div');
            numbersRow.className = 'lotto-set';
            item.numbers.forEach((num) => {
                const ball = document.createElement('div');
                ball.className = 'lotto-number';
                ball.textContent = num;
                ball.style.backgroundColor = getNumberColor(num);
                numbersRow.appendChild(ball);
            });

            const actions = document.createElement('div');
            actions.className = 'favorite-actions';
            const removeBtn = document.createElement('button');
            removeBtn.className = 'ghost-btn';
            removeBtn.type = 'button';
            removeBtn.textContent = '삭제';
            removeBtn.addEventListener('click', () => {
                const updated = getFavorites().filter((_, idx) => idx !== index);
                saveFavorites(updated);
                renderFavorites();
            });
            actions.appendChild(removeBtn);

            wrapper.appendChild(header);
            wrapper.appendChild(numbersRow);
            wrapper.appendChild(actions);
            favoritesList.appendChild(wrapper);
        });
    }

    function saveCurrentToFavorites() {
        const saved = localStorage.getItem(LAST_RESULTS_KEY);
        if (!saved) {
            setGeneratorMessage('저장할 번호가 없습니다. 먼저 번호를 생성하세요.', true);
            return;
        }
        let sets = [];
        try {
            sets = JSON.parse(saved);
        } catch (error) {
            setGeneratorMessage('저장에 실패했습니다.', true);
            return;
        }
        if (!Array.isArray(sets) || sets.length === 0) {
            setGeneratorMessage('저장할 번호가 없습니다.', true);
            return;
        }
        const favorites = getFavorites();
        const note = safeText(favoriteNoteInput?.value);
        const savedAt = new Date().toLocaleDateString('ko-KR');
        sets.forEach((numbers) => {
            favorites.unshift({ numbers, note, savedAt });
        });
        saveFavorites(favorites.slice(0, 20));
        renderFavorites();
        setGeneratorMessage('즐겨찾기에 저장했습니다.');
    }

    function checkNumbers() {
        if (!checkerResult) return;
        const winning = parseNumberList(safeText(winningInput?.value));
        const bonus = parseInt(bonusInput?.value || '', 10);
        const mine = parseNumberList(safeText(myNumbersInput?.value));

        if (winning.length !== 6 || mine.length !== 6 || Number.isNaN(bonus)) {
            checkerResult.textContent = '당첨 번호 6개와 보너스 번호, 내 번호 6개를 정확히 입력하세요.';
            return;
        }

        const matches = mine.filter((num) => winning.includes(num));
        const matchCount = matches.length;
        const bonusMatch = mine.includes(bonus);

        let grade = '낙첨';
        if (matchCount === 6) grade = '1등';
        else if (matchCount === 5 && bonusMatch) grade = '2등';
        else if (matchCount === 5) grade = '3등';
        else if (matchCount === 4) grade = '4등';
        else if (matchCount === 3) grade = '5등';

        checkerResult.textContent = `일치 번호 ${matchCount}개${bonusMatch ? ' + 보너스' : ''} → ${grade}`;
    }

    function resetChecker() {
        if (winningInput) winningInput.value = '';
        if (bonusInput) bonusInput.value = '';
        if (myNumbersInput) myNumbersInput.value = '';
        if (checkerResult) checkerResult.textContent = '';
    }

    function calculateOdds() {
        if (!oddsOutput) return;
        const count = Math.min(Math.max(parseInt(ticketCountInput?.value || '1', 10), 1), 100);
        const firstOdds = 1 / 8145060;
        const anyOdds = 1 / 42;

        const firstChance = 1 - Math.pow(1 - firstOdds, count);
        const anyChance = 1 - Math.pow(1 - anyOdds, count);

        oddsOutput.innerHTML = `
            <p>구매 게임 수: ${count}게임</p>
            <p>1등 이상 당첨 확률: ${(firstChance * 100).toFixed(6)}%</p>
            <p>전체 등수 당첨 확률: ${(anyChance * 100).toFixed(3)}%</p>
        `;
    }

    function applyTheme(theme) {
        const isLightMode = theme === 'light';
        document.body.classList.toggle('light-mode', isLightMode);
        if (themeToggleBtn) {
            themeToggleBtn.textContent = isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode';
        }
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

    if (generateBtn) generateBtn.addEventListener('click', generateSets);
    if (copyBtn) copyBtn.addEventListener('click', copyResults);
    if (saveBtn) saveBtn.addEventListener('click', saveCurrentToFavorites);
    if (checkBtn) checkBtn.addEventListener('click', checkNumbers);
    if (resetCheckerBtn) resetCheckerBtn.addEventListener('click', resetChecker);
    if (calcOddsBtn) calcOddsBtn.addEventListener('click', calculateOdds);
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);

    initializeTheme();
    loadLastResults();
    renderFavorites();
});
