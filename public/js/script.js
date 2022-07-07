async function ajaxSearch(accommodation, accType) {
    try {
        // Send a request to our remote URL
        const response = await fetch(`http://localhost:3030/accommodation/${accommodation}/${accType}`);
        // Parse the JSON.
        const results = await response.json();

        layerGroup.clearLayers();

        bounds = []
        if (results.length === 0) {
            alert("No accommodation found")
        } else {

            for (i in results) {
                if (results[i].type === accType || accType === "Any") {
                    var mark = L.marker([results[i].latitude, results[i].longitude]).addTo(layerGroup)
                        .bindPopup('<div class="centerSmall"><b><h3>' + results[i].name + '</h3></b>' + '<br><h4>' + results[i].description + '</h4></div>' + '<form name="bookingForm"><input type="hidden" id="accID" name="accID" value="' + results[i].id + '"><input type="hidden" id="forMaxPeople" value=""><div class="centerSmall"><input class="form-control" type="text" name="datepicker" id="datepicker"" placeholder="Pick a date" autocomplete="off" onchange=availableSpace() required><input type="hidden" class="form-control" id="npeople" name="npeople" placeholder="Number of persons" required> </div><div type="hidden" class="centerSmall" id="maxPeople" style="font-size: 2rem; color: green"></div><div class="centerSmall"><input class="btn btn-primary" type="text" value="Book" id="send_booking" onclick=bookAccommodation()></div></form>').on('click', checkAvailability);
                    bounds.push([results[i].latitude, results[i].longitude])
                } else {
                    alert("No accommodation found")
                }
            }
        }

        map.fitBounds(bounds);

    } catch (e) {
        console.log(`There was an error: ${e}`);
    }
}

document.getElementById('ajaxButton').addEventListener('click', () => {
    // Read the product type from a text field
    const accommodation = document.getElementById('accommodationSearch').value;
    const accType = document.getElementById("typeOfAccommodation").value
    ajaxSearch(accommodation, accType);
});

async function loadTypes() {
    try {
        // Send a request to our remote URL
        const response = await fetch('http://localhost:3030/accommodation/');

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

window.onload = function() {
    loadTypes();
};