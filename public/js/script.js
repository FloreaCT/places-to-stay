document.getElementById('ajaxButton').addEventListener('click', () => {

    const accommodation = document.getElementById('accommodationSearch').value;
    const accType = document.getElementById("typeOfAccommodation").value
    ajaxSearch(accommodation, accType);
});

async function ajaxSearch(accommodation, accType) {
    try {
        if (!accommodation) {
            accommodation = 'all'
        }
        // Send a request to our remote URL
        const response = await fetch(`/accommodation/${accommodation}/${accType}`);
        // Parse the JSON.
        const results = await response.json();
        layerGroup.clearLayers();

        bounds = []

        if (Object.keys(results).length === 0) {

            showError("alertMap", "No accommodation found!")

        } else {

            function clickZoom(e) {

                latlng = e.target.getLatLng()
                map.setView([latlng.lat + 0.10, latlng.lng], 11);
                checkAvailability()
            }

            for (i in results) {
                const images = await fetch(`/images/${results[i].id}`)
                const imagePath = await images.json()
                var imagesForCarousel = ""
                var buttonsForCarousel = ""
                var active = 'active'
                counter = 0

                if (imagePath.length === 0) {
                    console.log('Setting no photo');
                    imagesForCarousel += `<div class="carousel-item active"><img src="/images/nophoto.jpg" class="d-block w-100 carouselImg" alt="/images/nophoto.jpg"> </div>`
                    buttonsForCarousel += `<button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${counter}" class="active" aria-current="true" aria-label="Slide ${s+1}"></button>`
                } else {

                    for (j in imagePath) {
                        if (active === 'active') {
                            imagesForCarousel += `<div class="carousel-item ${active}"><img src="${imagePath[j].imagePath}" class="d-block w-100 carouselImg" alt="${imagePath[j].imagePath}"> </div>`
                            active = ""
                        } else if (imagePath[j].approved === 0) {
                            continue
                        } else {
                            imagesForCarousel += `<div class="carousel-item"><img src="${imagePath[j].imagePath}" class="d-block w-100 carouselImg" alt="${imagePath[j].imagePath}"> </div>`
                        }
                    }

                    for (s in imagePath) {
                        if (imagePath[s].approved === 0) {
                            continue
                        } else {
                            buttonsForCarousel += `<button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${counter}" class="active" aria-current="true" aria-label="Slide ${s+1}"></button>`
                            counter += 1;
                        }
                    }
                }
                if (results[i].type === accType || accType === "Any") {
                    // results[i].type
                    var mark = L.marker([results[i].latitude, results[i].longitude]).addTo(layerGroup)
                        .bindPopup('<div class="centerSmall"><b><h3>' + results[i].name + '</h3></b>' + '<br><h4>' + results[i].description + '</h4></div>' +
                            '<input type="hidden" id="accomID" name="accomID" value="' + results[i].id + '"> <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel"><div class="carousel-indicators">' + buttonsForCarousel + '</div><div class="carousel-inner" >' + imagesForCarousel + '</div><button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span></button> <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span>  <span class="visually-hidden">Next</span></button> </div> <br><div class="centerSmall"><input class="btn btn-primary" type="text" value="Book" id="send_booking" onclick=openBookModal(' + results[i].id + ')></div> ')
                        .on('click', clickZoom)
                    bounds.push([results[i].latitude, results[i].longitude])
                } else {

                }
            }

            map.fitBounds(bounds);
        }


    } catch (e) {
        alert('This is ridiculous, we never got this error! Please contact the administrator!')
        console.log(`There was an error: ${e}`);
    }
}

async function bookAccommodation() {

    const unauthorized = await fetch('/unauthorized');
    // Check if user is authenticated
    if (unauthorized.status === 401) {
        showError('loginError', 'Sorry, you need to be logged in order to book.')
        openLoginModal()

        $('#loginModal').on('hidden.bs.modal', function() {
            loginError.style.display = 'none'
        })
    } else {

        const accomID = document.getElementById("accomID").value
        const begin_at = document.getElementById("datepicker").value
            // Check if the system automatically updated the accommodation ID
        if (accomID.length === 0) {

            showError("bookError", 'Invalid accommodation ID, please contact the administrator at admin@places-totstay.herokuapp.com')
                // Check if the user selected a Date
        } else if (!begin_at) {

            showError("bookError", "Please select a date!")

        } else {
            // Check if the user selected number of people
            validate()
            openCreditCard()
            $("#creditCard").on('hidden.bs.modal', function() {
                $('.modal-backdrop').css('z-index', '1059');
            });
        }

    }
}

function validate() {
    if (!parseInt(document.getElementById('npeople').value)) {
        showError("bookError", "Please select the number of persons")
        throw "exit"
    } else if (parseInt(document.getElementById('npeople').value) <= 0) {
        showError("bookError", `Cannot book for ${document.getElementById('npeople').value} people. Please adjust the number of people`);
        throw "exit"
    } else if (parseInt(document.getElementById('npeople').value) > parseInt(document.getElementById('forMaxPeople').value)) {
        showError("bookError", 'Please adjust the number of persons.');
        throw "exit"
    }

}

function loginFunction() {


    let loginObj = {
        loginUser: document.getElementById("loginUser").value,
        loginPassword: document.getElementById("loginPassword").value,
    }


    $.ajax({
        type: "POST",
        url: "/login",
        data: JSON.stringify(loginObj),
        contentType: "application/json; charset=utf-8",
        async: true,
        success: function(msg) {
            if (msg === false) {
                var element = document.getElementById('loginError')
                element.style.display = "block"
                element.innerHTML = 'User or password incorrect!'
                shakeModal()
                $('#loginError').delay(1000).fadeOut(1000)
                    .promise().done(function() {
                        element.innerHTML = '<a href="#" class="close" id="loginError">×</a>'
                    });
            } else {

                let username = sessionStorage.setItem('username', msg.username)
                sessionStorage.setItem('access', msg.admin)
                sessionStorage.setItem('accID', msg.id)
                if (sessionStorage.getItem('access') === '1' || sessionStorage.getItem('access') === '0') {
                    $('.uploadButton').css('display', 'block')
                } else {
                    $('.uploadButton').css('display', 'none')
                }
                document.getElementById('loggedInAs').innerHTML += username
                var navLogged = document.getElementById('navLogged')
                showError('loginSuccess', 'Login Succesful')
                setTimeout(function() {
                    $('#loginModal').modal('hide');
                }, 1000);

                $("#navNotLogged").fadeOut(2000).promise().done(function() {
                    document.getElementById('loggedInAs').innerHTML = 'You are logged in as ' + sessionStorage.getItem('username')
                    navLogged.style.display = 'block';
                })

            }

        },
        error: function() {
            console.log('Error!!');
        }
    })
}

function logout() {

    sessionStorage.clear()

    var navNotLogged = document.getElementById('navNotLogged')
    $("#navLogged").fadeOut(2000).promise().done(function() {
        navNotLogged.style.display = 'block'
    })

    $('.uploadButton').css('display', 'none')

    const url = "/logout"

    let xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.send();


}

function accDetails(id) {
    $.ajax({
        type: "POST",
        url: "/accDetails/" + id,
        dataType: "JSON",
        success: function(response) {

        }
    })

}

function register() {

    const registerUser = document.getElementById("registerUsername").value

    if (registerUser.length <= 3) {
        shakeModal()
        showError('registerError', 'Username must be at least 4 characters')
        return false
    }

    const registerPassword = document.getElementById("registerPassword").value

    if (registerPassword.length <= 3) {
        shakeModal()
        showError('registerError', 'Password must be at least 4 characters')
        return false
    }
    const passwordConfirmation = document.getElementById("passwordConfirmation").value

    if (!registerUser || !registerPassword || !passwordConfirmation) {
        shakeModal()
        showError('registerError', 'Please enter all details')
        return false
    } else if (registerPassword != passwordConfirmation) {
        shakeModal()
        showError('registerError', 'Password does not match')
        return false
    }

    let registerObj = {
        registerUser: document.getElementById("registerUsername").value,
        registerPassword: document.getElementById("registerPassword").value,
        passwordConfirmation: document.getElementById("passwordConfirmation").value,
    }


    $.ajax({
        type: "POST",
        url: "/register",
        data: JSON.stringify(registerObj),
        contentType: "application/json; charset=utf-8",
        async: true,
        success: function(msg) {
            if (msg) {
                var element = document.getElementById('registerSuccess')
                element.style.display = "block"
                element.innerHTML = 'User created!'
                $('#registerSuccess').delay(500).fadeOut(1000).promise().done(function() {
                        showLoginForm()
                        $('#registerForm')
                            .find("input,textarea,select")
                            .val('')
                            .end()
                    })
                    // showError('registerError', 'User created!')
            } else {
                shakeModal()
                showError('registerError', 'User already in the database.')
            }
        }
    })

}

async function loadTypes() {
    try {
        // Send a request to our remote URL
        const response = await fetch('/accommodation/');

        // Parse the JSON.
        const results = await response.json();

        types = new Set();

        for (i in results) {
            types.add(results[i].type)
        }

        var select = document.getElementById("typeOfAccommodation");

        types.forEach(type => {
            var option = document.createElement("option");
            option.value = type;
            option.text = type;
            select.appendChild(option)
        })
    } catch (e) {
        alert(`There was an error: ${e}`);
    }
}

function checkAvailability() {

    const accomID = document.getElementById("accomID").value
    const enabled_days = []
    $.ajax({
        type: "POST",
        url: "/availability/" + accomID,
        dataType: "JSON",
        success: function(response) {

            for (i in response) {
                if (response[i].availability <= 0) {

                } else {
                    const time = response[i].thedate.toString()
                    const year = "20" + time.slice(0, 2)
                    const month = time.slice(2, 4)
                    const day = time.slice(4, 6)
                    const newDate = year + "-" + month + "-" + day
                    enabled_days.push(newDate)
                }
            }

            $('#datepicker').datepicker({
                dateFormat: 'dd/mm/yy',
                inline: true,
                beforeShowDay: function(d) {
                    var year = d.getFullYear(),
                        month = ("0" + (d.getMonth() + 1)).slice(-2),
                        day = ("0" + (d.getDate())).slice(-2);

                    var formatted = year + '-' + month + '-' + day;

                    if ($.inArray(formatted, enabled_days) != -1) {
                        return [true, "", "Available"];
                    } else {
                        return [false, "", "unAvailable"];
                    }
                }

            });
        },
        error: function(xhr, status, error) {
            alert("We dont usually get this error: ", error);
        }

    })

}

function availableSpace() {

    const accomID = document.getElementById('accomID').value
    const date = document.getElementById('datepicker').value.toString()
    const year = date.slice(8, 10)
    const month = date.slice(3, 5)
    const day = date.slice(0, 2)
    const newDate = year + month + day

    $.ajax({
        type: "POST",
        url: "/availability/" + accomID + "/" + newDate,
        dataType: "JSON",
        success: function(response) {

            document.getElementById('npeople').setAttribute('max', response.availability)
            document.getElementById('npeople').setAttribute('type', "number")
            document.getElementById('forMaxPeople').setAttribute('value', response.availability)
            document.getElementById('maxPeople').removeAttribute('class', 'hidden')
            document.getElementById('maxPeople').innerHTML = `Available spaces:  ${response.availability}`

        }
    })
}

