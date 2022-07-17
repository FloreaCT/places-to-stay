/*
 *
 * login-register modal
 * Autor: Creative Tim
 * Web-autor: creative.tim
 * Web script: http://creative-tim.com
 * 
 */
function showRegisterForm() {
    $('.loginBox').fadeOut('fast', function() {
        $('.registerBox').fadeIn('fast');
        $('.login-footer').fadeOut('fast', function() {
            $('.register-footer').fadeIn('fast');
        });
        $('.modal-title').html('Register with');
    });
    $('.error').removeClass('alert alert-danger').html('');

}

function showLoginForm() {
    $('#loginModal .registerBox').fadeOut('fast', function() {
        $('.loginBox').fadeIn('fast');
        $('.register-footer').fadeOut('fast', function() {
            $('.login-footer').fadeIn('fast');
        });

        $('.modal-title').html('Login with');
    });
    $('.error').removeClass('alert alert-danger').html('');
}

function openLoginModal() {
    showLoginForm();
    setTimeout(function() {
        $('#loginModal').modal('show');
    }, 230);

}

function openRegisterModal() {
    showRegisterForm();
    setTimeout(function() {
        $('#loginModal').modal('show');
    }, 230);

}

function shakeModal() {
    $('#loginModal .modal-dialog').addClass('shake');
    setTimeout(function() {
        $('#loginModal .modal-dialog').removeClass('shake');
    }, 1000);
}

/* Credit card modal */

function showCreditCard() {
    $('#creditCard .registerBox').fadeOut('fast', function() {
        $('.creditCard').fadeIn('fast');
        $('.register-footer').fadeOut('fast', function() {
            $('.login-footer').fadeIn('fast');
        });
        $('.modal-title').html('Credit Card');
    });
    $('.error').removeClass('alert alert-danger').html('');
}

function openCreditCard() {
    showCreditCard();
    setTimeout(function() {
        $('#creditCard').on('show.bs.modal', function(e) {
            setTimeout(function() {
                $('.modal-backdrop').css('z-index', '1061');
            });
        });
        $('#creditCard').modal('show');
    }, 230);

}

function openLoginModal() {
    showLoginForm();
    setTimeout(function() {
        $('#loginModal').modal('show');
    }, 230);

}

async function openBookModal(accomID) {

    const accDetails = await fetch(`/accDetails/${accomID}`)

    const results = await accDetails.json();
    if (results) {
        showBookModal(results);
        setTimeout(function() {
            $('#bookModal').modal('show');
        }, 230);
        document.getElementById('maxPeople').setAttribute('class', 'hidden')
    } else {
        return false
    }

}


async function showBookModal(results) {

    const images = await fetch(`/images/${results.id}`)
    const imagePath = await images.json()
    active = 'active'

    var imagesForCarousel = ""
    var buttonsForCarousel = ""
    for (i in imagePath) {
        if (active === 'active') {
            imagesForCarousel += `<div class="carousel-item ${active}"><img src="${imagePath[i].imagePath}" class="d-block w-100 carouselBigImg" alt="${imagePath[i].imagePath}"> </div>`
            active = ""
        } else { imagesForCarousel += `<div class="carousel-item"><img src="${imagePath[i].imagePath}" class="d-block w-100 carouselBigImg" alt="${imagePath[i].imagePath}"> </div>` }
    }

    for (i in imagePath) {
        buttonsForCarousel += `<button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${1-i}" class="active" aria-current="true" aria-label="Slide ${i+1}"></button>`
    }

    $('#carouselInner').html(imagesForCarousel)
    $('#indicatorsBig').html(buttonsForCarousel)
    $('.bookModal').fadeIn('fast');
    $('.modal-title').html('Booking Modal');
    $('#accTitle').html(`<h2> ${results.name} </h2> County: ${results.county}, City: ${results.city}  `)
    $('#accDetails').html(`<h4> ${results.description}</h4>`)
    $('.error').removeClass('alert alert-danger').html('');

}