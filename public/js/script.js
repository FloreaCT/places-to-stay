document.getElementById("ajaxButton").addEventListener("click", () => {
  const accommodation = document.getElementById("accommodationSearch").value;
  const accType = document.getElementById("typeOfAccommodation").value;
  ajaxSearch(accommodation, accType);
});

async function ajaxSearch(accommodation, accType) {
  try {
    if (!accommodation) {
      accommodation = "all";
    }
    // Send a request to our remote URL
    const response = await fetch(`/accommodation/${accommodation}/${accType}`);
    // Parse the JSON.
    const results = await response.json();
    layerGroup.clearLayers();

    bounds = [];

    if (Object.keys(results).length === 0) {
      showError("alertMap", "No accommodation found!");
    } else {
      function clickZoom(e) {
        latlng = e.target.getLatLng();
        map.setView([latlng.lat + 0.1, latlng.lng], 11);
        checkAvailability();
      }

      for (i in results) {
        const images = await fetch(`/images/${results[i].id}`);
        const imagePath = await images.json();
        var imagesForCarousel = "";
        var buttonsForCarousel = "";
        var active = "active";
        counter = 0;

        if (imagePath.length === 0) {
          console.log("Setting no photo");
          imagesForCarousel += `<div class="carousel-item active"><img src="/images/nophoto.jpg" class="d-block w-100 carouselImg" alt="/images/nophoto.jpg"> </div>`;
          buttonsForCarousel += `<button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${counter}" class="active" aria-current="true" aria-label="Slide ${
            s + 1
          }"></button>`;
        } else {
          for (j in imagePath) {
            if (active === "active") {
              imagesForCarousel += `<div class="carousel-item ${active}"><img src="${imagePath[j].imagePath}" class="d-block w-100 carouselImg" alt="${imagePath[j].imagePath}"> </div>`;
              active = "";
            } else if (imagePath[j].approved === 0) {
              continue;
            } else {
              imagesForCarousel += `<div class="carousel-item"><img src="${imagePath[j].imagePath}" class="d-block w-100 carouselImg" alt="${imagePath[j].imagePath}"> </div>`;
            }
          }

          for (s in imagePath) {
            if (imagePath[s].approved === 0) {
              continue;
            } else {
              buttonsForCarousel += `<button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${counter}" class="active" aria-current="true" aria-label="Slide ${
                s + 1
              }"></button>`;
              counter += 1;
            }
          }
        }
        if (results[i].type === accType || accType === "Any") {
          // results[i].type
          var mark = L.marker([results[i].latitude, results[i].longitude])
            .addTo(layerGroup)
            .bindPopup(
              '<div class="centerSmall"><b><h3>' +
                results[i].name +
                "</h3></b>" +
                "<br><h4>" +
                results[i].description +
                "</h4></div>" +
                '<input type="hidden" id="accID" name="accID" value="' +
                results[i].id +
                '"> <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel"><div class="carousel-indicators">' +
                buttonsForCarousel +
                '</div><div class="carousel-inner" >' +
                imagesForCarousel +
                '</div><button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span></button> <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span>  <span class="visually-hidden">Next</span></button> </div> <br><div class="centerSmall"><input class="btn btn-primary" type="text" value="Book" id="send_booking" onclick=openBookModal(' +
                results[i].id +
                ")></div> "
            )
            .on("click", clickZoom);
          bounds.push([results[i].latitude, results[i].longitude]);
        } else {
        }
      }

      map.fitBounds(bounds);
    }
  } catch (e) {
    alert(
      "This is ridiculous, we never got this error! Please contact the administrator!"
    );
    console.log(`There was an error: ${e}`);
  }
}

