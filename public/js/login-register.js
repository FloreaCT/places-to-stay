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


function showBookModal(results) {

    $('.bookModal').fadeIn('fast');
    $('.modal-title').html('Booking Modal');
    $('#accTitle').html(`<h2> ${results.name} </h2> Location: ${results.city}   `)
    $('#accDetails').html(`<h4> ${results.description}</h4>`)
    $('.error').removeClass('alert alert-danger').html('');

}