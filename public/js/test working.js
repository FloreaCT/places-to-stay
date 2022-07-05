// index.js - CLIENT SIDE code, runs in the browser

async function ajaxSearch(accommodation) {
    document.getElementById("ajaxButton").addEventListener('click', loadUser)
    var x = document.getElementById("productType").value
    alert(x)

    function loadUser() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', `http://localhost:3030/accommodation/${accommodation}`, true)
        xhr.onload = function() {
            if (this.status == 200) {
                console.log("You got here and you entered: " + accommodation);
                console.log(this.responseText);
                var user = JSON.parse(this.responseText)
                console.log(user);

            }
        }
        xhr.send();
    }
}

document.getElementById('ajaxButton').addEventListener('click', () => {
    // Read the product type from a text field
    const accommodation = document.getElementById('productType').value;
    ajaxSearch(accommodation);
});