async function bookAccommodation() {
  const unauthorized = await fetch("/unauthorized");
  // Check if user is authenticated
  if (unauthorized.status === 401) {
    showError("loginError", "Sorry, you need to be logged in order to book.");
    openLoginModal();

    $("#loginModal").on("hidden.bs.modal", function () {
      loginError.style.display = "none";
    });
  } else {
    const accID = document.getElementById("accID").value;
    const begin_at = document.getElementById("datepicker").value;
    // Check if the system automatically updated the accommodation ID
    if (accID.length === 0) {
      showError(
        "bookError",
        "Invalid accommodation ID, please contact the administrator at admin@places-totstay.herokuapp.com"
      );
      // Check if the user selected a Date
    } else if (!begin_at) {
      showError("bookError", "Please select a date!");
    } else {
      // Check if the user selected number of people
      validate();
      openCreditCard();
      $("#creditCard").on("hidden.bs.modal", function () {
        $(".modal-backdrop").css("z-index", "1059");
      });
    }
  }
}

function validate() {
  if (!parseInt(document.getElementById("npeople").value)) {
    showError("bookError", "Please select the number of persons");
    throw "exit";
  } else if (parseInt(document.getElementById("npeople").value) <= 0) {
    showError(
      "bookError",
      `Cannot book for ${
        document.getElementById("npeople").value
      } people. Please adjust the number of people`
    );
    throw "exit";
  } else if (
    parseInt(document.getElementById("npeople").value) >
    parseInt(document.getElementById("forMaxPeople").value)
  ) {
    showError("bookError", "Please adjust the number of persons.");
    throw "exit";
  }
}

function loginFunction(e) {
  e.preventDefault();
  let loginObj = {
    loginUser: document.getElementById("loginUser").value,
    loginPassword: document.getElementById("loginPassword").value,
  };

  $.ajax({
    type: "POST",
    url: "/login",
    data: JSON.stringify(loginObj),
    contentType: "application/json; charset=utf-8",
    async: true,
    success: function (msg) {
      if (msg === false) {
        var element = document.getElementById("loginError");
        element.style.display = "block";
        element.innerHTML = "User or password incorrect!";
        shakeModal();
        $("#loginError")
          .delay(1000)
          .fadeOut(1000)
          .promise()
          .done(function () {
            element.innerHTML =
              '<a href="#" class="close" id="loginError">×</a>';
          });
      } else {
        let username = sessionStorage.setItem("username", msg.username);
        sessionStorage.setItem("access", msg.admin);
        sessionStorage.setItem("accID", msg.id);
        if (
          sessionStorage.getItem("access") === "1" ||
          sessionStorage.getItem("access") === "0"
        ) {
          $(".uploadButton").css("display", "block");
        } else {
          $(".uploadButton").css("display", "none");
        }
        document.getElementById("loggedInAs").innerHTML += username;
        var navLogged = document.getElementById("navLogged");
        showError("loginSuccess", "Login Succesful");
        setTimeout(function () {
          $("#loginModal").modal("hide");
        }, 1000);

        $("#navNotLogged")
          .fadeOut(2000)
          .promise()
          .done(function () {
            document.getElementById("loggedInAs").innerHTML =
              "You are logged in as " + sessionStorage.getItem("username");
            navLogged.style.display = "block";
          });
      }
    },
    error: function () {
      console.log("Error!!");
    },
  });
}

function logout() {
  sessionStorage.clear();

  var navNotLogged = document.getElementById("navNotLogged");
  $("#navLogged")
    .fadeOut(2000)
    .promise()
    .done(function () {
      navNotLogged.style.display = "block";
    });

  $(".uploadButton").css("display", "none");

  const url = "/logout";

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send();
}

function accDetails(id) {
  $.ajax({
    type: "POST",
    url: "/accDetails/" + id,
    dataType: "JSON",
    success: function (response) {},
  });
}