function cardChecker(response) {

    Stripe.setPublishableKey('pk_test_9D43kM3d2vEHZYzPzwAblYXl');

    var cardNumber, cardMonth, cardYear, cardCVC, cardHolder;

    // check for any empty inputs
    function findEmpty() {
        var emptyText = $('#form-container input').filter(function() {

            return $(this).val == null;
        });

        // add invalid class to empty inputs
        emptyText.prevObject.addClass('invalid');
    }

    // check for card type and display corresponding icon
    function checkCardType() {
        cardNumber = $('#card-number').val();
        var cardType = Stripe.card.cardType(cardNumber);
        switch (cardType) {
            case 'Visa':
                $('#card-image').html('<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDEyOCAxMjgiIGlkPSLQodC70L7QuV8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48Zz48cGF0aCBkPSJNMTE3Ljg4NiwxMDMuMDU1SDEwLjExNEM1LjYzMywxMDMuMDU1LDIsOTkuNDIyLDIsOTQuOTQxVjMzLjA1OWMwLTQuNDgxLDMuNjMzLTguMTE0LDguMTE0LTguMTE0aDEwNy43NzEgICBjNC40ODEsMCw4LjExNCwzLjYzMyw4LjExNCw4LjExNHY2MS44ODFDMTI2LDk5LjQyMiwxMjIuMzY3LDEwMy4wNTUsMTE3Ljg4NiwxMDMuMDU1eiIgZmlsbD0iI0YwRUZFRiIvPjxnPjxnPjxwb2x5Z29uIGZpbGw9IiMzNTUxNjkiIHBvaW50cz0iNDkuMjMsNzguODg4IDU0LjI5LDQ5LjE4NiA2Mi4zODksNDkuMTg2IDU3LjMyLDc4Ljg4OCA0OS4yMyw3OC44ODggICAgIi8+PHBhdGggZD0iTTg2LjY4Nyw0OS45MThjLTEuNjA0LTAuNjAzLTQuMTE4LTEuMjQ4LTcuMjU3LTEuMjQ4Yy04LDAtMTMuNjM1LDQuMDI4LTEzLjY4NCw5LjgwMiAgICAgYy0wLjA0NSw0LjI2Nyw0LjAyMiw2LjY1LDcuMDkzLDguMDdjMy4xNTMsMS40NTYsNC4yMTMsMi4zODUsNC4xOTksMy42ODVjLTAuMDIzLDEuOTkxLTIuNTE4LDIuODk5LTQuODQ3LDIuODk5ICAgICBjLTMuMjM5LDAtNC45Ni0wLjQ0OS03LjYxOS0xLjU1OGwtMS4wNDItMC40NzFsLTEuMTM3LDYuNjVjMS44ODksMC44MjksNS4zODYsMS41NDcsOS4wMTksMS41ODMgICAgIGM4LjUxMSwwLDE0LjAzMy0zLjk4MiwxNC4wOTctMTAuMTQ5YzAuMDMyLTMuMzc3LTIuMTI0LTUuOTQ4LTYuNzk1LTguMDY5Yy0yLjgzMS0xLjM3NS00LjU2Ni0yLjI5MS00LjU0OC0zLjY4MyAgICAgYzAtMS4yMzQsMS40NjgtMi41NTUsNC42MzktMi41NTVjMi42NDUtMC4wNDIsNC41NjYsMC41MzYsNi4wNTYsMS4xMzhsMC43MjksMC4zNDNMODYuNjg3LDQ5LjkxOEw4Ni42ODcsNDkuOTE4eiIgZmlsbD0iIzM1NTE2OSIvPjxwYXRoIGQ9Ik0xMDcuNDQ3LDQ5LjIxNWgtNi4yNTZjLTEuOTM5LDAtMy4zODgsMC41MjktNC4yNCwyLjQ2M0w4NC45Myw3OC45aDguNTAzYzAsMCwxLjM4Ni0zLjY2LDEuNzAzLTQuNDY0ICAgICBjMC45MjksMCw5LjE4NywwLjAxNCwxMC4zNjksMC4wMTRjMC4yNCwxLjAzOSwwLjk4Myw0LjQ1LDAuOTgzLDQuNDVoNy41MTVMMTA3LjQ0Nyw0OS4yMTVMMTA3LjQ0Nyw0OS4yMTV6IE05Ny40NjMsNjguMzYxICAgICBjMC42Ny0xLjcxMiwzLjIyNS04LjMwNCwzLjIyNS04LjMwNGMtMC4wNDUsMC4wNzksMC42NjYtMS43MiwxLjA3NC0yLjgzNmwwLjU0OCwyLjU2MmMwLDAsMS41NDksNy4wOSwxLjg3NSw4LjU3OEg5Ny40NjMgICAgIEw5Ny40NjMsNjguMzYxeiIgZmlsbD0iIzM1NTE2OSIvPjxwYXRoIGQ9Ik00Mi40NCw0OS4yMDhsLTcuOTI3LDIwLjI1NmwtMC44NDctNC4xMTVjLTEuNDcyLTQuNzQ3LTYuMDctOS44ODktMTEuMjExLTEyLjQ2Mmw3LjI0OCwyNS45NzggICAgIGw4LjU2Ni0wLjAxMWwxMi43NDctMjkuNjQ2SDQyLjQ0TDQyLjQ0LDQ5LjIwOHoiIGZpbGw9IiMzNTUxNjkiLz48cGF0aCBkPSJNMjcuMTYxLDQ5LjE5SDE0LjEwMmwtMC4xLDAuNjE3YzEwLjE1NiwyLjQ2LDE2Ljg3OCw4LjQwMiwxOS42NjQsMTUuNTQyTDMwLjgzLDUxLjY5NyAgICAgQzMwLjM0MSw0OS44MTYsMjguOTE4LDQ5LjI1NSwyNy4xNjEsNDkuMTlMMjcuMTYxLDQ5LjE5eiIgZmlsbD0iI0Y2Q0E0MSIvPjwvZz48L2c+PHBhdGggZD0iTTIsMzMuMDU5djYuODg2aDEyNHYtNi44ODZjMC00LjQ4MS0zLjYzMy04LjExNC04LjExNC04LjExNEgxMC4xMTRDNS42MzMsMjQuOTQ1LDIsMjguNTc4LDIsMzMuMDU5eiIgZmlsbD0iIzM1NTA2NyIvPjxwYXRoIGQ9Ik0yLDg3Ljk2M3Y2Ljk3N2MwLDQuMDg3LDMuMDI1LDcuNDU5LDYuOTU3LDguMDIzaDExMC4wODZjMy45MzItMC41NjMsNi45NTctMy45MzUsNi45NTctOC4wMjN2LTYuOTc3SDJ6IiBmaWxsPSIjRjZDQTQxIi8+PC9nPjwvc3ZnPg==" height="100%">');
                break;
            case 'Master Card':
                $('#card-image').html('<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDEyOCAxMjgiIGlkPSLQodC70L7QuV8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48Zz48cGF0aCBkPSJNMTE3Ljg4NiwxMDMuMDU1SDEwLjExNEM1LjYzMywxMDMuMDU1LDIsOTkuNDIyLDIsOTQuOTQxVjMzLjA1OWMwLTQuNDgxLDMuNjMzLTguMTE0LDguMTE0LTguMTE0aDEwNy43NzEgICBjNC40ODEsMCw4LjExNCwzLjYzMyw4LjExNCw4LjExNHY2MS44ODFDMTI2LDk5LjQyMiwxMjIuMzY3LDEwMy4wNTUsMTE3Ljg4NiwxMDMuMDU1eiIgZmlsbD0iIzQ2QjE5QiIvPjxnPjxwYXRoIGQ9Ik01NC43MjcsNjQuMDg1YzAtMTUuMzk0LDEyLjQ3OS0yNy44NzIsMjcuODczLTI3Ljg3MmMxNS4zOTUsMCwyNy44NywxMi40NzcsMjcuODcsMjcuODcyICAgIGMwLDE1LjM5Mi0xMi40NzUsMjcuODcyLTI3Ljg3LDI3Ljg3MkM2Ny4yMDYsOTEuOTU3LDU0LjcyNyw3OS40NzcsNTQuNzI3LDY0LjA4NUw1NC43MjcsNjQuMDg1eiIgZmlsbD0iI0Y2Q0E0MSIvPjxwYXRoIGQ9Ik02My45Myw0My4zMzhjMC4wMTQsMC0xLjQ1OSwxLjI3NC0yLjQ0NCwyLjUyMmg0Ljk1OWMwLDAsMS42OTUsMS44MzMsMi4zMjIsMy4yMTZoLTkuNjkyICAgIGMwLDAtMC45MzksMS40NzYtMS41NjQsMi43MjRoMTIuODJjMCwwLDEuMTcyLDIuMTkzLDEuNDI3LDMuMzUxSDU2LjE3MWMwLDAtMC41MzUsMS41MTktMC43NTksMi42MzZsMTcuMDYzLTAuMDIyICAgIGMwLjQ2OSwyLjE0MywxLjYwNyw4LjM3My0wLjczOCwxNS4yNTVsLTE1LjUsMC4wMjFjMC4yNDcsMC44MjQsMC42NywxLjk0MywxLjA3MiwyLjc2N2gxMy4zMTIgICAgYy0wLjUzOCwxLjExOS0xLjMyLDIuNTI0LTEuNzY3LDMuMjMzbC05Ljc1OSwwLjAwN2MwLjUxNSwwLjc4MSwxLjM0LDIuMDEsMS44NzYsMi41N2w2LjAwOS0wLjAwMyAgICBjLTEuMTI4LDEuNTU3LTMuMDM4LDMuMTctMy4wMzgsMy4xN2gtMC4wNDdsMC4wNjIsMC4wMjFjLTQuOTM3LDQuNDQ2LTExLjQ3NCw3LjE1MS0xOC42NDEsNy4xNTEgICAgYy0xNS4zOTQsMC0yNy44NzItMTIuNDgtMjcuODcyLTI3Ljg3MmMwLTE1LjM5NCwxMi40NzctMjcuODcyLDI3Ljg3Mi0yNy44NzJDNTIuNDcxLDM2LjIxMyw1OC45OTUsMzguOTA3LDYzLjkzLDQzLjMzOCAgICBMNjMuOTMsNDMuMzM4eiIgZmlsbD0iI0M1NUM0NCIvPjxnPjxwYXRoIGQ9Ik01MC43Miw1OS43MjdsLTAuNDUsMi41MDdsLTIuNDQ1LTAuMDYyYzAsMC0xLjIyMSwwLjMxOS0xLjIyMSwwLjgzNGMwLDAuNTE0LDAuOSwxLjE1OSwyLjI1MSwxLjczNiAgICAgYzEuMzUyLDAuNTgxLDEuNDE2LDIuMTg2LDEuMjg2LDMuMjgxYy0wLjEyOCwxLjA5My0wLjMyMSwzLjM2Mi00LjI0NCwzLjQ3NGMtMi4yNTIsMC4wNjQtMy40NzQtMC4zODYtMy40NzQtMC4zODZsMC41MTUtMi41NzIgICAgIGMwLDAsMi44OTUsMC43NzIsMy41MzgsMC4zMjFjMC42NDMtMC40NSwxLjQxNS0xLjIyMiwwLjE5Mi0xLjczNmMtMS4yMjEtMC41MTQtMy4yMTYtMS4zNTMtMy4yMTYtMy40MDggICAgIGMwLTIuMDU4LDAuODM2LTMuMjE2LDIuMTIzLTMuNzk2QzQ2Ljg1OSw1OS4zNDEsNDkuMTExLDU5LjQwMyw1MC43Miw1OS43MjdMNTAuNzIsNTkuNzI3eiIgZmlsbD0iI0ZGRkZGRiIvPjxwb2x5Z29uIGZpbGw9IiNGRkZGRkYiIHBvaW50cz0iMzEuMzk2LDcxLjIgMjguNTUzLDcxLjIgMzAuMjA2LDYxLjQyNyAyNi42OTIsNzEuMTQxIDI0LjczMSw3MS4xNDEgMjQuMjU3LDYxLjAzOCAyMi41MzgsNzEuMiAgICAgIDE5Ljg0OSw3MS4yIDIyLjM4Myw1Ni4yODUgMjUuNjQ1LDU2LjI4NSAyNi43ODcsNjQuODczIDMwLjU4LDU2LjI4NSAzMy45Myw1Ni4yODUgMzEuMzk2LDcxLjIgICAgIi8+PHBhdGggZD0iTTUzLjI1OSw3MS40MDhjLTAuOTI1LDAtMS41ODYtMC4yMDgtMS45ODItMC41OThjLTAuMzk5LTAuNDE3LTAuNTk3LTEuMDQ2LTAuNTk3LTEuODUyICAgICBjMC0wLjIxLDAuMDIyLTAuNDE3LDAuMDQ1LTAuNmMwLjAyMi0wLjIwNywwLjA2NS0wLjQ0NSwwLjA4OC0wLjcxNmwxLjcwOS05LjU0NWgyLjY2NmwtMC4zODgsMS44NjRoMi40OWwtMC40MTgsMi4zNTloLTIuNDg5ICAgICBMNTMuNyw2Ni4zOWMtMC4wNDQsMC4yNjYtMC4wODgsMC41MzUtMC4xMzMsMC44MzNjLTAuMDQzLDAuMjcxLTAuMDY1LDAuNTQxLTAuMDY1LDAuNzE5YzAsMC40MTcsMC4wNjUsMC42ODgsMC4yNDEsMC44MzggICAgIGMwLjE1NSwwLjE0OCwwLjQyLDAuMjQsMC43NzEsMC4yNGMwLjEzMywwLDAuMzA5LTAuMDMzLDAuNTI4LTAuMDkxYzAuMjIyLTAuMDg4LDAuNDIxLTAuMTQ4LDAuNTUyLTAuMjRoMC4yMjFsLTAuNDE5LDIuMzkzICAgICBjLTAuMzA5LDAuMTE5LTAuNjE2LDAuMTc5LTAuOTQ2LDAuMjM2QzU0LjExOCw3MS4zNzcsNTMuNzIyLDcxLjQwOCw1My4yNTksNzEuNDA4TDUzLjI1OSw3MS40MDh6IiBmaWxsPSIjRkZGRkZGIi8+PHBhdGggZD0iTTcyLjM4OCw2My4xMDRjLTAuNTgzLTAuNDUtMS44NzktMC4zNTktMi4xNDgsMC41NjRMNjguOTYxLDcxLjJoLTIuNjY0bDEuOTE3LTExLjIzOGgyLjY2NGwtMC4wNTUsMC45MDcgICAgIGMwLjUwOS0wLjUwOSwxLjA3MS0wLjkzOSwyLjQ5OC0wLjg5NUM3My40MTIsNTkuOTc3LDcyLjQ1Nyw2MS42NDUsNzIuMzg4LDYzLjEwNEw3Mi4zODgsNjMuMTA0eiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik03Ny40MjQsNzEuNWMtMS40NzgsMC0yLjY0Ni0wLjUwNy0zLjQzNi0xLjQ5NmMtMC44MTctMC45ODQtMS4yMTQtMi40MTktMS4yMTQtNC4yNzQgICAgIGMwLTEuNDY1LDAuMTc4LTIuNzgxLDAuNTI5LTMuOTc1YzAuMzUyLTEuMTk3LDAuODYtMi4yMSwxLjQ3NC0zLjA3OGMwLjYxOS0wLjgzNSwxLjM0OC0xLjQ5NCwyLjIwOC0xLjk3MSAgICAgYzAuODMxLTAuNDgsMS43MzgtMC43MTksMi42ODQtMC43MTljMC43NDgsMCwxLjQ1NywwLjEyLDIuMTE3LDAuMzNjMC4zMTksMC4xMDksMC45MzQsMC40MDEsMC45MzQsMC40MDFsLTAuNjE5LDMuNTQ0ICAgICBjLTAuMzA5LTAuMzkyLTAuNjE3LTAuNzAzLTAuOTMzLTAuOTI2Yy0wLjQ2NC0wLjI5OC0xLjAxNS0wLjQ4LTEuNjMzLTAuNDhjLTEuMTAyLDAtMi4wMDUsMC42LTIuNzEsMS43OTUgICAgIGMtMC43MjYsMS4xOTYtMS4wODEsMi43MjItMS4wODEsNC41NzRjMCwxLjE5NSwwLjIsMi4wNjQsMC41OTcsMi42YzAuMzk2LDAuNTA3LDAuOTY5LDAuNzc3LDEuNzIxLDAuNzc3ICAgICBjMC42ODEsMCwxLjMxOS0wLjE4MywxLjkxNy0wLjUzOGMwLjI4MS0wLjE4NiwwLjU1Ny0wLjM4MSwwLjgyOC0wLjYwM2wtMC42MjEsMy4zODJjMCwwLTAuMzIxLDAuMTU3LTAuNDc0LDAuMjEgICAgIGMtMC4zNzIsMC4xNDgtMC43MDIsMC4yMzgtMC45ODksMC4zMjZDNzguNDE1LDcxLjQzNiw3Ny45NzYsNzEuNSw3Ny40MjQsNzEuNUw3Ny40MjQsNzEuNXoiIGZpbGw9IiNGRkZGRkYiLz48cGF0aCBkPSJNMzcuOTU3LDcwLjgxYy0wLjEwOSwwLjA5MS0wLjIyMSwwLjE1LTAuMzA5LDAuMjFjLTAuMjg2LDAuMTUtMC41MjgsMC4yNjktMC43NzEsMC4zNTcgICAgIGMtMC4yNDIsMC4wNTktMC41NzMsMC4xMjMtMS4wMTQsMC4xMjNjLTAuNjg0LDAtMS4yNTYtMC4yNzEtMS42NzQtMC43NzhjLTAuNDQxLTAuNTQxLTAuNjYyLTEuMjI3LTAuNjYyLTIuMDYyICAgICBjMC0wLjg5NiwwLjE1My0xLjY0NSwwLjQ2NC0yLjI3MWMwLjMwOS0wLjYwMiwwLjc2OS0xLjExLDEuMzg4LTEuNDY3YzAuNTczLTAuMzU3LDEuMjU2LTAuNTk3LDIuMDI4LTAuNzQ3bDAuNTUtMC4wOTEgICAgIGMwLjYzOS0wLjExOSwxLjMwMS0wLjIwNywyLjAyOC0wLjI0YzAtMC4wNTksMC0wLjExOSwwLjAyMi0wLjIwOGMwLjAyMi0wLjA4OCwwLjAyMi0wLjE3OSwwLjAyMi0wLjI5OCAgICAgYzAtMC40NzgtMC4xNTUtMC44MDctMC40ODUtMS4wMTdjLTAuMzMxLTAuMTc4LTAuODE2LTAuMjY3LTEuNDU0LTAuMjY3aC0wLjEzM2MtMC4zOTcsMC4wMjktMC44MzcsMC4xMTktMS4zMjEsMC4yOTggICAgIGMtMC41MjksMC4yMS0wLjkyNywwLjM1OS0xLjE5MSwwLjUwOWgtMC4yNDJsMC4zOTctMi42NmMwLjMwOS0wLjExOSwwLjc5My0wLjIzOSwxLjQzMy0wLjM1OCAgICAgYzAuMzA4LTAuMDkxLDAuNjE2LTAuMTIsMC45MjUtMC4xNTFjMC4zMzItMC4wNiwwLjY4My0wLjA2LDEuMDE1LTAuMDZjMS4zMDEsMCwyLjI0NywwLjIzOSwyLjg2NCwwLjY4NyAgICAgYzAuNjE3LDAuNDUsMC45MDQsMS4xNjgsMC45MDQsMi4xNTJjMCwwLjEyMSwwLDAuMjk4LTAuMDIyLDAuNTFjLTAuMDIyLDAuMjEtMC4wNDUsMC4zOS0wLjA2NywwLjU2N0w0MS4zNTIsNzEuMmgtMi42NDYgICAgIGwwLjItMS4xOTdjLTAuMTU1LDAuMTUtMC4zNzUsMC4zMjktMC41OTYsMC41NEMzOC4xNzgsNzAuNjMxLDM4LjA2OCw3MC43MjIsMzcuOTU3LDcwLjgxTDM3Ljk1Nyw3MC44MXogTTM3Ljk1Nyw2Ni4xNSAgICAgYy0wLjI4NywwLjA2LTAuNTI4LDAuMTQ4LTAuNzI4LDAuMjRjLTAuMzA4LDAuMTQ3LTAuNTI5LDAuMzU1LTAuNjgyLDAuNjI2Yy0wLjE3NywwLjI3MS0wLjI0MywwLjYyOC0wLjI0MywxLjA3NiAgICAgYzAsMC4zOSwwLjExLDAuNjU3LDAuMzA4LDAuODA3YzAuMjIxLDAuMTQ4LDAuNTA4LDAuMjQsMC45MjYsMC4yNGMwLjEzMiwwLDAuMjY1LTAuMDI5LDAuNDE5LTAuMDkxICAgICBjMC4xMzMtMC4wMjgsMC4yNjYtMC4wODgsMC40Mi0wLjE0OGMwLjI4Ni0wLjE3OSwwLjU3MS0wLjM5LDAuODM2LTAuNjI3bDAuMzk3LTIuMzkxYy0wLjQ2MiwwLjA2LTAuOTI2LDAuMTIxLTEuMzIsMC4yMSAgICAgQzM4LjE3OCw2Ni4wOSwzOC4wNjgsNjYuMTE5LDM3Ljk1Nyw2Ni4xNUwzNy45NTcsNjYuMTV6IiBmaWxsPSIjRkZGRkZGIi8+PHBhdGggZD0iTTYxLjAwMyw2MS45MDRjLTAuMzUyLDAuMDYtMC42ODIsMC4yNC0wLjk0NiwwLjUzNmMtMC4zNzUsMC40MjEtMC42NjIsMC45NTktMC44NTksMS42NzZoMS44MDZoMS43ODYgICAgIGMwLTAuMTE5LDAuMDIyLTAuMjEsMC4wMjItMC4zMjljMC0wLjA4OCwwLjAyMi0wLjIwOCwwLjAyMi0wLjI5NmMwLTAuNTQxLTAuMTMzLTAuOTI4LTAuMzc2LTEuMjI5ICAgICBjLTAuMjQxLTAuMjY2LTAuNTcxLTAuNDE2LTEuMDM1LTAuNDE2QzYxLjI5LDYxLjg0NSw2MS4xMzYsNjEuODczLDYxLjAwMyw2MS45MDRMNjEuMDAzLDYxLjkwNHogTTYxLjAwMyw2OC45NTlINjEuNCAgICAgYzAuNTczLDAsMS4xMjQtMC4xMTksMS42NTMtMC4zOWMwLjUwNi0wLjI3MSwwLjk3LTAuNTY3LDEuMzQyLTAuODk2aDAuMzA5bC0wLjUwNiwyLjg5OGMtMC41MDYsMC4zMDMtMS4wNTgsMC41NC0xLjYyOSwwLjY5ICAgICBjLTAuNDg1LDAuMTQ4LTEuMDE1LDAuMjA5LTEuNTY2LDAuMjRoLTAuMjQxYy0xLjQzMiwwLTIuNTEzLTAuNDE5LTMuMjg0LTEuMjg2Yy0wLjc3LTAuODM4LTEuMTQ2LTIuMDAzLTEuMTQ2LTMuNDk2ICAgICBjMC0xLjAxNywwLjEzNC0xLjk3MiwwLjM3Ny0yLjgxMmMwLjI0MS0wLjg2NSwwLjYxNi0xLjYxNCwxLjA3OC0yLjI3MWMwLjQ2My0wLjYyNywxLjAxNS0xLjEwNCwxLjY5Ny0xLjQ5MyAgICAgYzAuNDg1LTAuMjM5LDAuOTkzLTAuNDE4LDEuNTIxLTAuNTA5YzAuMjQyLTAuMDI4LDAuNDg0LTAuMDI4LDAuNzI4LTAuMDI4YzEuMjM1LDAsMi4xNiwwLjMyNiwyLjc5OSwxLjAxNCAgICAgYzAuNjE2LDAuNjU5LDAuOTI3LDEuNjc0LDAuOTI3LDIuOTkxYzAsMC40NDgtMC4wMjIsMC44OTctMC4wODgsMS4zNDZjLTAuMDY3LDAuNDE2LTAuMTU1LDAuODY2LTAuMjY1LDEuMjgzaC00LjEwMWgtMi4wNzEgICAgIHYwLjExOXYwLjExOWMwLDAuNzc3LDAuMjIxLDEuMzc2LDAuNjE3LDEuODIyQzU5Ljg4MSw2OC42Niw2MC4zNjQsNjguODk4LDYxLjAwMyw2OC45NTlMNjEuMDAzLDY4Ljk1OXoiIGZpbGw9IiNGRkZGRkYiLz48cGF0aCBkPSJNODUuOTc1LDcwLjgxYy0wLjEwOSwwLjA5MS0wLjIyMSwwLjE1LTAuMzI5LDAuMjFjLTAuMjY0LDAuMTUtMC41MjcsMC4yNjktMC43NjksMC4zNTcgICAgIGMtMC4yNDMsMC4wNTktMC41NzYsMC4xMjMtMC45OTMsMC4xMjNjLTAuNzA3LDAtMS4yNTctMC4yNzEtMS42OTYtMC43NzhjLTAuNDQxLTAuNTQxLTAuNjQxLTEuMjI3LTAuNjQxLTIuMDYyICAgICBjMC0wLjg5NiwwLjE1My0xLjY0NSwwLjQ2Ni0yLjI3MWMwLjMwNy0wLjYwMiwwLjc2OS0xLjExLDEuMzY3LTEuNDY3YzAuNTcxLTAuMzU3LDEuMjU1LTAuNTk3LDIuMDQ2LTAuNzQ3ICAgICBjMC4xNzgtMC4wMzMsMC4zNTMtMC4wNiwwLjU1LTAuMDkxYzAuNjE5LTAuMTE5LDEuMzAzLTAuMjA3LDIuMDA4LTAuMjRjMC4wMjEtMC4wNTksMC4wMjEtMC4xMTksMC4wNDEtMC4yMDggICAgIGMwLTAuMDg4LDAuMDI0LTAuMTc5LDAuMDI0LTAuMjk4YzAtMC40NzgtMC4xNzQtMC44MDctMC40ODgtMS4wMTdjLTAuMzI5LTAuMTc4LTAuODE0LTAuMjY3LTEuNDUxLTAuMjY3aC0wLjEzNSAgICAgYy0wLjQxNywwLjAyOS0wLjg1NywwLjExOS0xLjMxOSwwLjI5OGMtMC41MzEsMC4yMS0wLjkyOCwwLjM1OS0xLjE5MSwwLjUwOWgtMC4yNDFsMC4zNzYtMi42NiAgICAgYzAuMzA5LTAuMTE5LDAuNzktMC4yMzksMS40NTMtMC4zNThjMC4zMDktMC4wOTEsMC42MTQtMC4xMiwwLjkyMi0wLjE1MWMwLjMzNS0wLjA2LDAuNjYtMC4wNiwxLjAxNS0wLjA2ICAgICBjMS4zMDIsMCwyLjI0NiwwLjIzOSwyLjg2NywwLjY4N2MwLjU5MywwLjQ1LDAuOTAyLDEuMTY4LDAuOTAyLDIuMTUyYzAsMC4xMjEsMCwwLjI5OC0wLjAyMSwwLjUxICAgICBjLTAuMDI0LDAuMjEtMC4wNDUsMC4zOS0wLjA3MSwwLjU2N0w4OS4zNjksNzEuMmgtMi42NDZsMC4yMDQtMS4xOTdjLTAuMTc5LDAuMTUtMC4zNzYsMC4zMjktMC42MTcsMC41NEw4NS45NzUsNzAuODEgICAgIEw4NS45NzUsNzAuODF6IE04NS45NzUsNjYuMTVjLTAuMjg0LDAuMDYtMC41MjYsMC4xNDgtMC43NDYsMC4yNGMtMC4yODUsMC4xNDctMC41MzEsMC4zNTUtMC42ODEsMC42MjYgICAgIGMtMC4xNTksMC4yNzEtMC4yNDYsMC42MjgtMC4yNDYsMS4wNzZjMCwwLjM5LDAuMTEyLDAuNjU3LDAuMzMzLDAuODA3YzAuMTk3LDAuMTQ4LDAuNTA3LDAuMjQsMC45MDQsMC4yNCAgICAgYzAuMTI5LDAsMC4yODgtMC4wMjksMC40MzgtMC4wOTFjMC4xMzUtMC4wMjgsMC4yNjctMC4wODgsMC4zOTctMC4xNDhjMC4zMDktMC4xNzksMC41NzItMC4zOSwwLjg0LTAuNjI3bDAuNDE3LTIuMzkxICAgICBjLTAuNDg0LDAuMDYtMC45MjYsMC4xMjEtMS4zNDUsMC4yMUM4Ni4xNzUsNjYuMDksODYuMDY2LDY2LjExOSw4NS45NzUsNjYuMTVMODUuOTc1LDY2LjE1eiIgZmlsbD0iI0ZGRkZGRiIvPjxwYXRoIGQ9Ik05Ny4yMjIsNjMuMTA0Yy0wLjU4My0wLjQ1LTEuODc5LTAuMzU5LTIuMTQ4LDAuNTY0TDkzLjc5Nyw3MS4yaC0yLjY2NWwxLjkxNy0xMS4yMzhoMi42NjRsLTAuMDU1LDAuOTA3ICAgICBjMC41MDUtMC41MDksMS4wNzEtMC45MzksMi41MDItMC44OTVDOTguMjQ2LDU5Ljk3Nyw5Ny4yOTEsNjEuNjQ1LDk3LjIyMiw2My4xMDRMOTcuMjIyLDYzLjEwNHoiIGZpbGw9IiNGRkZGRkYiLz48cGF0aCBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMDIuNDU4LDYyLjM1MmMtMC4xMzMsMC4wNi0wLjI2MiwwLjE1Mi0wLjM3NCwwLjI0ICAgICBjLTAuMzU1LDAuMjM4LTAuNjQsMC42LTAuODgxLDEuMDE3Yy0wLjIsMC40MTYtMC4zNzYsMC44OTctMC40ODQsMS41MjRjLTAuMTM1LDAuNTk3LTAuMiwxLjE5Ny0wLjIsMS43NjQgICAgIGMwLDAuNjg4LDAuMTMzLDEuMTY1LDAuMzUsMS40NjJjMC4yNDcsMC4zMjksMC41OTcsMC40ODEsMS4wNiwwLjQ4MWMwLjE3OSwwLDAuMzU1LTAuMDMzLDAuNTI5LTAuMTIxICAgICBjMC4wODgtMC4wMzEsMC4xNTUtMC4wNTksMC4yNDMtMC4xMTljMC4yNjQtMC4xNSwwLjUwNS0wLjMwMiwwLjc0OC0wLjUwOWwwLjk0Ny01LjUyOWMtMC4xNTMtMC4wOTEtMC4zMjktMC4xODMtMC41NzEtMC4yNDEgICAgIGMtMC4yMjItMC4wODgtMC40MTktMC4xMTctMC41OTgtMC4xMTdDMTAyLjk0Miw2Mi4yMDQsMTAyLjcwMSw2Mi4yNjEsMTAyLjQ1OCw2Mi4zNTJMMTAyLjQ1OCw2Mi4zNTJ6IE0xMDIuNDU4LDcwLjYwMyAgICAgYy0wLjIsMC4xNzktMC40MjEsMC4zNTctMC42NjIsMC41MDdjLTAuMjE5LDAuMTE5LTAuNDQsMC4yMzgtMC42MzYsMC4yOThjLTAuMjI0LDAuMDYtMC40ODgsMC4wOTEtMC43NzIsMC4wOTEgICAgIGMtMC44MTcsMC0xLjQ1Ny0wLjM2LTEuOTQxLTEuMDQ4Yy0wLjQ2Mi0wLjcxNi0wLjcwNS0xLjczMy0wLjcwNS0zLjAxOWMwLTEuMDc2LDAuMTA5LTIuMDkzLDAuMzc2LTMuMDE5ICAgICBjMC4yNDItMC45MjQsMC41OTMtMS43NjQsMS4wMzYtMi40NzdjMC40NDEtMC43MiwwLjk0Ni0xLjI1OSwxLjUzOS0xLjY3N2MwLjU3Ni0wLjM5LDEuMTQ4LTAuNTk3LDEuNzY1LTAuNjI4aDAuMDg4ICAgICBjMC40NiwwLDAuODYsMC4wNiwxLjE5MSwwLjE3OWMwLjMyOSwwLjExOSwwLjY4NCwwLjMzLDEuMDM1LDAuNTk5bDAuNTkzLTMuOTE5aDIuNjY1TDEwNS41ODcsNzEuMmgtMi42NjVsMC4xOTYtMS4xNjUgICAgIEMxMDIuODc3LDcwLjI0MSwxMDIuNjU1LDcwLjQyNCwxMDIuNDU4LDcwLjYwM0wxMDIuNDU4LDcwLjYwM3oiIGZpbGw9IiNGRkZGRkYiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvZz48L2c+PC9nPjwvc3ZnPg==" height="100%">');
                break;
            case 'Discover':
                $('#card-image').html('<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIxMDBweCIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgMTYwIDEwMCIgd2lkdGg9IjE2MHB4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHRpdGxlLz48ZGVmcy8+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSI+PGcgaWQ9IkRJU0NPVkVSIj48cGF0aCBkPSJNMTQ4LDEuMDExNDY2ODdlLTA2IEMxNDAsMS43NjY0NDU4OGUtMDYgNTUuMzAwNzgxMiwtMS42MDMxODM3M2UtMDYgOCwxLjAxMTQ2Njg3ZS0wNiBDNCwxLjIzMjU3NTMyZS0wNiAtMS44NDc0MTExMWUtMTMsNC4wMDAwMDEwMSAxLjQyMTA4NTQ3ZS0xNCw4LjAwMDAwMTAxIEwxLjQyMTA4NTQ3ZS0xNCw4OC4wMDAwMDEgQy00LjYyODM5ODU1ZS0wNyw5Ni4wMDAwMDEgNCwxMDAuMDAwMDAxIDEyLDEwMC4wMDAwMDEgQzU2LjYyMzIwOTYsMTAwLjAwMDAwMSAxNDAsMTAwLjAwMDAwMiAxNDgsMTAwLjAwMDAwMSBDMTU2LDEwMC4wMDAwMDEgMTYwLDk2LjAwMDAwMSAxNjAsODguMDAwMDAxIEwxNjAsMTIuMDAwMDAxIEMxNjAsNC4wMDAwMDEwMSAxNTYsMS4wMTE0NjY4N2UtMDYgMTQ4LDEuMDExNDY2ODdlLTA2IFogTTE0OCwxLjAxMTQ2Njg3ZS0wNiIgZmlsbD0iI0Y0RjRGNCIgaWQ9IlJlY3RhbmdsZS0xIi8+PHBhdGggZD0iTTQ5LjU0Mjk2ODcsMTAwLjAwMDAwMSBDOTIuNTI4OTk0MywxMDAuMDAwMDAxIDE0MS45MzM4OTksMTAwLjAwMDAwMiAxNDgsMTAwLjAwMDAwMSBDMTU2LDEwMC4wMDAwMDEgMTYwLDk2LjAwMDAwMSAxNjAsODguMDAwMDAxIEwxNjAsNDAuNDI4NzEwOSBDMTYwLDQwLjQyODcxMDkgMTM2LjE1OTE4LDgyLjQwMzMyMDMgNDkuNTQyOTY4NywxMDAuMDAwMDAxIFogTTQ5LjU0Mjk2ODcsMTAwLjAwMDAwMSIgZmlsbD0iI0Q5N0IxNiIgaWQ9IlJlY3RhbmdsZS0xLWNvcHkiLz48cGF0aCBkPSJNNTIuMDM4NDI2Miw0OC45MjA4MTU3IEw1My40NzYyNDcyLDQ4LjkyMDgxNTcgTDU3LjkyNjY0NTMsNTUuNTYyMTc5MSBMNTcuOTQ5NDY3OSw1NS41NjIxNzkxIEw1Ny45NDk0Njc5LDQ4LjkyMDgxNTcgTDU5LjA0NDk1MDUsNDguOTIwODE1NyBMNTkuMDQ0OTUwNSw1NyBMNTcuNjUyNzc0Niw1NyBMNTMuMTU2NzMxNCw1MC4zNTg2MzY2IEw1My4xMzM5MDg4LDUwLjM1ODYzNjYgTDUzLjEzMzkwODgsNTcgTDUyLjAzODQyNjIsNTcgTDUyLjAzODQyNjIsNDguOTIwODE1NyBaIE02MS4xMjE4MDI5LDQ4LjkyMDgxNTcgTDY2LjMzNjc1NjYsNDguOTIwODE1NyBMNjYuMzM2NzU2Niw0OS45NDc4MzA3IEw2Mi4yMTcyODU1LDQ5Ljk0NzgzMDcgTDYyLjIxNzI4NTUsNTIuMzU1NjEwMiBMNjYuMDUxNDc0Nyw1Mi4zNTU2MTAyIEw2Ni4wNTE0NzQ3LDUzLjM4MjYyNTEgTDYyLjIxNzI4NTUsNTMuMzgyNjI1MSBMNjIuMjE3Mjg1NSw1NS45NzI5ODUgTDY2LjU0MjE1OTYsNTUuOTcyOTg1IEw2Ni41NDIxNTk2LDU3IEw2MS4xMjE4MDI5LDU3IEw2MS4xMjE4MDI5LDQ4LjkyMDgxNTcgWiBNNjkuNzgyOTYyNCw0OS45NDc4MzA3IEw2Ny4xODExOTEyLDQ5Ljk0NzgzMDcgTDY3LjE4MTE5MTIsNDguOTIwODE1NyBMNzMuNDgwMjE2Miw0OC45MjA4MTU3IEw3My40ODAyMTYyLDQ5Ljk0NzgzMDcgTDcwLjg3ODQ0NSw0OS45NDc4MzA3IEw3MC44Nzg0NDUsNTcgTDY5Ljc4Mjk2MjQsNTcgTDY5Ljc4Mjk2MjQsNDkuOTQ3ODMwNyBaIE03My42MTcxNTE1LDQ4LjkyMDgxNTcgTDc0Ljc1ODI3OTMsNDguOTIwODE1NyBMNzYuNTM4NDM4NSw1NS4zNzk1OTg2IEw3Ni41NjEyNjExLDU1LjM3OTU5ODYgTDc4LjQ2Njk0NDQsNDguOTIwODE1NyBMNzkuNzIyMTg0OSw0OC45MjA4MTU3IEw4MS42Mjc4NjgyLDU1LjM3OTU5ODYgTDgxLjY1MDY5MDcsNTUuMzc5NTk4NiBMODMuNDMwODUsNDguOTIwODE1NyBMODQuNTcxOTc3Nyw0OC45MjA4MTU3IEw4Mi4yMjEyNTQ2LDU3IEw4MS4wNjg3MTU2LDU3IEw3OS4xMDU5NzU5LDUwLjQwNDI4MTcgTDc5LjA4MzE1MzMsNTAuNDA0MjgxNyBMNzcuMTMxODI0OSw1NyBMNzUuOTc5Mjg1OSw1NyBMNzMuNjE3MTUxNSw0OC45MjA4MTU3IFogTTg5LjMzMDQ4MDMsNTcuMjA1NDAzIEM4OC43MTQyNjgzLDU3LjIwNTQwMyA4OC4xNDc1MTM4LDU3LjA5Njk5NjkgODcuNjMwMiw1Ni44ODAxODE2IEM4Ny4xMTI4ODYyLDU2LjY2MzM2NjIgODYuNjY5NzUyNyw1Ni4zNjQ3NzQxIDg2LjMwMDc4NjIsNTUuOTg0Mzk2MyBDODUuOTMxODE5Nyw1NS42MDQwMTg1IDg1LjY0MjczNjksNTUuMTU1MTc5NCA4NS40MzM1MjkxLDU0LjYzNzg2NTYgQzg1LjIyNDMyMTMsNTQuMTIwNTUxOCA4NS4xMTk3MTksNTMuNTYxNDA0OCA4NS4xMTk3MTksNTIuOTYwNDA3OCBDODUuMTE5NzE5LDUyLjM1OTQxMDkgODUuMjI0MzIxMyw1MS44MDAyNjM5IDg1LjQzMzUyOTEsNTEuMjgyOTUwMSBDODUuNjQyNzM2OSw1MC43NjU2MzYzIDg1LjkzMTgxOTcsNTAuMzE2Nzk3MiA4Ni4zMDA3ODYyLDQ5LjkzNjQxOTQgQzg2LjY2OTc1MjcsNDkuNTU2MDQxNiA4Ny4xMTI4ODYyLDQ5LjI1NzQ0OTUgODcuNjMwMiw0OS4wNDA2MzQxIEM4OC4xNDc1MTM4LDQ4LjgyMzgxODggODguNzE0MjY4Myw0OC43MTU0MTI3IDg5LjMzMDQ4MDMsNDguNzE1NDEyNyBDODkuOTQ2NjkyNCw0OC43MTU0MTI3IDkwLjUxMzQ0NjgsNDguODIzODE4OCA5MS4wMzA3NjA2LDQ5LjA0MDYzNDEgQzkxLjU0ODA3NDUsNDkuMjU3NDQ5NSA5MS45OTEyMDgsNDkuNTU2MDQxNiA5Mi4zNjAxNzQ0LDQ5LjkzNjQxOTQgQzkyLjcyOTE0MDksNTAuMzE2Nzk3MiA5My4wMTgyMjM3LDUwLjc2NTYzNjMgOTMuMjI3NDMxNSw1MS4yODI5NTAxIEM5My40MzY2MzkzLDUxLjgwMDI2MzkgOTMuNTQxMjQxNiw1Mi4zNTk0MTA5IDkzLjU0MTI0MTYsNTIuOTYwNDA3OCBDOTMuNTQxMjQxNiw1My41NjE0MDQ4IDkzLjQzNjYzOTMsNTQuMTIwNTUxOCA5My4yMjc0MzE1LDU0LjYzNzg2NTYgQzkzLjAxODIyMzcsNTUuMTU1MTc5NCA5Mi43MjkxNDA5LDU1LjYwNDAxODUgOTIuMzYwMTc0NCw1NS45ODQzOTYzIEM5MS45OTEyMDgsNTYuMzY0Nzc0MSA5MS41NDgwNzQ1LDU2LjY2MzM2NjIgOTEuMDMwNzYwNiw1Ni44ODAxODE2IEM5MC41MTM0NDY4LDU3LjA5Njk5NjkgODkuOTQ2NjkyNCw1Ny4yMDU0MDMgODkuMzMwNDgwMyw1Ny4yMDU0MDMgWiBNODkuMzMwNDgwMyw1Ni4xNzgzODggQzg5Ljc5NDU0MTMsNTYuMTc4Mzg4IDkwLjIxMjk1MDYsNTYuMDkyODA0MyA5MC41ODU3MjA4LDU1LjkyMTYzNDMgQzkwLjk1ODQ5MTEsNTUuNzUwNDY0MyA5MS4yNzgwMDM2LDU1LjUyMDMzOTIgOTEuNTQ0MjY4MSw1NS4yMzEyNTIgQzkxLjgxMDUzMjYsNTQuOTQyMTY0OSA5Mi4wMTU5MzM1LDU0LjYwMTczMTkgOTIuMTYwNDc3MSw1NC4yMDk5NDI3IEM5Mi4zMDUwMjA3LDUzLjgxODE1MzYgOTIuMzc3MjkxNCw1My40MDE2NDYxIDkyLjM3NzI5MTQsNTIuOTYwNDA3OCBDOTIuMzc3MjkxNCw1Mi41MTkxNjk2IDkyLjMwNTAyMDcsNTIuMTAyNjYyMSA5Mi4xNjA0NzcxLDUxLjcxMDg3MyBDOTIuMDE1OTMzNSw1MS4zMTkwODM4IDkxLjgxMDUzMjYsNTAuOTc4NjUwOCA5MS41NDQyNjgxLDUwLjY4OTU2MzcgQzkxLjI3ODAwMzYsNTAuNDAwNDc2NSA5MC45NTg0OTExLDUwLjE3MDM1MTQgOTAuNTg1NzIwOCw0OS45OTkxODE0IEM5MC4yMTI5NTA2LDQ5LjgyODAxMTQgODkuNzk0NTQxMyw0OS43NDI0Mjc3IDg5LjMzMDQ4MDMsNDkuNzQyNDI3NyBDODguODY2NDE5NCw0OS43NDI0Mjc3IDg4LjQ0ODAxMDEsNDkuODI4MDExNCA4OC4wNzUyMzk4LDQ5Ljk5OTE4MTQgQzg3LjcwMjQ2OTYsNTAuMTcwMzUxNCA4Ny4zODI5NTcsNTAuNDAwNDc2NSA4Ny4xMTY2OTI1LDUwLjY4OTU2MzcgQzg2Ljg1MDQyODEsNTAuOTc4NjUwOCA4Ni42NDUwMjcxLDUxLjMxOTA4MzggODYuNTAwNDgzNiw1MS43MTA4NzMgQzg2LjM1NTk0LDUyLjEwMjY2MjEgODYuMjgzNjY5Myw1Mi41MTkxNjk2IDg2LjI4MzY2OTMsNTIuOTYwNDA3OCBDODYuMjgzNjY5Myw1My40MDE2NDYxIDg2LjM1NTk0LDUzLjgxODE1MzYgODYuNTAwNDgzNiw1NC4yMDk5NDI3IEM4Ni42NDUwMjcxLDU0LjYwMTczMTkgODYuODUwNDI4MSw1NC45NDIxNjQ5IDg3LjExNjY5MjUsNTUuMjMxMjUyIEM4Ny4zODI5NTcsNTUuNTIwMzM5MiA4Ny43MDI0Njk2LDU1Ljc1MDQ2NDMgODguMDc1MjM5OCw1NS45MjE2MzQzIEM4OC40NDgwMTAxLDU2LjA5MjgwNDMgODguODY2NDE5NCw1Ni4xNzgzODggODkuMzMwNDgwMyw1Ni4xNzgzODggQzg5LjMzMDQ4MDMsNTYuMTc4Mzg4IDg4Ljg2NjQxOTQsNTYuMTc4Mzg4IDg5LjMzMDQ4MDMsNTYuMTc4Mzg4IFogTTk1LjExNTk5NzksNDguOTIwODE1NyBMOTcuOTU3NDA1OSw0OC45MjA4MTU3IEM5OC40NzQ3MTk4LDQ4LjkyMDgxNTcgOTguOTAwNzM2NSw0OC45OTExODQ1IDk5LjIzNTQ2OSw0OS4xMzE5MjQzIEM5OS41NzAyMDE1LDQ5LjI3MjY2NDEgOTkuODM0NTYwMSw0OS40NTE0MzkgMTAwLjAyODU1Myw0OS42NjgyNTQ0IEMxMDAuMjIyNTQ1LDQ5Ljg4NTA2OTcgMTAwLjM1NzU3OCw1MC4xMjg1MDc5IDEwMC40MzM2NTMsNTAuMzk4NTc2MSBDMTAwLjUwOTcyOSw1MC42Njg2NDQzIDEwMC41NDc3NjYsNTAuOTI5MTk5MiAxMDAuNTQ3NzY2LDUxLjE4MDI0ODYgQzEwMC41NDc3NjYsNTEuNDM4OTA1NSAxMDAuNTAyMTIxLDUxLjY4ODA0OTIgMTAwLjQxMDgzMSw1MS45Mjc2ODczIEMxMDAuMzE5NTQsNTIuMTY3MzI1MyAxMDAuMTg4MzExLDUyLjM4NDEzNzQgMTAwLjAxNzE0MSw1Mi41NzgxMzAxIEM5OS44NDU5NzE1LDUyLjc3MjEyMjcgOTkuNjM2NzY2OCw1Mi45MzU2ODI3IDk5LjM4OTUyMTIsNTMuMDY4ODE1IEM5OS4xNDIyNzU3LDUzLjIwMTk0NzIgOTguODY2NTA1OSw1My4yODM3MjcyIDk4LjU2MjIwMzYsNTMuMzE0MTU3NCBMMTAwLjg1NTg3LDU3IEw5OS40ODY1MTcxLDU3IEw5Ny40MzI0ODcyLDUzLjQzOTY4MTUgTDk2LjIxMTQ4MDUsNTMuNDM5NjgxNSBMOTYuMjExNDgwNSw1NyBMOTUuMTE1OTk3OSw1NyBMOTUuMTE1OTk3OSw0OC45MjA4MTU3IFogTTk2LjIxMTQ4MDUsNTIuNDgxMTM0MiBMOTcuNjQ5MzAxNCw1Mi40ODExMzQyIEM5Ny44NjIzMTMsNTIuNDgxMTM0MiA5OC4wNzM0MTk1LDUyLjQ2NDAxNzUgOTguMjgyNjI3Myw1Mi40Mjk3ODM1IEM5OC40OTE4MzUxLDUyLjM5NTU0OTUgOTguNjc4MjE3NSw1Mi4zMzI3ODgxIDk4Ljg0MTc3OTksNTIuMjQxNDk3NCBDOTkuMDA1MzQyNCw1Mi4xNTAyMDY3IDk5LjEzNjU3MDgsNTIuMDE4OTc4MyA5OS4yMzU0NjksNTEuODQ3ODA4MyBDOTkuMzM0MzY3Miw1MS42NzY2MzgzIDk5LjM4MzgxNTYsNTEuNDU0MTIwNiA5OS4zODM4MTU2LDUxLjE4MDI0ODYgQzk5LjM4MzgxNTYsNTAuOTA2Mzc2NiA5OS4zMzQzNjcyLDUwLjY4Mzg1ODkgOTkuMjM1NDY5LDUwLjUxMjY4ODkgQzk5LjEzNjU3MDgsNTAuMzQxNTE4OSA5OS4wMDUzNDI0LDUwLjIxMDI5MDUgOTguODQxNzc5OSw1MC4xMTg5OTk4IEM5OC42NzgyMTc1LDUwLjAyNzcwOTEgOTguNDkxODM1MSw0OS45NjQ5NDc3IDk4LjI4MjYyNzMsNDkuOTMwNzEzNyBDOTguMDczNDE5NSw0OS44OTY0Nzk3IDk3Ljg2MjMxMyw0OS44NzkzNjMgOTcuNjQ5MzAxNCw0OS44NzkzNjMgTDk2LjIxMTQ4MDUsNDkuODc5MzYzIEw5Ni4yMTE0ODA1LDUyLjQ4MTEzNDIgWiBNMTAyLjA4ODI4OCw0OC45MjA4MTU3IEwxMDMuMTgzNzcxLDQ4LjkyMDgxNTcgTDEwMy4xODM3NzEsNTIuNDEyNjY2NSBMMTAzLjI3NTA2MSw1Mi40MTI2NjY1IEwxMDYuODQ2NzkxLDQ4LjkyMDgxNTcgTDEwOC4zNzU5MDIsNDguOTIwODE1NyBMMTA0LjQ3MzI0NSw1Mi42NTIzMDM0IEwxMDguNjM4MzYxLDU3IEwxMDcuMDQwNzgzLDU3IEwxMDMuMjc1MDYxLDUyLjk2MDQwNzggTDEwMy4xODM3NzEsNTIuOTYwNDA3OCBMMTAzLjE4Mzc3MSw1NyBMMTAyLjA4ODI4OCw1NyBMMTAyLjA4ODI4OCw0OC45MjA4MTU3IFogTTEwMi4wODgyODgsNDguOTIwODE1NyIgZmlsbD0iIzAwMDAwMCIgaWQ9Ik5FVFdPUksiLz48cGF0aCBkPSJNMTQuMTMzNSwyMy44ODQgTDIxLjY2NjUsMjMuODg0IEMyMi45MjY1MDYzLDIzLjg4NCAyNC4xNDE0OTQyLDI0LjA3NzQ5ODEgMjUuMzExNSwyNC40NjQ1IEMyNi40ODE1MDU5LDI0Ljg1MTUwMTkgMjcuNTE2NDk1NSwyNS40NDA5OTYgMjguNDE2NSwyNi4yMzMgQzI5LjMxNjUwNDUsMjcuMDI1MDA0IDMwLjAzNjQ5NzMsMjguMDE5NDk0IDMwLjU3NjUsMjkuMjE2NSBDMzEuMTE2NTAyNywzMC40MTM1MDYgMzEuMzg2NSwzMS44MjE5OTE5IDMxLjM4NjUsMzMuNDQyIEMzMS4zODY1LDM1LjA4MDAwODIgMzEuMDc2MDAzMSwzNi40OTc0OTQgMzAuNDU1LDM3LjY5NDUgQzI5LjgzMzk5NjksMzguODkxNTA2IDI5LjAzMzAwNDksMzkuODgxNDk2MSAyOC4wNTIsNDAuNjY0NSBDMjcuMDcwOTk1MSw0MS40NDc1MDM5IDI1Ljk4MjAwNiw0Mi4wMzI0OTgxIDI0Ljc4NSw0Mi40MTk1IEMyMy41ODc5OTQsNDIuODA2NTAxOSAyMi40MTM1MDU4LDQzIDIxLjI2MTUsNDMgTDE0LjEzMzUsNDMgTDE0LjEzMzUsMjMuODg0IFogTTIwLjA3MzUsMzkuOTIyIEMyMS4xMzU1MDUzLDM5LjkyMiAyMi4xMzg5OTUzLDM5LjgwMDUwMTIgMjMuMDg0LDM5LjU1NzUgQzI0LjAyOTAwNDcsMzkuMzE0NDk4OCAyNC44NTI0OTY1LDM4LjkzNjUwMjYgMjUuNTU0NSwzOC40MjM1IEMyNi4yNTY1MDM1LDM3LjkxMDQ5NzQgMjYuODA5OTk4LDM3LjI0NDUwNDEgMjcuMjE1LDM2LjQyNTUgQzI3LjYyMDAwMiwzNS42MDY0OTU5IDI3LjgyMjUsMzQuNjEyMDA1OSAyNy44MjI1LDMzLjQ0MiBDMjcuODIyNSwzMi4yODk5OTQyIDI3LjY0MjUwMTgsMzEuMzAwMDA0MSAyNy4yODI1LDMwLjQ3MiBDMjYuOTIyNDk4MiwyOS42NDM5OTU5IDI2LjQyMzAwMzIsMjguOTczNTAyNiAyNS43ODQsMjguNDYwNSBDMjUuMTQ0OTk2OCwyNy45NDc0OTc0IDI0LjM4OTAwNDQsMjcuNTY5NTAxMiAyMy41MTYsMjcuMzI2NSBDMjIuNjQyOTk1NiwyNy4wODM0OTg4IDIxLjY4NDUwNTIsMjYuOTYyIDIwLjY0MDUsMjYuOTYyIEwxNy41MzU1LDI2Ljk2MiBMMTcuNTM1NSwzOS45MjIgTDIwLjA3MzUsMzkuOTIyIFogTTM0LjU0NTUsMjMuODg0IEwzNy45NDc1LDIzLjg4NCBMMzcuOTQ3NSw0MyBMMzQuNTQ1NSw0MyBMMzQuNTQ1NSwyMy44ODQgWiBNNTEuNTAxNSwyNy45ODggQzUxLjE0MTQ5ODIsMjcuNDY1OTk3NCA1MC42NjAwMDMsMjcuMDgzNTAxMiA1MC4wNTcsMjYuODQwNSBDNDkuNDUzOTk3LDI2LjU5NzQ5ODggNDguODE5NTAzMywyNi40NzYgNDguMTUzNSwyNi40NzYgQzQ3Ljc1NzQ5OCwyNi40NzYgNDcuMzc1MDAxOCwyNi41MjA5OTk2IDQ3LjAwNiwyNi42MTEgQzQ2LjYzNjk5ODIsMjYuNzAxMDAwNSA0Ni4zMDQwMDE1LDI2Ljg0NDk5OSA0Ni4wMDcsMjcuMDQzIEM0NS43MDk5OTg1LDI3LjI0MTAwMSA0NS40NzE1MDA5LDI3LjQ5NzQ5ODQgNDUuMjkxNSwyNy44MTI1IEM0NS4xMTE0OTkxLDI4LjEyNzUwMTYgNDUuMDIxNSwyOC41MDA5OTc4IDQ1LjAyMTUsMjguOTMzIEM0NS4wMjE1LDI5LjU4MTAwMzIgNDUuMjQ2NDk3NywzMC4wNzU5OTgzIDQ1LjY5NjUsMzAuNDE4IEM0Ni4xNDY1MDIyLDMwLjc2MDAwMTcgNDYuNzA0NDk2NywzMS4wNTY5OTg3IDQ3LjM3MDUsMzEuMzA5IEM0OC4wMzY1MDMzLDMxLjU2MTAwMTMgNDguNzY1NDk2LDMxLjgwMzk5ODggNDkuNTU3NSwzMi4wMzggQzUwLjM0OTUwNCwzMi4yNzIwMDEyIDUxLjA3ODQ5NjcsMzIuNTk1OTk3OSA1MS43NDQ1LDMzLjAxIEM1Mi40MTA1MDMzLDMzLjQyNDAwMjEgNTIuOTY4NDk3NywzMy45NzI5OTY2IDUzLjQxODUsMzQuNjU3IEM1My44Njg1MDIyLDM1LjM0MTAwMzQgNTQuMDkzNSwzNi4yNDk5OTQzIDU0LjA5MzUsMzcuMzg0IEM1NC4wOTM1LDM4LjQxMDAwNTEgNTMuOTA0NTAxOSwzOS4zMDU0OTYyIDUzLjUyNjUsNDAuMDcwNSBDNTMuMTQ4NDk4MSw0MC44MzU1MDM4IDUyLjY0MDAwMzIsNDEuNDY5OTk3NSA1Mi4wMDEsNDEuOTc0IEM1MS4zNjE5OTY4LDQyLjQ3ODAwMjUgNTAuNjE5NTA0Miw0Mi44NTU5OTg3IDQ5Ljc3MzUsNDMuMTA4IEM0OC45Mjc0OTU4LDQzLjM2MDAwMTMgNDguMDM2NTA0Nyw0My40ODYgNDcuMTAwNSw0My40ODYgQzQ1LjkxMjQ5NDEsNDMuNDg2IDQ0Ljc2OTUwNTUsNDMuMjg4MDAyIDQzLjY3MTUsNDIuODkyIEM0Mi41NzM0OTQ1LDQyLjQ5NTk5OCA0MS42Mjg1MDQsNDEuODMwMDA0NyA0MC44MzY1LDQwLjg5NCBMNDMuNDAxNSwzOC40MSBDNDMuODE1NTAyMSwzOS4wNDAwMDMyIDQ0LjM1OTk5NjYsMzkuNTMwNDk4MiA0NS4wMzUsMzkuODgxNSBDNDUuNzEwMDAzNCw0MC4yMzI1MDE4IDQ2LjQyNTQ5NjIsNDAuNDA4IDQ3LjE4MTUsNDAuNDA4IEM0Ny41Nzc1MDIsNDAuNDA4IDQ3Ljk3MzQ5OCw0MC4zNTQwMDA1IDQ4LjM2OTUsNDAuMjQ2IEM0OC43NjU1MDIsNDAuMTM3OTk5NSA0OS4xMjU0OTg0LDM5Ljk3NjAwMTEgNDkuNDQ5NSwzOS43NiBDNDkuNzczNTAxNiwzOS41NDM5OTg5IDUwLjAzNDQ5OSwzOS4yNjk1MDE3IDUwLjIzMjUsMzguOTM2NSBDNTAuNDMwNTAxLDM4LjYwMzQ5ODMgNTAuNTI5NSwzOC4yMjEwMDIyIDUwLjUyOTUsMzcuNzg5IEM1MC41Mjk1LDM3LjA4Njk5NjUgNTAuMzA0NTAyMiwzNi41NDcwMDE5IDQ5Ljg1NDUsMzYuMTY5IEM0OS40MDQ0OTc3LDM1Ljc5MDk5ODEgNDguODQ2NTAzMywzNS40NzE1MDEzIDQ4LjE4MDUsMzUuMjEwNSBDNDcuNTE0NDk2NywzNC45NDk0OTg3IDQ2Ljc4NTUwNCwzNC43MDIwMDEyIDQ1Ljk5MzUsMzQuNDY4IEM0NS4yMDE0OTYsMzQuMjMzOTk4OCA0NC40NzI1MDMzLDMzLjkxNDUwMiA0My44MDY1LDMzLjUwOTUgQzQzLjE0MDQ5NjcsMzMuMTA0NDk4IDQyLjU4MjUwMjIsMzIuNTY0NTAzNCA0Mi4xMzI1LDMxLjg4OTUgQzQxLjY4MjQ5NzcsMzEuMjE0NDk2NiA0MS40NTc1LDMwLjMxMDAwNTcgNDEuNDU3NSwyOS4xNzYgQzQxLjQ1NzUsMjguMTg1OTk1MSA0MS42NTk5OTgsMjcuMzMxMDAzNiA0Mi4wNjUsMjYuNjExIEM0Mi40NzAwMDIsMjUuODkwOTk2NCA0My4wMDA5OTY3LDI1LjI5MjUwMjQgNDMuNjU4LDI0LjgxNTUgQzQ0LjMxNTAwMzMsMjQuMzM4NDk3NiA0NS4wNjY0OTU4LDIzLjk4MzAwMTIgNDUuOTEyNSwyMy43NDkgQzQ2Ljc1ODUwNDIsMjMuNTE0OTk4OCA0Ny42MjI0OTU2LDIzLjM5OCA0OC41MDQ1LDIzLjM5OCBDNDkuNTEyNTA1LDIzLjM5OCA1MC40ODg5OTUzLDIzLjU1MDk5ODUgNTEuNDM0LDIzLjg1NyBDNTIuMzc5MDA0NywyNC4xNjMwMDE1IDUzLjIyOTQ5NjIsMjQuNjY2OTk2NSA1My45ODU1LDI1LjM2OSBDNTMuOTg1NSwyNS4zNjkgNTMuMjI5NDk2MiwyNC42NjY5OTY1IDUzLjk4NTUsMjUuMzY5IEw1MS41MDE1LDI3Ljk4OCBaIE03MC43NTI1LDI4LjM2NiBDNzAuMDUwNDk2NSwyNy42MDk5OTYyIDY5LjM3MTAwMzMsMjcuMTA2MDAxMyA2OC43MTQsMjYuODU0IEM2OC4wNTY5OTY3LDI2LjYwMTk5ODcgNjcuMzk1NTAzMywyNi40NzYgNjYuNzI5NSwyNi40NzYgQzY1LjczOTQ5NTEsMjYuNDc2IDY0Ljg0NDAwNCwyNi42NTE0OTgyIDY0LjA0MywyNy4wMDI1IEM2My4yNDE5OTYsMjcuMzUzNTAxOCA2Mi41NTM1MDI5LDI3LjgzOTQ5NjkgNjEuOTc3NSwyOC40NjA1IEM2MS40MDE0OTcxLDI5LjA4MTUwMzEgNjAuOTU2MDAxNiwyOS44MDU5OTU5IDYwLjY0MSwzMC42MzQgQzYwLjMyNTk5ODQsMzEuNDYyMDA0MSA2MC4xNjg1LDMyLjM1Mjk5NTIgNjAuMTY4NSwzMy4zMDcgQzYwLjE2ODUsMzQuMzMzMDA1MSA2MC4zMjU5OTg0LDM1LjI3Nzk5NTcgNjAuNjQxLDM2LjE0MiBDNjAuOTU2MDAxNiwzNy4wMDYwMDQzIDYxLjQwMTQ5NzEsMzcuNzUyOTk2OSA2MS45Nzc1LDM4LjM4MyBDNjIuNTUzNTAyOSwzOS4wMTMwMDMyIDYzLjI0MTk5NiwzOS41MDc5OTgyIDY0LjA0MywzOS44NjggQzY0Ljg0NDAwNCw0MC4yMjgwMDE4IDY1LjczOTQ5NTEsNDAuNDA4IDY2LjcyOTUsNDAuNDA4IEM2Ny41MDM1MDM5LDQwLjQwOCA2OC4yNTQ5OTY0LDQwLjIyMzUwMTggNjguOTg0LDM5Ljg1NDUgQzY5LjcxMzAwMzYsMzkuNDg1NDk4MiA3MC4zOTI0OTY5LDM4Ljg5NjAwNDEgNzEuMDIyNSwzOC4wODYgTDczLjgzMDUsNDAuMDg0IEM3Mi45NjY0OTU3LDQxLjI3MjAwNTkgNzEuOTEzNTA2Miw0Mi4xMzU5OTczIDcwLjY3MTUsNDIuNjc2IEM2OS40Mjk0OTM4LDQzLjIxNjAwMjcgNjguMTA2NTA3LDQzLjQ4NiA2Ni43MDI1LDQzLjQ4NiBDNjUuMjI2NDkyNiw0My40ODYgNjMuODcyMDA2Miw0My4yNDc1MDI0IDYyLjYzOSw0Mi43NzA1IEM2MS40MDU5OTM4LDQyLjI5MzQ5NzYgNjAuMzQ0MDA0NSw0MS42MTg1MDQ0IDU5LjQ1Myw0MC43NDU1IEM1OC41NjE5OTU1LDM5Ljg3MjQ5NTYgNTcuODY0NTAyNSwzOC44MjQwMDYxIDU3LjM2MDUsMzcuNiBDNTYuODU2NDk3NSwzNi4zNzU5OTM5IDU2LjYwNDUsMzUuMDE3MDA3NSA1Ni42MDQ1LDMzLjUyMyBDNTYuNjA0NSwzMS45OTI5OTI0IDU2Ljg1NjQ5NzUsMzAuNjAyNTA2MyA1Ny4zNjA1LDI5LjM1MTUgQzU3Ljg2NDUwMjUsMjguMTAwNDkzNyA1OC41NjE5OTU1LDI3LjAzNDAwNDQgNTkuNDUzLDI2LjE1MiBDNjAuMzQ0MDA0NSwyNS4yNjk5OTU2IDYxLjQwNTk5MzgsMjQuNTkwNTAyNCA2Mi42MzksMjQuMTEzNSBDNjMuODcyMDA2MiwyMy42MzY0OTc2IDY1LjIyNjQ5MjYsMjMuMzk4IDY2LjcwMjUsMjMuMzk4IEM2Ny45OTg1MDY1LDIzLjM5OCA2OS4xOTk5OTQ1LDIzLjYyNzQ5NzcgNzAuMzA3LDI0LjA4NjUgQzcxLjQxNDAwNTUsMjQuNTQ1NTAyMyA3Mi40NDQ0OTUyLDI1LjMyMzk5NDUgNzMuMzk4NSwyNi40MjIgQzczLjM5ODUsMjYuNDIyIDcyLjQ0NDQ5NTIsMjUuMzIzOTk0NSA3My4zOTg1LDI2LjQyMiBMNzAuNzUyNSwyOC4zNjYgWiBNOTYuNDAyNSwyMy44ODQgTDEwMC4zMTc1LDIzLjg4NCBMMTA1LjUyODUsMzguMzI5IEwxMTAuOTAxNSwyMy44ODQgTDExNC41NzM1LDIzLjg4NCBMMTA2Ljg1MTUsNDMgTDEwMy45MDg1LDQzIEw5Ni40MDI1LDIzLjg4NCBaIE0xMTYuNjI1NSwyMy44ODQgTDEyOS4yODg1LDIzLjg4NCBMMTI5LjI4ODUsMjYuOTYyIEwxMjAuMDI3NSwyNi45NjIgTDEyMC4wMjc1LDMxLjY2IEwxMjguODAyNSwzMS42NiBMMTI4LjgwMjUsMzQuNzM4IEwxMjAuMDI3NSwzNC43MzggTDEyMC4wMjc1LDM5LjkyMiBMMTI5Ljc3NDUsMzkuOTIyIEwxMjkuNzc0NSw0MyBMMTE2LjYyNTUsNDMgTDExNi42MjU1LDIzLjg4NCBaIE0xMzMuMTIyNSwyMy44ODQgTDEzOS43NjQ1LDIzLjg4NCBDMTQwLjY4MjUwNSwyMy44ODQgMTQxLjU2ODk5NiwyMy45Njk0OTkxIDE0Mi40MjQsMjQuMTQwNSBDMTQzLjI3OTAwNCwyNC4zMTE1MDA5IDE0NC4wMzk0OTcsMjQuNjAzOTk3OSAxNDQuNzA1NSwyNS4wMTggQzE0NS4zNzE1MDMsMjUuNDMyMDAyMSAxNDUuOTAyNDk4LDI1Ljk4OTk5NjUgMTQ2LjI5ODUsMjYuNjkyIEMxNDYuNjk0NTAyLDI3LjM5NDAwMzUgMTQ2Ljg5MjUsMjguMjg0OTk0NiAxNDYuODkyNSwyOS4zNjUgQzE0Ni44OTI1LDMwLjc1MTAwNjkgMTQ2LjUxMDAwNCwzMS45MTE5OTUzIDE0NS43NDUsMzIuODQ4IEMxNDQuOTc5OTk2LDMzLjc4NDAwNDcgMTQzLjg4NjUwNywzNC4zNTA5OTkgMTQyLjQ2NDUsMzQuNTQ5IEwxNDcuNTQwNSw0MyBMMTQzLjQzNjUsNDMgTDEzOS4wMDg1LDM0LjkgTDEzNi41MjQ1LDM0LjkgTDEzNi41MjQ1LDQzIEwxMzMuMTIyNSw0MyBMMTMzLjEyMjUsMjMuODg0IFogTTEzOS4xNzA1LDMxLjk4NCBDMTM5LjY1NjUwMiwzMS45ODQgMTQwLjE0MjQ5OCwzMS45NjE1MDAyIDE0MC42Mjg1LDMxLjkxNjUgQzE0MS4xMTQ1MDIsMzEuODcxNDk5OCAxNDEuNTU5OTk4LDMxLjc2MzUwMDkgMTQxLjk2NSwzMS41OTI1IEMxNDIuMzcwMDAyLDMxLjQyMTQ5OTEgMTQyLjY5ODQ5OSwzMS4xNjA1MDE4IDE0Mi45NTA1LDMwLjgwOTUgQzE0My4yMDI1MDEsMzAuNDU4NDk4MiAxNDMuMzI4NSwyOS45NjgwMDMyIDE0My4zMjg1LDI5LjMzOCBDMTQzLjMyODUsMjguNzc5OTk3MiAxNDMuMjExNTAxLDI4LjMzMDAwMTcgMTQyLjk3NzUsMjcuOTg4IEMxNDIuNzQzNDk5LDI3LjY0NTk5ODMgMTQyLjQzNzUwMiwyNy4zODk1MDA5IDE0Mi4wNTk1LDI3LjIxODUgQzE0MS42ODE0OTgsMjcuMDQ3NDk5MSAxNDEuMjYzMDAyLDI2LjkzNTAwMDMgMTQwLjgwNCwyNi44ODEgQzE0MC4zNDQ5OTgsMjYuODI2OTk5NyAxMzkuODk5NTAyLDI2LjggMTM5LjQ2NzUsMjYuOCBMMTM2LjUyNDUsMjYuOCBMMTM2LjUyNDUsMzEuOTg0IEwxMzkuMTcwNSwzMS45ODQgWiBNMTM5LjE3MDUsMzEuOTg0IiBmaWxsPSIjMDAwMDAwIi8+PGNpcmNsZSBjeD0iODYuMDUiIGN5PSIzMy40NSIgZD0iTTg2LjA1LDQzLjUgQzkxLjYwMDQ2Miw0My41IDk2LjEsMzkuMDAwNDYyIDk2LjEsMzMuNDUgQzk2LjEsMjcuODk5NTM4IDkxLjYwMDQ2MiwyMy40IDg2LjA1LDIzLjQgQzgwLjQ5OTUzOCwyMy40IDc2LDI3Ljg5OTUzOCA3NiwzMy40NSBDNzYsMzkuMDAwNDYyIDgwLjQ5OTUzOCw0My41IDg2LjA1LDQzLjUgWiBNODYuMDUsNDMuNSIgZmlsbD0iI0Q5N0IxNiIgaWQ9Ik92YWwtMSIgcj0iMTAuMDUiLz48L2c+PC9nPjwvc3ZnPg==" height="100%">');
                break;
            case 'American Express':
                $('#card-image').html('<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDEyOCAxMjgiIGlkPSLQodC70L7QuV8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48Zz48cGF0aCBkPSJNMTE3Ljg4NiwxMDMuMDU1SDEwLjExNEM1LjYzMywxMDMuMDU1LDIsOTkuNDIyLDIsOTQuOTQxVjMzLjA1OWMwLTQuNDgxLDMuNjMzLTguMTE0LDguMTE0LTguMTE0aDEwNy43NzEgICBjNC40ODEsMCw4LjExNCwzLjYzMyw4LjExNCw4LjExNHY2MS44ODFDMTI2LDk5LjQyMiwxMjIuMzY3LDEwMy4wNTUsMTE3Ljg4NiwxMDMuMDU1eiIgZmlsbD0iIzY1QzhDRSIvPjxnPjxnPjxwb2x5Z29uIGZpbGw9IiNGRkZGRkYiIHBvaW50cz0iNzUuODYsNTguNTg0IDc1Ljg2LDYxLjk2MiA4NS41NDMsNjEuOTYyIDg1LjU0Myw2NS43MjQgNzUuODYsNjUuNzI0IDc1Ljg2LDY5LjQxNiAgICAgIDg2LjcyNyw2OS40MTYgOTEuNzc4LDYzLjk4MyA4Ni45MzYsNTguNTg0ICAgICIvPjxwb2x5Z29uIGZpbGw9IiNGRkZGRkYiIHBvaW50cz0iMjguMDcyLDY1LjI3MSAzNC4xMzIsNjUuMjcxIDMxLjEwMiw1Ny44ODcgICAgIi8+PHBhdGggZD0iTTExNCw1MS4wOTVIOTguMzYxbC0zLjY1NywzLjkzNmwtMy40MTMtMy45MzZINTcuNjQzbC0yLjg5MSw2LjY1M2wtMi45NjEtNi42NTNoLTEzLjQ4djMuMDNsLTEuNDk4LTMuMDMgICAgIGwtMTEuNTI5LDBMMTQsNzYuODdoMTMuNTE0bDEuNjcyLTQuMTFoMy44MzFsMS42NzIsNC4xMWgxNC44NzN2LTMuMTM1bDEuMzI0LDMuMTM1aDcuNjk4bDEuMzI0LTMuMjA0djMuMjA0aDMwLjkzbDMuNzYyLTQuMDA2ICAgICBsMy41MTgsNC4wMDZMMTE0LDc2LjkwNWwtMTEuMzItMTIuODUzTDExNCw1MS4wOTV6IE02Ny40NjYsNzMuMjQ4aC00LjM4OWwwLTE0LjQ5bC02LjM3NCwxNC40OWgtMy45MDFsLTYuNDA5LTE0LjQ5djE0LjQ5ICAgICBoLTguOTg2TDM1LjcsNjkuMTAzaC05LjE5NWwtMS43MDcsNC4xNDVoLTQuODA3bDcuOTA3LTE4LjQ5NWg2LjU4M2w3LjQ4OSwxNy40ODVWNTQuNzUyaDcuMjFsNS43ODIsMTIuNTM5bDUuMzI5LTEyLjUzOWg3LjE3NSAgICAgVjczLjI0OHogTTEwNS43MSw3My4yNDhoLTUuNjc3bC01LjQzNC02LjEzbC01LjY0Myw2LjEzSDcxLjQ3MVY1NC43NTJoMTcuNzY0bDUuNDM0LDYuMDYxbDUuNjA4LTYuMDYxaDUuNDM0bC04LjI1NSw5LjMgICAgIEwxMDUuNzEsNzMuMjQ4eiIgZmlsbD0iI0ZGRkZGRiIvPjwvZz48L2c+PC9nPjwvc3ZnPg==" height="100%">');
                break;
            case 'Unknown':
                $('#card-image').html('<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgZGF0YS1uYW1lPSJMYXllciAxIiBpZD0iTGF5ZXJfMSIgdmlld0JveD0iMCAwIDYwIDYwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48ZGVmcz48c3R5bGU+LmNscy0xLC5jbHMtMTAsLmNscy0xMSwuY2xzLTIsLmNscy02LC5jbHMtN3tmaWxsOm5vbmU7fS5jbHMtMXtjbGlwLXJ1bGU6ZXZlbm9kZDt9LmNscy0yLC5jbHMtNXtmaWxsLXJ1bGU6ZXZlbm9kZDt9LmNscy0ze2NsaXAtcGF0aDp1cmwoI2NsaXAtcGF0aCk7fS5jbHMtNHtjbGlwLXBhdGg6dXJsKCNjbGlwLXBhdGgtMik7fS5jbHMtNXtmaWxsOiNmZTg2NTc7fS5jbHMtMTAsLmNscy0xMSwuY2xzLTZ7c3Ryb2tlOiNmZTg2NTc7fS5jbHMtMTAsLmNscy02e3N0cm9rZS1saW5lY2FwOnJvdW5kO30uY2xzLTEwLC5jbHMtMTEsLmNscy02LC5jbHMtN3tzdHJva2UtbGluZWpvaW46cm91bmQ7fS5jbHMtNntzdHJva2Utd2lkdGg6NHB4O30uY2xzLTd7c3Ryb2tlOiNlMDZjM2U7fS5jbHMtMTEsLmNscy03e3N0cm9rZS1saW5lY2FwOnNxdWFyZTt9LmNscy0xMCwuY2xzLTExLC5jbHMtN3tzdHJva2Utd2lkdGg6MnB4O30uY2xzLTh7Y2xpcC1wYXRoOnVybCgjY2xpcC1wYXRoLTQpO30uY2xzLTl7ZmlsbDojZmZkYzgyO308L3N0eWxlPjxjbGlwUGF0aCBpZD0iY2xpcC1wYXRoIj48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0xLDQ2VjE4YTUsNSwwLDAsMSw1LTVINTRhNSw1LDAsMCwxLDUsNVY0NmE1LDUsMCwwLDEtNSw1SDZBNSw1LDAsMCwxLDEsNDZabTIsMGEzLDMsMCwwLDAsMywzSDU0YTMsMywwLDAsMCwzLTNWMThhMywzLDAsMCwwLTMtM0g2YTMsMywwLDAsMC0zLDNWNDZaTS0xOSw3MUg3OVYtN0gtMTlWNzFaIi8+PC9jbGlwUGF0aD48Y2xpcFBhdGggaWQ9ImNsaXAtcGF0aC0yIj48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0yLDQ2YTQsNCwwLDAsMCw0LDRINTRhNCw0LDAsMCwwLDQtNFYxOGE0LDQsMCwwLDAtNC00SDZhNCw0LDAsMCwwLTQsNFY0NloiLz48L2NsaXBQYXRoPjxjbGlwUGF0aCBpZD0iY2xpcC1wYXRoLTQiPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTksMjlhMiwyLDAsMCwwLDIsMkgyMmEyLDIsMCwwLDAsMi0yVjIzYTIsMiwwLDAsMC0yLTJIMTFhMiwyLDAsMCwwLTIsMnY2WiIvPjwvY2xpcFBhdGg+PC9kZWZzPjx0aXRsZS8+PGcgY2xhc3M9ImNscy0zIj48ZyBjbGFzcz0iY2xzLTQiPjxwYXRoIGNsYXNzPSJjbHMtNSIgZD0iTTIsNDZhNCw0LDAsMCwwLDQsNEg1NGE0LDQsMCwwLDAsNC00VjE4YTQsNCwwLDAsMC00LTRINmE0LDQsMCwwLDAtNCw0VjQ2WiIvPjwvZz48L2c+PGcgY2xhc3M9ImNscy00Ij48cGF0aCBjbGFzcz0iY2xzLTYiIGQ9Ik0yLDQ2YTQsNCwwLDAsMCw0LDRINTRhNCw0LDAsMCwwLDQtNFYxOGE0LDQsMCwwLDAtNC00SDZhNCw0LDAsMCwwLTQsNFY0NloiLz48L2c+PGxpbmUgY2xhc3M9ImNscy03IiB4MT0iOSIgeDI9IjI4IiB5MT0iMzkiIHkyPSIzOSIvPjxsaW5lIGNsYXNzPSJjbHMtNyIgeDE9IjMyIiB4Mj0iNTEiIHkxPSIzOSIgeTI9IjM5Ii8+PGcgY2xhc3M9ImNscy04Ij48cmVjdCBjbGFzcz0iY2xzLTkiIGhlaWdodD0iMjAiIHdpZHRoPSIyNSIgeD0iNCIgeT0iMTYiLz48L2c+PHBhdGggY2xhc3M9ImNscy0xMCIgZD0iTTksMjlhMiwyLDAsMCwwLDIsMkgyMmEyLDIsMCwwLDAsMi0yVjIzYTIsMiwwLDAsMC0yLTJIMTFhMiwyLDAsMCwwLTIsMnY2WiIvPjxsaW5lIGNsYXNzPSJjbHMtMTEiIHgxPSIxOCIgeDI9IjE4IiB5MT0iMzEiIHkyPSIyMSIvPjxsaW5lIGNsYXNzPSJjbHMtMTEiIHgxPSI5IiB4Mj0iMTciIHkxPSIyNyIgeTI9IjI3Ii8+PGxpbmUgY2xhc3M9ImNscy0xMSIgeDE9IjE4IiB4Mj0iMjQiIHkxPSIyNSIgeTI9IjI1Ii8+PC9zdmc+" height="55px">');
                break;
        }
    }

    // check card type on card number input blur 
    $('#card-number').blur(function(event) {
        event.preventDefault();
        checkCardType();
    });

    // get each input value and use Stripe to determine whether they are valid
    var cardNumber = $('#card-number').val();
    var expMonth = $('#card-month').val();
    var expYear = $('#card-year').val();
    var cardCVC = $('#card-cvc').val();
    var cardHolder = $('#card-holder').val();
    event.preventDefault();

    // alert the user if any fields are missing
    if (!cardNumber || !cardCVC || !cardHolder || !expMonth || !expYear) {
        // console.log(cardNumber + cardCVC + cardHolder + cardMonth + cardYear);
        $('#form-errors').addClass('hidden');
        $('#card-success').addClass('hidden');
        $('#form-errors').removeClass('hidden');
        $('#card-error').text('Please complete all fields.');
        findEmpty();
    } else {

        const result = response

        // alert the user if any fields are invalid
        if (result === "exp" || result === "number" || result === "cvv") {
            $('#form-errors').css('display', 'block');
            $('#form-errors').removeClass('hidden')
            if (result === "number") {
                $('#card-error').text('Invalid credit card number.');
            } else if (result === "exp") {
                $('#card-error').text('Invalid expiration date.')
            } else if (result === "cvv") {
                $('#card-error').text('Invalid CVC code.')

            }

        } else {
            $('#card-success').removeClass('hidden');
            $('#form-errors').css('display', 'none');
            setTimeout(function() {
                $('#card-success').addClass('hidden');
                $('#creditCard').modal('hide');
                $('#creditCard').on('hidden.bs.modal', function(e) {
                        $(this)
                            .find("input,textarea,select")
                            .val('')
                            .end()
                    })
                    .val('')
                    .end()
            }, 2000)
            map.closePopup()

            return { cardNumber, cardHolder, cardYear, cardMonth, cardCVC }
        }
    }
}

