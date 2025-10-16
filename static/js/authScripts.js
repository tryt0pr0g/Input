document.addEventListener('DOMContentLoaded', () => {
    const authUserBtn = document.getElementById('authUser');
    const authForm = document.getElementById('authForm');
    const passwordError = document.getElementById('password-error');

    passwordError.classList.add('hidden-field'); // скрываем при загрузке

    authUserBtn.addEventListener('click', async (event) => {
        event.preventDefault();

        const login = authForm.elements.login.value;
        const password = authForm.elements.password.value;
        const rememberMe = authForm.elements.rememberMe.checked;

        try{
            const response = await fetch('/users/authUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    login,
                    password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error);
            }

            const result = await response.json()

            if (rememberMe) {
                localStorage.setItem('userToken', result.user_token)
            }
            else {
                sessionStorage.setItem('userToken', result.user_token)
            }

            window.location.replace('/')

        }
        catch (error) {
            passwordError.innerHTML = error.message
            passwordError.classList.remove('hidden-field')
        }
    });
});