function register() {
  const registerUser = document.getElementById("registerUsername").value;

  if (registerUser.length <= 3) {
    shakeModal();
    showError("registerError", "Username must be at least 4 characters");
    return false;
  }

  const registerPassword = document.getElementById("registerPassword").value;

  if (registerPassword.length <= 3) {
    shakeModal();
    showError("registerError", "Password must be at least 4 characters");
    return false;
  }
  const passwordConfirmation = document.getElementById(
    "passwordConfirmation"
  ).value;

  if (!registerUser || !registerPassword || !passwordConfirmation) {
    shakeModal();
    showError("registerError", "Please enter all details");
    return false;
  } else if (registerPassword != passwordConfirmation) {
    shakeModal();
    showError("registerError", "Password does not match");
    return false;
  }

  let registerObj = {
    registerUser: document.getElementById("registerUsername").value,
    registerPassword: document.getElementById("registerPassword").value,
    passwordConfirmation: document.getElementById("passwordConfirmation").value,
  };

  $.ajax({
    type: "POST",
    url: "/register",
    data: JSON.stringify(registerObj),
    contentType: "application/json; charset=utf-8",
    async: true,
    success: function (msg) {
      if (msg) {
        var element = document.getElementById("registerSuccess");
        element.style.display = "block";
        element.innerHTML = "User created!";
        $("#registerSuccess")
          .delay(500)
          .fadeOut(1000)
          .promise()
          .done(function () {
            showLoginForm();
            $("#registerForm").find("input,textarea,select").val("").end();
          });
        // showError('registerError', 'User created!')
      } else {
        shakeModal();
        showError("registerError", "User already in the database.");
      }
    },
  });
}

async function loadTypes() {
  try {
    // Send a request to our remote URL
    const response = await fetch("/accommodation/");

    // Parse the JSON.
    const results = await response.json();

    types = new Set();

    for (i in results) {
      types.add(results[i].type);
    }

    var select = document.getElementById("typeOfAccommodation");

    types.forEach((type) => {
      var option = document.createElement("option");
      option.value = type;
      option.text = type;
      select.appendChild(option);
    });
  } catch (e) {
    alert(`There was an error: ${e}`);
  }
}

function checkAvailability() {
  const accID = document.getElementById("accID").value;
  const enabled_days = [];
  $.ajax({
    type: "POST",
    url: "/availability/" + accID,
    dataType: "JSON",
    success: function (response) {
      for (i in response) {
        if (response[i].availability <= 0) {
        } else {
          const time = response[i].thedate.toString();
          const year = "20" + time.slice(0, 2);
          const month = time.slice(2, 4);
          const day = time.slice(4, 6);
          const newDate = year + "-" + month + "-" + day;
          enabled_days.push(newDate);
        }
      }

      $("#datepicker").datepicker({
        dateFormat: "dd/mm/yy",
        inline: true,
        beforeShowDay: function (d) {
          var year = d.getFullYear(),
            month = ("0" + (d.getMonth() + 1)).slice(-2),
            day = ("0" + d.getDate()).slice(-2);

          var formatted = year + "-" + month + "-" + day;

          if ($.inArray(formatted, enabled_days) != -1) {
            return [true, "", "Available"];
          } else {
            return [false, "", "unAvailable"];
          }
        },
      });
    },
    error: function (xhr, status, error) {
      alert("We dont usually get this error: ", error);
    },
  });
}

function availableSpace() {
  const accID = document.getElementById("accID").value;
  const date = document.getElementById("datepicker").value.toString();
  const year = date.slice(8, 10);
  const month = date.slice(3, 5);
  const day = date.slice(0, 2);
  const newDate = year + month + day;

  $.ajax({
    type: "POST",
    url: "/availability/" + accID + "/" + newDate,
    dataType: "JSON",
    success: function (response) {
      document
        .getElementById("npeople")
        .setAttribute("max", response.availability);
      document.getElementById("npeople").setAttribute("type", "number");
      document
        .getElementById("forMaxPeople")
        .setAttribute("value", response.availability);
      document.getElementById("maxPeople").removeAttribute("class", "hidden");
      document.getElementById(
        "maxPeople"
      ).innerHTML = `Available spaces:  ${response.availability}`;
    },
  });
}