function showError(elementId, text) {
    var element = document.getElementById(elementId)
    element.style.display = 'block'
    element.innerHTML = text
    $("#" + elementId).delay(5000).fadeOut(1200)
}

function payment() {



    let bookObj = {
        accomID: document.getElementById('accomID').value,
        begin_at: document.getElementById("datepicker").value,
        npeople: document.getElementById("npeople").value,
        accID: sessionStorage.getItem('accID'),
        username: sessionStorage.getItem('username')
    }

    const creditCard = {
        cardHolder: document.getElementById('card-holder').value,
        cardNumber: document.getElementById('card-number').value,
        cardCVC: document.getElementById('card-cvc').value,
        expDetails: document.getElementById('card-month').value.toString() + "/" + document.getElementById('card-year').value.toString()
    }


    $.ajax({
        type: "POST",
        url: "/checkCreditCard",
        data: JSON.stringify([creditCard, bookObj]),
        contentType: "application/json; charset=utf-8",
        async: true,
        success: function(response) {
            const cChecker = cardChecker(response)
            if (cChecker) {
                setTimeout(function() {
                    $('#creditCard').modal('hide');
                    $('#bookModal').modal('hide');
                    map.setView([latit, longit], 16)
                }, 1000)
            }

        },
        error: function(xhr, status, error) {
            alert("An error occured during booking, your account was not debited. Please contact the Administrator!", error);
        }

    });

    // payment().then((response) => {

    //     if (!response) {
    //         alert('Payment unsuccessful, your account was not debited.');
    //         return
    //     } else {
    //         $.ajax({
    //             type: "POST",
    //             url: "http://localhost:3030/book",
    //             data: JSON.stringify(bookObj),
    //             contentType: "application/json; charset=utf-8",
    //             async: true,
    //             success: function(response) {
    //                 alert(response)
    //                 map.closePopup();
    //             },
    //             error: function(xhr, status, error) {
    //                 alert("An error occured during booking, please contact the Administrator!", error);
    //             }

    //         });
    //     }
    // })
}

