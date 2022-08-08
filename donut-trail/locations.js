// JS for holding Donut Trail Latitude and Longitude Data that can be easily referenced
class place {
	constructor(name, lat, lon, open, close) {
		this.name = name;
		this.lat = lat;
		this.lon = lon;
		this.openingTime = open;
		this.closingTime = close;
	}
}

var trailLocations = [];
var startLocation = new place("Oxford Doughnut Shoppe", 39.50876264191781, -84.74992154457868, "06:00:00", "12:00:00");

        // all of these times assume a saturday opening/closing time
trailLocations.push(new place("Central Pastry Shop", 39.51533268953033, -84.39757382049866, "06:30:00", "17:30:00"));
trailLocations.push(new place("Holtman's Donuts", 39.31806369782496, -84.42760167456943, "07:00:00", "19:00:00"));
trailLocations.push(new place("Jupiter Coffee & Donuts", 39.33653580026617, -84.52867756662123, "05:00:00", "14:00:00"));
trailLocations.push(new place("Kelly's Bakery", 39.421852228264704, -84.59154292054684, "06:00:00", "12:00:00"));
trailLocations.push(new place("Martin's Donuts", 39.48209385487727, -84.45894533585928, "04:00:00", "13:00:00"));
trailLocations.push(new place("Milton's Donuts", 39.50092995829374, -84.36707420516241, "05:00:00", "15:00:00"));
trailLocations.push(new place("Mimi's Donuts & Bakery", 39.39991744501173, -84.63473772055798, "07:00:00", "12:00:00"));
trailLocations.push(new place("Ross Bakery", 39.42317930159787, -84.57716949726375, "04:00:00", "12:00:00"));
trailLocations.push(new place("Stan the Donut Man", 39.35480708463715, -84.3963514819554, "06:00:00", "12:00:00"));
trailLocations.push(new place("The Donut Dude", 39.372722206820825, -84.38253986660271, "06:00:00", "13:00:00"));
trailLocations.push(new place("The Donut Hole by Milton's", 39.35153939298842, -84.46071369730066, "06:00:00", "12:00:00"));
trailLocations.push(new place("The Donut Spot", 39.339799273536826, -84.5595736819631, "03:00:00", "12:00:00"));

/*
$(document).ready(function() {
	var date = "2020-02-27";

	optItinerary(date, startLocation, trailLocations);
});
*/
function submit() {
	event.preventDefault();
	var start = document.getElementById("startLoc").split(" ");
	startLocation = new place("Start", start[0], start[1], "", "");
	optItinerary(date, startLocation, trailLocations);
}

function generateTable(bestRoute) {
	let headers = ["Name", "Estimated Leg Time", "Estimated Current Time"];

        let table = document.getElementById("dataTable");
        let row = table.insertRow();

	// generate the table headeres row first
	for(var i in headers) {
		var th = document.createElement("th");
        	var label = document.createTextNode(headers[i]);
        	th.appendChild(label);
        	row.appendChild(th);
	}

	// then fill in the data underneath it
        for(var i in bestRoute) {
                let row = table.insertRow();
                var cell = row.insertCell();
                var label = document.createTextNode(bestRoute[i]["location"]["name"]);
                cell.appendChild(label);
                cell = row.insertCell();
                label = document.createTextNode(bestRoute[i]["leg"]);
                cell.appendChild(label);
                cell = row.insertCell();
                label = document.createTextNode(bestRoute[i]["leg"]);
                cell.appendChild(label);
        }
}

function optItinerary(date, origin, destinations) {

	//first take all destinations and make data for everything needed for the ajax
	var dests = []
        for (var i =0; i< destinations.length; i++) {
		dests.push({"name":destinations[i].name, "openingTime":date+"T"+destinations[i].openingTime, "closingTime":date+"T"+destinations[i].closingTime, "dwellTime":"00:05:00", "priority":1, "location":{"latitude": destinations[i].lat, "longitude": destinations[i].lon}});
	}
	var agent = {"name":"K", "shifts":[{"startTime":date+"T06:00:00", "startLocation":{"latitude": origin.lat, "longitude": origin.lon},"endTime":date+"T13:00:00","endLocation":{"latitude": origin.lat, "longitude": origin.lon}}]}

	let data = {"agents":[agent], "itineraryItems":dests, "roadnetwork":true};

	var settings = {
                url: "https://dev.virtualearth.net/REST/V1/Routes/OptimizeItinerary?key=AuxGEIC2ARkae9xioljiCYf2h2kGUoUN3RnliY-_pUleCkueIlPiIaAiNzjpgry5",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(data),
	}
        
	$.ajax(settings)
          .done(function(res) {
		  var instructions = res.resourceSets[0].resources[0].agentItineraries[0].instructions;
		  //console.log(instructions);
		  let bestRoute = cleanInstructions(date, origin, instructions);
		  generateTable(bestRoute);
		  var map = getMap(bestRoute);
		  displayMap(map);
        }).fail(function(err) {
                console.log("An error occurred: ");
                console.log(JSON.stringify(err));
        });
}

function cleanInstructions(date, origin, inst) {
	var locs = [];
	var legs = [];
	for(i in inst) {
		if(inst[i].instructionType == "LeaveFromStartPoint") {
			//if we're just starting
			locs.push({"name":origin.name, "lat":origin.lat, "lon":origin.lon});
			legs.push(new Date(date+"T00:00:00"));
		} else if(inst[i].instructionType == "VisitLocation") {
			//if we've reached a location
			locs.push({"name":inst[i].itineraryItem.name, "lat":inst[i].itineraryItem.location.latitude, "lon":inst[i].itineraryItem.location.longitude});
		} else if(inst[i].instructionType == "TravelBetweenLocations") {
			//if we're traveling from one location to another
			legs.push(inst[i].duration);
		} else {
			//we're at the end (no other instructionType values)
			locs.push({"name":origin.name, "lat":origin.lat, "lon":origin.lon});
		}
	}
	var locsAndLegs = [];
	for(i in locs) {
		locsAndLegs.push({"location": locs[i], "leg": legs[i]});
	}
	return locsAndLegs;
}

function splitTimes(time) {

}


function getMap(locations) {
	//create the lat,long query string
	url= "https://dev.virtualearth.net/REST/v1/Imagery/Map/Road/?"
	query = "";
	for (var i = 0; i < locations.length; i++) {
		var num = i + 1;
		query = query + "pp="+locations[i].location.lat+","+locations[i].location.lon+";;"+num+"&";
	}
	query = query + "dcl=1&key=AuxGEIC2ARkae9xioljiCYf2h2kGUoUN3RnliY-_pUleCkueIlPiIaAiNzjpgry5";
	return url+query;
}
function displayMap(map) {
	var imgMap = document.createElement("IMG");
        imgMap.src = map;
        var con = document.getElementById("imgCon");
	con.appendChild(imgMap);
}