function cardChecker(response) {
  Stripe.setPublishableKey("pk_test_9D43kM3d2vEHZYzPzwAblYXl");

  var cardNumber, cardMonth, cardYear, cardCVC, cardHolder;

  // check for any empty inputs
  function findEmpty() {
    var emptyText = $("#form-container input").filter(function () {
      return $(this).val == null;
    });

    // add invalid class to empty inputs
    emptyText.prevObject.addClass("invalid");
  }

  // check card type on card number input blur
  $("#card-number").blur(function (event) {
    event.preventDefault();
    checkCardType();
  });

  // get each input value and use Stripe to determine whether they are valid
  var cardNumber = $("#card-number").val();
  var expMonth = $("#card-month").val();
  var expYear = $("#card-year").val();
  var cardCVC = $("#card-cvc").val();
  var cardHolder = $("#card-holder").val();
  event.preventDefault();

  // alert the user if any fields are missing
  if (!cardNumber || !cardCVC || !cardHolder || !expMonth || !expYear) {
    // console.log(cardNumber + cardCVC + cardHolder + cardMonth + cardYear);
    $("#form-errors").addClass("hidden");
    $("#card-success").addClass("hidden");
    $("#form-errors").removeClass("hidden");
    $("#card-error").text("Please complete all fields.");
    findEmpty();
  } else {
    const result = response;

    // alert the user if any fields are invalid
    if (result === "exp" || result === "number" || result === "cvv") {
      $("#form-errors").css("display", "block");
      $("#form-errors").removeClass("hidden");
      if (result === "number") {
        $("#card-error").text("Invalid credit card number.");
      } else if (result === "exp") {
        $("#card-error").text("Invalid expiration date.");
      } else if (result === "cvv") {
        $("#card-error").text("Invalid CVC code.");
      }
    } else {
      $("#card-success").removeClass("hidden");
      $("#form-errors").css("display", "none");
      setTimeout(function () {
        $("#card-success").addClass("hidden");
        $("#creditCard").modal("hide");
        $("#creditCard")
          .on("hidden.bs.modal", function (e) {
            $(this).find("input,textarea,select").val("").end();
          })
          .val("")
          .end();
      }, 2000);
      map.closePopup();

      return { cardNumber, cardHolder, cardYear, cardMonth, cardCVC };
    }
  }
}

function showError(elementId, text) {
  var element = document.getElementById(elementId);
  element.style.display = "block";
  element.innerHTML = text;
  $("#" + elementId)
    .delay(5000)
    .fadeOut(1200);
}

