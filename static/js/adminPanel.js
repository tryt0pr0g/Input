let userLogin
let currText

document.addEventListener('DOMContentLoaded', async () => {
    if (await isAdmin() == false) {
        window.location.replace('/')
    }

    const requestBtn = document.getElementById('request-btn')
    const modBtn = document.getElementById('moderation-btn')
    const requestDiv = document.getElementById('request-div')
    const modDiv = document.getElementById('moderation-div')

    document.getElementById('delete-text-btn').addEventListener('click', async (event) => {
        event.preventDefault();

        const token = getAdminToken()
        const textDiv = document.getElementById('delete-text-div')

        const result = await rejectText(token, textDiv.textContent)

        if (result.success) {
            textDiv.textContent = ''
        }
        else {
            alert(result.error_msg)
            textDiv.textContent = ''
        }
    })

    document.getElementById('block-user-m').addEventListener('click', async (event) => {
        event.preventDefault();

        const token = getAdminToken()
        const userLoginDiv = document.getElementById('block-user')
        userLogin = userLoginDiv.textContent


        const result = await blockUser(token, userLogin)

        if (result.success) {
            userLoginDiv.textContent = ''
        }
        else {
            alert(result.error_msg)
            userLoginDiv.textContent = ''
        }
    })

    requestBtn.addEventListener('click', async (event) => {
        event.preventDefault();

        if (await isAdmin()) {
            requestBtn.classList.add('link-secondary')
            modBtn.classList.remove('link-secondary')

            requestDiv.classList.remove('hidden-field')
            modDiv.classList.add('hidden-field')

            await showNextText()
        }
    })

    modBtn.addEventListener('click', async (event) => {
        event.preventDefault();

        if (isAdmin()) {
            requestBtn.classList.remove('link-secondary')
            modBtn.classList.add('link-secondary')

            requestDiv.classList.add('hidden-field')
            modDiv.classList.remove('hidden-field')
        }
    })

    document.getElementById('accept-user-text').addEventListener('click', async (event) => {
        event.preventDefault();

        try {
            const token = getAdminToken()

            const response = await fetch('/admin/AcceptTextRequest', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    admin_token: token,
                    text: currText
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error);
            }

            const result = await response.json()

            if (result.success) {
                await showNextText()
            }

        }
        catch (error) {
            console.log(error)
        }
    })

    document.getElementById('reject-user-text').addEventListener('click', async (event) => {
        event.preventDefault();

        const token = getAdminToken()

        const result = await rejectText(token, currText)

        if (result.success) {
            await showNextText()
        }
        else {
            alert(result.error_msg)
        }
    })

    document.getElementById('block-user-r').addEventListener('click', async (event) => {
        event.preventDefault();

        const token = getAdminToken()

        const result = await blockUser(token, userLogin)

        if (result.success) {
            await rejectText(token, currText)
        }
    })
})

const isAdmin = async () => {
    try {
        const token = getAdminToken()

        const response = await fetch('/user/userIsAdmin', {
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
            return token
        }

        return false

    }
    catch (error) {
        console.log(error)
    }
}

const blockUser = async (admin_token, user_login) => {
    try {
        const response = await fetch('/admin/blockUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                admin_token: admin_token,
                user_login: userLogin
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }

        return await response.json()
    }
    catch (error) {
        console.log(error)
    }
}

const showNextText = async () => {
    const noZeroReqDiv = document.getElementById('no-zero-requests-div')
    const zeroReqDiv = document.getElementById('zero-requests-div')

    try {
        const response = await fetch('/admins/getUnacceptedText', {
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

        if (result.success) {
            console.log(result.user_login)
            console.log(result.text)

            zeroReqDiv.classList.add('hidden-field')
            noZeroReqDiv.classList.remove('hidden-field')

            userLogin = result.user_login
            currText = result.text

            document.getElementById('user-text').textContent = currText
            document.getElementById('user-login').textContent = userLogin
        }
        else {
            noZeroReqDiv.classList.add('hidden-field')
            zeroReqDiv.classList.remove('hidden-field')
        }
    }
    catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось загрузить текст. Попробуйте ещё раз.');
    }
}

const rejectText = async (admin_token, text) => {
    try {
        const response = await fetch('/admins/rejectTextRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                admin_token: admin_token,
                text: text
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }
        return await response.json()

    }
    catch (error) {
        console.log(error)
    }
}

const getAdminToken = () => {
    return sessionStorage.getItem('userToken') ? sessionStorage.getItem('userToken') : localStorage.getItem('userToken')
}