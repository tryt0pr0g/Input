const checkAuthUser = () => {
    if (sessionStorage.getItem('userToken') || localStorage.getItem('userToken')) {
        return true
    }
    return false
}

window.onload = async () => {
    const authBtn = document.getElementById('authBtn');
    const regBtn = document.getElementById('regBtn');
    const addTextLink = document.getElementById('add-text-link');
    const logOutBtn = document.getElementById('logOutBtn');
    const adminPanelLink = document.getElementById('adminLink'); // Also get adminLink here

    if (checkAuthUser()) {
        // Only attempt to modify if the element exists
        if (authBtn) authBtn.classList.add('hidden-field');
        if (regBtn) regBtn.classList.add('hidden-field');
        if (addTextLink) addTextLink.classList.remove('hidden-field');
        if (logOutBtn) logOutBtn.classList.remove('hidden-field');


        if (logOutBtn) { // Ensure logOutBtn exists before adding event listener
            logOutBtn.addEventListener('click', async (event) => {
                event.preventDefault();

                sessionStorage.removeItem('userToken')
                localStorage.removeItem('userToken')

                window.location.replace('/')
            })
        }

        const token = sessionStorage.getItem('userToken') ? sessionStorage.getItem('userToken') : localStorage.getItem('userToken')

        try {
            const response = await fetch('/users/userIsBlocked', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_token: token
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! ${errorData.detail || 'Unknown error'}`);
            }

            const result = await response.json();

            if (result.is_blocked) {
                window.location.replace('https://cdn.7tv.app/emote/01HM2A10300008H3CGNH92CF5H/4x.avif')
            }
        }
        catch (error) {
                console.error('Ошибка:', error);
                // Consider a more user-friendly message or logging than an alert here
                // alert('Не удалось загрузить текст. Попробуйте ещё раз.');
        }

        try{
            if (adminPanelLink) { // Only try to fetch admin status if the link exists on the page
                const response = await fetch('/users/userIsAdmin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_token: token
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error);
                }

                const result = await response.json()

                if (result.is_admin) {
                    adminPanelLink.classList.remove('hidden-field')
                }
                else {
                    adminPanelLink.classList.add('hidden-field')
                }
            }

        }
        catch (error) {
            console.log(error)
        }
    }
    else {
        // Only attempt to modify if the element exists
        if (authBtn) authBtn.classList.remove('hidden-field');
        if (regBtn) regBtn.classList.remove('hidden-field');
        if (addTextLink) addTextLink.classList.add('hidden-field');
        if (logOutBtn) logOutBtn.classList.add('hidden-field');
        if (adminPanelLink) adminPanelLink.classList.add('hidden-field'); // Ensure admin link is hidden for non-auth users
    }
}