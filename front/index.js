

function getUserData() {

    const accessToken = localStorage.getItem('access')
    
    if (accessToken === null) {

        // no token is stored - user is not logged in
        displayNotLoggedIn()
    
    } else {

        fetch('http://127.0.0.1:8000/me/', 
        {headers: {
            'authorization': 'Bearer ' + localStorage.getItem('access')
        }})
        .then((response) => {
            if (response.status === 401) {
                
                // access token has expired
                const refreshToken = localStorage.getItem('refresh')
                if (refreshToken) {
                    fetch('http://127.0.0.1:8000/api/token/refresh/', 
                        {method: 'POST', 
                        headers: {
                            'Content-Type': 'application/json'
                            // 'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: JSON.stringify({refresh: refreshToken})
                    })
                    .then((response) => response.json())
                    .then((json) => {
                        localStorage.setItem('access', json.access)
                        getUserData()
                    })
                }
            } else {
                // don't forget to return!
                return response.json()
            }
        })
        .then((json) =>
            {
                console.log(json)
                document.getElementById('user-data').innerText = `Hello ${json.first_name} ${json.last_name}!`
                document.getElementById('not-logged-in-div').hidden = true
            })
        .catch((error) =>
            {
                console.error(error)
            })
    }
}


function obtainTokens(event) {

    event.preventDefault()

    formData = new FormData(event.target)
    
    fetch('http://127.0.0.1:8000/api/token/', {method: 'POST', body: formData})
    .then((response) => {
        console.log(response)
        if (response.status === 401) {
            throw "Invalid credentials"
        } else {
            return response.json()
        }
    })
    .then((json) => {
        console.log(json)
        localStorage.setItem('access', json.access)
        localStorage.setItem('refresh', json.refresh)
        window.open('app.html')
    })
    .catch((error) => {
        displayError(error)
    })
}

function logout() {
    localStorage.removeItem("access")
    localStorage.removeItem("refresh")
    getUserData()
}


function getVersion() {
    fetch('http://127.0.0.1:8000/version/')
    .then((response) => response.json())
    .then((json) => {
        console.log(json)
        document.getElementById('version').innerText = `Version: ${json.version}`
    })
    .catch((error) => console.error(error))
}

function displayNotLoggedIn() {

    document.getElementById('user-data').innerText = 'Hello Guest!'
    document.getElementById('not-logged-in-div').hidden = false

}

function displayError(error) {
    console.error('Could not obtain tokens:', error)
    errorMsgItem = document.getElementsByClassName('text-danger')[0]
    errorMsgItem.innerText = 'Could not login. ' + error
}