function payment() {
  let bookObj = {
    accID: document.getElementById("accID").value,
    begin_at: document.getElementById("datepicker").value,
    npeople: document.getElementById("npeople").value,
    accID: sessionStorage.getItem("accID"),
    username: sessionStorage.getItem("username"),
  };

  const creditCard = {
    cardHolder: document.getElementById("card-holder").value,
    cardNumber: document.getElementById("card-number").value,
    cardCVC: document.getElementById("card-cvc").value,
    expDetails:
      document.getElementById("card-month").value.toString() +
      "/" +
      document.getElementById("card-year").value.toString(),
  };

  $.ajax({
    type: "POST",
    url: "/checkCreditCard",
    data: JSON.stringify([creditCard, bookObj]),
    contentType: "application/json; charset=utf-8",
    async: true,
    success: function (response) {
      const cChecker = cardChecker(response);
      if (cChecker) {
        setTimeout(function () {
          $("#creditCard").modal("hide");
          $("#bookModal").modal("hide");
          map.setView([latit, longit], 16);
        }, 1000);

        document.getElementById("card-holder").value = "";
        document.getElementById("card-number").value = "";
        document.getElementById("card-cvc").value = "";
        document.getElementById("card-month").value = "";
      }
    },
    error: function (xhr, status, error) {
      alert(
        "An error occured during booking, your account was not debited. Please contact the Administrator!",
        error
      );
    },
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
  if (!document.getElementById("forMaxPeople").value) {
    showError("bookError", "Select date first");
  } else {
    var maxPeople = document.getElementById("forMaxPeople").value;
    var value = parseInt(document.getElementById("npeople").value, 10);
    value = isNaN(value) ? 0 : value;
    if (value === parseInt(maxPeople)) {
      return "exit";
    } else {
      value++;
      document.getElementById("npeople").value = value;
    }
  }
}

function decreaseValue() {
  var value = parseInt(document.getElementById("npeople").value, 10);
  value = isNaN(value) ? 0 : value;
  value < 1 ? (value = 1) : "";
  value--;
  document.getElementById("npeople").value = value;
}

function disableSearch() {
  // Disable the submit button

  setTimeout(function () {
    submitButton.value = "Search Again!";
  }, 1801);
  Counter(submitButton, 450);
  submitButton.setAttribute("disabled", "disabled");

  function Counter(elem, delay) {
    var value = 4;
    var interval;

    function decrement() {
      return (value -= 1); // This 1 could be turned into a variable that allows
      // us to count by any value we want. I'll leave that
      // as a lesson for you !
    }

    function updateDisplay(value) {
      if (value < 1) {
        clearInterval(interval);
        submitButton.removeAttribute("disabled");
      }
      elem.value = "Please wait..." + parseInt(value);
    }

    function run() {
      updateDisplay(decrement());
    }

    function start() {
      interval = window.setInterval(run, delay);
    }

    start();
  }
}

$(document).ready(function () {
  $("#but_upload").click(function () {
    var element = document.getElementById("file");
    if (element.value) {
      var image = element.files[0];
      var blob = image.slice(0, image.size);
      newFile = new File([blob], `${document.getElementById("accID").value}`, {
        type: `${image.type}`,
      });

      const formData = new FormData();
      formData.append("file", newFile);

      for (const pair of formData.entries()) {
        console.log(`${pair[0]}, ${pair[1]}`);
      }
      // fd.append('file', filesCheck);

      $.ajax({
        url: "/uploadImage",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
          if (response != 0) {
            document.getElementById("file").value = "";
            showError("alertSuccess", "File uploaded successfully.");
            // Display image element
          } else {
            alert("File not uploaded");
          }
          ajaxSearch("all", "Any");
          setTimeout(function () {
            $("#bookModal").modal("hide");
          }, 200);
        },
        error: function (response) {
          alert(
            "Off... This is an Error and usually it doesn't happen, please contact the Administrator."
          );
        },
      });
    } else {
      alert("Please select a file.");
    }
  });
});

var closeAlertMap = document.getElementById("alertMap");
closeAlertMap.addEventListener("click", function () {
  document.getElementById("alertMap").classList.add("hidden");
  document.getElementById("alertMap").innerHTML =
    '<a href="#" class="close" id="closeAlertMap">×</a>';
});

var submitButton = document.getElementById("ajaxButton");
submitButton.addEventListener(
  "click",
  function () {
    disableSearch();
  },
  false
);

window.onload = function () {
  loadTypes();
  if (sessionStorage.getItem("username")) {
    document.getElementById("loggedInAs").innerHTML =
      "You are logged in as " + sessionStorage.getItem("username");
    document.getElementById("navNotLogged").style.display = "none";
    document.getElementById("navLogged").style.display = "block";
    if (sessionStorage.getItem("access") === "1") {
      $(".uploadButton").css("display", "block");
    } else {
      $(".uploadButton").css("display", "none");
    }
  }
  // Enabling Enter key within search input
  $("#accommodationSearch").keyup(function (event) {
    if (event.keyCode === 13) {
      const accommodation = document.getElementById(
        "accommodationSearch"
      ).value;
      const accType = document.getElementById("typeOfAccommodation").value;
      ajaxSearch(accommodation, accType);
      disableSearch();
    }
  });
};
