document.addEventListener('DOMContentLoaded', () => {
    const postNewTextBtn = document.getElementById('postNewText')
    const postError = document.getElementById('postError')
    const newTextDiv = document.getElementById('newText');

    // Проверка правил при каждом вводе текста
    newTextDiv.addEventListener('input', () => {
        const text = newTextDiv.innerText.trim();
        checkRules(text);
    });

    postNewTextBtn.addEventListener('click', async (event) => {
        event.preventDefault();

        const userToken = getUserToken()
        const newText = document.getElementById('newText').innerHTML

        console.log(newText)
        console.log(userToken)

        if (checkRules(newText)) {
            try {
                const response = await fetch('/users/postNewText', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: newText,
                        user_token: userToken
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`HTTP error! ${errorData.detail || 'Unknown error'}`);
                }

                document.getElementById('newText').innerHTML = ''
            }
            catch (error) {
                console.log(error)
                postError.innerHTML = error.message
                postError.classList.remove('hidden-field')
            }
        }
    })
});

const checkRules = (text) => {
    const onlyRusSymbols = document.getElementById('onlyRusSymbols');
    const sentsLength = document.getElementById('sentsLength');
    const sentsSymbols = document.getElementById('sentsSymbols');

    let hasError = false;

    // ✅ Только русские буквы, цифры, пробелы и допустимые знаки препинания
    const allowedPattern = /^[а-яА-ЯёЁ0-9\s.,:;!?«»'"()\-\u2013\u2014]+$/;

    if (!allowedPattern.test(text)) {
        onlyRusSymbols.classList.add('error');
        sentsSymbols.classList.add('error');
        hasError = true;
    } else {
        onlyRusSymbols.classList.remove('error');
        sentsSymbols.classList.remove('error');
    }

    // ✅ Минимальная длина — 15 символов
    if (text.length < 15) {
        sentsLength.classList.add('error');
        hasError = true;
    } else {
        sentsLength.classList.remove('error');
    }

    return !hasError;
};

const getUserToken = () => {
    let locValue = null;
    let sesValue = null;

    try {
        locValue = localStorage.getItem('userToken');
        sesValue = sessionStorage.getItem('userToken');
    } catch (error) {
        console.log(error);
    }

    return sesValue || locValue;
};
