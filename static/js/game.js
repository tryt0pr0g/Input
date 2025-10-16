const inputArea = document.getElementById('checkTextArea');
let checkAreaText = ''; // <-- Глобальная переменная
let text = [];


document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('timer').classList.add('hidden-field');

    document.getElementById('noToken').classList.add('hidden-field')
    const getTextButton = document.getElementById('getText');
    const corrTextArea = document.getElementById('corrTextArea');
    const timer = document.getElementById('timer')
    const postNewTextBtn = document.getElementById('postNewText')

    getTextButton.addEventListener('click', async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('/users/get_random_text', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! ${errorData.detail || 'Unknown error'}`);
            }

            const result = await response.json();

            // Обновляем поле и переменную
            corrTextArea.innerText = result.text;
            checkAreaText = result.text;

            // Сброс ввода
            text = [];
            inputArea.innerHTML = '';
            inputArea.focus();

        }
        catch (error) {
                console.error('Ошибка:', error);
                alert('Не удалось загрузить текст. Попробуйте ещё раз.');
        }
            getTextButton.classList.add('hidden-field');
            timer.classList.remove('hidden-field');
            startGameTimer(3)
    });

    postNewTextBtn.addEventListener('click', async (event) => {
        event.preventDefault();

        const userToken = getUserToken()

        if (userToken) {
            window.location.replace('addText.html')
        }
        else {
            document.getElementById('noToken').classList.remove('hidden-field')
        }
    })

});

inputArea.addEventListener('keydown', function(event) {
        const key = event.key;
        event.preventDefault();

        if (key === 'Backspace') {
            text.pop();
            renderText();
            return;
        }

        if (/^[a-zA-Zа-яА-ЯёЁ0-9.,:;!?«»"'\(\)\-\s]$/.test(key)) {
            const currentIndex = text.length;
            const correctChar = checkAreaText[currentIndex];

            if (key === correctChar) {
                text.push({ char: key, correct: true });
            } else {
                if (key === ' ') {
                    text.push({ char: '_', correct: false });
                }
                else {
                    text.push({ char: key, correct: false });
                }
            }

            renderText();
        }

});

function renderText() {
    inputArea.innerHTML = text.map(item =>
        item.correct
            ? item.char
            : `<span style="color: red;">${item.char}</span>`
    ).join('');

    const hasErrors = text.some((item) => !item.correct);

    if (hasErrors) {
        inputArea.classList.add('invalid-shadow');
        inputArea.classList.remove('valid-shadow');
    } else if (text.length > 0) {
        inputArea.classList.add('valid-shadow');
        inputArea.classList.remove('invalid-shadow');
    } else {
        inputArea.classList.remove('valid-shadow', 'invalid-shadow');
    }

    placeCaretAtEnd(inputArea);
}

function placeCaretAtEnd(el) {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

function startGameTimer(duration) {
    const startTime = Date.now()
    const gameTimer = document.getElementById('timer')
    gameTimer.classList.remove('hidden-field')


    let countMinutes = 0
    let countSeconds = 0

    function updateTimerDisplay() {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        const remaining = duration - elapsed
        if (remaining >= 0) {
            const minutes = Math.floor(remaining / 60)
            const seconds = remaining % 60
            gameTimer.textContent = `${minutes < 10 ? "0" + minutes : minutes} : ${seconds < 10 ? "0" + seconds : seconds}`
        }

        if (remaining < 0) {
            checkTextArea.setAttribute('contenteditable', 'true')
            placeCaretAtEnd(checkTextArea)
            inputArea.classList.add('valid-shadow');
            if (countSeconds + 1 === 60) {
                countSeconds = 0
                countMinutes += 1
            }
            else {
                countSeconds += 1
            }
            gameTimer.textContent = `${countMinutes < 10 ? "0" + countMinutes : countMinutes} : ${countSeconds < 10 ? "0" + countSeconds : countSeconds}`
        }
        const userText = document.getElementById('checkTextArea').innerText.trim();
        const textLength = userText.length;
        const getTextButton = document.getElementById('getText');
        const corrTextArea = document.getElementById('corrTextArea');
        if (textLength == checkAreaText.length) {
            if (userText == checkAreaText) {
                clearInterval(interval)
                checkTextArea.setAttribute('contenteditable', 'false')
                getTextButton.classList.remove('hidden-field')
                timer.classList.add('hidden-field')
                corrTextArea.innerText = `Вы прошли уровень за ${countMinutes < 10 ? "0" + countMinutes : countMinutes}:${countSeconds < 10 ? "0" + countSeconds : countSeconds}!`
                checkAreaText = ''
                saveResult((countMinutes * 60 + countSeconds))
            }
        }
    }

    updateTimerDisplay()
    const interval = setInterval(updateTimerDisplay, 1000)
}

const getUserToken = () => {
    const locValue = localStorage.getItem('userToken')
    const sesValue = sessionStorage.getItem('userToken')

    if (sesValue) {
        return sesValue
    }
    return locValue
}