function increaseValue() {
    if (!document.getElementById('forMaxPeople').value) {
        showError('bookError', 'Select date first')
    } else {
        var maxPeople = document.getElementById('forMaxPeople').value
        var value = parseInt(document.getElementById('npeople').value, 10);
        value = isNaN(value) ? 0 : value;
        if (value === parseInt(maxPeople)) {
            return 'exit'
        } else {
            value++;
            document.getElementById('npeople').value = value;
        }
    }
}

function decreaseValue() {
    var value = parseInt(document.getElementById('npeople').value, 10);
    value = isNaN(value) ? 0 : value;
    value < 1 ? value = 1 : '';
    value--;
    document.getElementById('npeople').value = value;
}

$(document).ready(function() {

    $("#but_upload").click(function() {

        var element = document.getElementById('file');
        if (element.value) {
            var image = element.files[0];
            var blob = image.slice(0, image.size);
            newFile = new File([blob], `${document.getElementById('accomID').value}`, { type: `${image.type}` });

            const formData = new FormData();
            formData.append("file", newFile);

            for (const pair of formData.entries()) {
                console.log(`${pair[0]}, ${pair[1]}`);
            }
            // fd.append('file', filesCheck);

            $.ajax({
                url: '/uploadImage',
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function(response) {

                    if (response != 0) {
                        document.getElementById('file').value = "";
                        showError('alertSuccess', 'File uploaded successfully.');
                        // Display image element
                    } else {
                        alert('File not uploaded');
                    }
                    ajaxSearch('all', 'Any')
                    setTimeout(function() {
                        $('#bookModal').modal('hide')
                    }, 200);
                },
                error: function(response) {

                    alert("Off... This is an Error and usually it doesn't happen, please contact the Administrator.")
                }
            });
        } else {
            alert("Please select a file.");
        }
    });
});

