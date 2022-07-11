/* Data which will be sent to server */
function bookAccommodation() {


    let bookObj = {
        accID: document.getElementById("accID").value,
        begin_at: document.getElementById("begin_at").value,
        npeople: document.getElementById("npeople").value
    }

    const url = "/book"

    let xhr = new XMLHttpRequest()

    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
    xhr.send(JSON.stringify(bookObj));

    xhr.onload = function() {
        if (xhr.status === 201) {
            console.log("Post successfully created!")
        }
    }
}