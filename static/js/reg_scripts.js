document.addEventListener('DOMContentLoaded', () => {
    const regUserBtn = document.getElementById('regUser');
    const regForm = document.getElementById('regForm');
    const passwordError = document.getElementById('password-error');

    if (passwordError) {
        passwordError.classList.add('hidden-field');
    }

    regUserBtn.addEventListener('click', async (event) => {
        event.preventDefault();

        const login = regForm.elements.login.value;
        const password = regForm.elements.password.value;
        const checkPassword = regForm.elements.check_password.value;
        const rememberMe = regForm.elements.rememberMe.checked;

        if (password !== checkPassword) {
            regForm.elements.password.value = '';
            regForm.elements.check_password.value = '';
            passwordError.classList.remove('hidden-field');
            return;
        }

        passwordError.classList.add('hidden-field');

        try {
            const response = await fetch('/users/regUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ login, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка регистрации');
            }

            const result = await response.json();

            if (rememberMe) {
                localStorage.setItem('userToken', result.user_token);
            } else {
                sessionStorage.setItem('userToken', result.user_token);
            }

            window.location.replace('/');
        } catch (error) {
            console.log(error);
            alert('Ошибка регистрации. Попробуйте позже.');
        }
    });
});