// document.addEventListener(
//     "click",
//     function(event) {
//         //  Close modal if user either clicks X button OR clicks outside the modal window.
//         if (
//             event.target.matches(".button-close-modal") || !event.target.matches(".bookModal") &&
//             !event.target.closest(".modal")
//         ) {
//             $('.modal').modal('hide')
//         }
//     },
//     false
// )

var closeAlertMap = document.getElementById('alertMap')
closeAlertMap.addEventListener('click', function() {
    document.getElementById("alertMap").classList.add('hidden')
    document.getElementById('alertMap').innerHTML = '<a href="#" class="close" id="closeAlertMap">×</a>'
})

var submitButton = document.getElementById('ajaxButton');
submitButton.addEventListener('click', function() {

    // Disable the submit button

    setTimeout(function() {
        submitButton.value = 'Search Again!'
    }, 1801)
    Counter(submitButton, 450)
    submitButton.setAttribute('disabled', 'disabled');

    function Counter(elem, delay) {
        var value = 4
        var interval;

        function decrement() {
            return value -= 1; // This 1 could be turned into a variable that allows
            // us to count by any value we want. I'll leave that
            // as a lesson for you !
        }

        function updateDisplay(value) {
            if (value < 1) {
                clearInterval(interval)
                submitButton.removeAttribute('disabled')
            }
            elem.value = 'Please wait...' + parseInt(value)
        }

        function run() {
            updateDisplay(decrement());
        }

        function start() {
            interval = window.setInterval(run, delay);
        }

        start();
    }



}, false);

window.onload = function() {
    loadTypes();
    if (sessionStorage.getItem('username')) {
        document.getElementById('loggedInAs').innerHTML = 'You are logged in as ' + sessionStorage.getItem('username')
        document.getElementById('navNotLogged').style.display = 'none'
        document.getElementById('navLogged').style.display = 'block'
        if (sessionStorage.getItem('access') === '1') {
            $('.uploadButton').css('display', 'block');
            $('#mainModal').append('<div class="modalAdmin"> Welcome Admin! Lalalal</div>')

        } else {
            $('.uploadButton').css('display', 'none')
        }
    }

};