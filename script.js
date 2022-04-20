"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class Workout {
  date = new Date().toDateString();
  id = Math.round(Math.random() * 100);
  constructor(coords, distance, duration) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
  }
  _setDescription() {}
}

class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.Calcpace();
  }

  Calcpace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.CalcSpeed();
  }
  CalcSpeed() {
    this.speed = this.distance / this.duration;
    return this.speed;
  }
}

class App {
  #map;
  #mapEvent; // classes way of global properties which are private
  #workouts = [];
  #mapZoom = 13;

  constructor() {
    // // Get user position
    // this._getPosition();
    // Get data from storage
    this._dataFetcher();
    this._getPosition(); // so it will lauched as soon as the object is called/made
    form.addEventListener("submit", this._newWorkout.bind(this)); // without bind "this" will point to the form and not the object !! ie bind
    inputType.addEventListener("change", this._toggleElevationField);
    containerWorkouts.addEventListener("click", this._navigator.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this), // as it is being called as a regular function
        () => {
          alert("Unable to get your current location");
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];
    // console.log(`https://www.google.com/maps/@${longitude},${latitude}`);

    // map from leaflet ap
    this.#map = L.map("map").setView(coords, this.#mapZoom);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker(coords) // L.maker takes an array
      .addTo(this.#map)
      .bindPopup("Your current postion")
      // .bindPopup( L.popup({ maxWidth:250, minWidth:100, autoClose: false, closeOnClick: false, clasName: `${workout.type}-pop`}))
      .openPopup();
    this.#map.on("click", this._showForm.bind(this));

    this.#workouts.forEach((work) => {
      this._loadMap(work);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
  }

  _newWorkout(e) {
    const validation = (
      ...inputs // rest parameter this will return an array and the every thing will iter over elemand run the cject
    ) => inputs.every((inp) => Number.isFinite(inp));

    const positive = (...inputs) => inputs.every((inp) => inp > 0);

    // what is an object and how to create one?

    e.preventDefault();
    // clear inputs

    // Get data from the user
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // type of workout
    if (type === "running") {
      const casdence = +inputCadence.value;
      // Check if data is valid with a guard clause
      if (
        !validation(distance, duration, casdence) ||
        !positive(distance, duration, casdence)
      )
        return alert("Please insert a valid value");

      //  create an object and push it to the workout array! since we already have a running class

      workout = new Running([lat, lng], distance, duration, casdence);
    }

    if (type === "cycling") {
      const elevation = +inputElevation.value;
      if (
        !validation(distance, duration, elevation) ||
        !positive(distance, duration)
      )
        return alert("Please insert a valid number");
      workout = new Cycling(distance, duration, [lat, lng], elevation);
    }

    // add the object to the array
    this.#workouts.push(workout);

    // render workout on map
    this._sideBarRender(workout); // who is calling this function ??
    this.hideForm();
    this._navigator();
    this._localStorage();

    // store dat
    // add data to form / save and render
    // add new objecrs to workout array
    // render workout on map as a marker
    // const {lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          clasName: `${workout.type}-pop`,
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.type} ${
          workout.date
        }  `
      )
      .openPopup();
    // console.log(mapEvent.latlng)
  }
  // navigating the map to the selected form input area: match the element to the object

  _toggleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  //render workout on the side bars
  _sideBarRender(workout) {
    let theHtml = `<li class="workout workout--${workout.type}" data-id= ${
      workout.id
    }>
        <h2 class="workout__title">Running on April 14</h2>

        <div class="workout__details">
        <span class="workout__icon"> ${
          workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
        }  </span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
        </div>

        <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
        </div>                
        `;
    if (workout.type === "running")
      theHtml += `
        <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace}</span>
        <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
        </div>
    </li>`;

    if (workout.type === "cycling")
      theHtml += `<div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.Speed}</span>
        <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevation}</span>
        <span class="workout__unit">m</span>
        </div>`;
    form.insertAdjacentHTML("afterend", theHtml);
  }

  _navigator(e) {
    if (!this.#map) return;
    const workoutEl = e.target.closest(".workout");
    console.log(workoutEl);
    if (!workoutEl) return;
    const workout = this.#workouts.find(
      (work) => work.id === workoutEl.dataset.id
    );
    console.log("This is coming from the workout " + workout);
    let sample = this.#workouts.find((work) => work.id);
    console.log(sample),
      this.#map.setView(workout.coords, this.#mapZoom, {
        Animation: true,
        pan: {
          duration: 1,
        },
      });
  }

  //hiding the form after submission
  hideForm() {
    // first empty its inputs
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        "";
    form.classList.add("hidden");
  }

  // rendering onto the side bar
  _renderWorkout(workout) {
    this.sideBarRender(data);
  }

  //local storage
  _localStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }

  // get data from the local server
  _dataFetcher() {
    const data = JSON.parse(localStorage.getItem("workouts"));

    if (!data) return;

    this.#workouts = data; // ?

    this.#workouts.forEach((work) => {
      this._sideBarRender(work);
      //this._loadMap(work)
    });
    console.log(data);
  }
}

let app = new App();

//as soon as we instan the obj every thing in the constructor will be triggered

// let runner = new Running( [12,34], 120, 10, 3)
// console.log(runner)
// console.log(runner.distance)
// console.log(runner.duration)
// console.log(runner.Calcpace() )

// what is a new workout < it will require named, date , id , position, ......... and rendering the form and rendering input on the map

// const newWorkOut1 = new Workout( [12,34], 120, 10, 3)
// console.log(newWorkOut1)

// //render workout on map
// //  app._newWorkout( 'click',  newWorkOut1.coords)
// console.log(newWorkOut1.coords)

// //adding workout in form
// // get data  from the form
// const val = inputDistance.addEventListener.value
// console.log(val)

// form.addEventListener('submit', function(){

// }  // without bind "this" will point to the form and not the object !! ie bind

// form.addEventListener('submit'),

// inputType.addEventListener('change', function(){
//     inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
//     inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
// })

//0000000000000000000000000000000000000000000000000
// Geolocation
// if(navigator.geolocation)
// {
//     navigator.geolocation.getCurrentPosition( (position) =>
// {
//     const {latitude} = position.coords
//     const {longitude} = position.coords
//     const coords = [latitude, longitude] //
//     console.log(`https://www.google.com/maps/@${longitude},${latitude}`);

//     // map from leaflet api

//      map = L.map('map').setView(coords, 13); //

//     L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
//         attribution:
//          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//     }).addTo(map);

//     L.marker(coords) // L.maker takes an array
//         .addTo(map)
//         .bindPopup('Your current location.<br> Easy to find ya.')
//         .openPopup();
//         map.on('click', (mapE) => {
//             mapEvent = mapE
//             form.classList.remove('hidden')
//         })
//     },

//     () => {
//         alert("Unable to get your current location")
//     } )
// }
// getting the form input data: event listener
// form.addEventListener('submit', function(e){
//     e.preventDefault();
//     // clear inputs
//     inputDistance.value =inputCadence.value=  inputDuration.value= inputElevation.value = '';

//         const {lat, lng } = mapEvent.latlng;
//          L.marker([lat, lng])
//         .addTo(map)
//         .bindPopup('Your current location.<br> Easy to find ya.')
//         .openPopup();
//         console.log(mapEvent.latlng)
// },)

// by calling both them one of them will be toggeled to hidden
// inputType.addEventListener('change', function(){
//     inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
//     inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
// })
