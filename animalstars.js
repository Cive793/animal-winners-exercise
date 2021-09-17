"use strict";

window.addEventListener("DOMContentLoaded", start);

let allAnimals = [];

const settings = {
  filter: null,
  sortBy: null,
  sortDir: "asc",
};

// The prototype for all animals:
const Animal = {
  name: "",
  desc: "-unknown animal-",
  type: "",
  age: 0,
  star: false,
  winner: false,
};

function start() {
  console.log("ready");

  getButtonChoice();
  loadJSON();
}

function getButtonChoice() {
  document.querySelectorAll(".filter").forEach((button) => button.addEventListener("click", selectFilter));
  document.querySelectorAll('[data-action="sort"]').forEach((button) => button.addEventListener("click", selectSort));
}

async function loadJSON() {
  const response = await fetch("animals.json");
  const jsonData = await response.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
  allAnimals = jsonData.map(preapareObject);

  buildList();
}

function preapareObject(jsonObject) {
  const animal = Object.create(Animal);

  const texts = jsonObject.fullname.split(" ");
  animal.name = texts[0];
  animal.desc = texts[2];
  animal.type = texts[3];
  animal.age = jsonObject.age;

  return animal;
}

function buildList() {
  const currentList = allAnimals; // FUTURE: Filter and sort currentList before displaying

  displayList(currentList);
}

function selectFilter(event) {
  const filter = event.target.dataset.filter;
  filterList(filter);
}

function selectSort(event) {
  const sort = event.target.dataset.sort;
  sortList(sort);
  console.log(sort);
}

function filterList(animalType) {
  let filteredList = allAnimals;

  if (animalType === "cat") {
    //create filtered list of only cats
    filteredList = allAnimals.filter(onlyCats);
  } else if (animalType === "dog") {
    //create filtered list of only dogs
    filteredList = allAnimals.filter(onlyDogs);
  }

  displayList(filteredList);
}

function onlyCats(animal) {
  if (animal.type === "cat") {
    return true;
  } else {
    return false;
  }
  // return animal.type === "cat" - gives same result
}

function onlyDogs(animal) {
  if (animal.type === "dog") {
    return true;
  } else {
    return false;
  }
  // return animal.type === "cat" - gives same result
}

function all(animal) {
  if (animal.type === "") {
    return true;
  }
}

function sortList(sortChoice) {
  let sortedList = allAnimals;

  if (sortChoice === "name") {
    sortedList = sortedList.sort(sortName);
  } else if (sortChoice === "type") {
    sortedList = sortedList.sort(sortType);
  } else if (sortChoice === "desc") {
    sortedList = sortedList.sort(sortDescription);
  } else if (sortChoice === "age") {
    sortedList = sortedList.sort(sortAge);
  }

  displayList(sortedList);
}

function sortName(a, b) {
  if (a.name < b.name) {
    return -1;
  } else {
    return 1;
  }
}

function sortType(a, b) {
  if (a.type < b.type) {
    return -1;
  } else {
    return 1;
  }
}

function sortDescription(a, b) {
  if (a.desc < b.desc) {
    return -1;
  } else {
    return 1;
  }
}

function sortAge(a, b) {
  if (a.age < b.age) {
    return -1;
  } else {
    return 1;
  }
}

function displayList(animals) {
  // clear the display
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  animals.forEach(displayAnimal);
}

function displayAnimal(animal) {
  // create clone
  const clone = document.querySelector("template#animal").content.cloneNode(true);

  // set clone data

  //stars

  if (animal.star === true) {
    clone.querySelector('[data-field="star"]').textContent = "⭐";
  } else {
    clone.querySelector('[data-field="star"]').textContent = "☆";
  }

  clone.querySelector("[data-field=name]").textContent = animal.name;
  clone.querySelector("[data-field=desc]").textContent = animal.desc;
  clone.querySelector("[data-field=type]").textContent = animal.type;
  clone.querySelector("[data-field=age]").textContent = animal.age;

  // TODO: Add event listener to click on star
  clone.querySelector('[data-field="star"]').addEventListener("click", toggleStar);

  function toggleStar() {
    if (animal.star === true) {
      animal.star = false;
    } else {
      animal.star = true;
    }

    buildList();
  }

  //winners

  clone.querySelector("[data-field=winner]").dataset.winner = animal.winner;
  clone.querySelector('[data-field="winner"]').addEventListener("click", toggleWinner);

  function toggleWinner() {
    if (animal.winner === true) {
      animal.winner = false;
    } else {
      tryToMakeWinner(animal);
    }

    buildList();
  }

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}

function tryToMakeWinner(selectedAnimal) {
  const winners = allAnimals.filter((animal) => animal.winner);

  const numberOfWinners = winners.length;
  const other = winners.filter((animal) => animal.type === selectedAnimal.type).shift();

  //if there is another of the same type
  if (other !== undefined) {
    console.log("There can be only one winner of each type");
    removeOther(other);
  } else if (numberOfWinners >= 2) {
    console.log("There can only be 2 winners");
    removeAorB(winners[0], winners[1]);
  } else {
    makeWinner(selectedAnimal);
  }

  function removeOther(other) {
    //ask the user to ignore, or remove "other"

    document.querySelector("#removeOther").classList.remove("hidden");
    document.querySelector("#removeOther .closeButton").addEventListener("click", closeDialog);
    document.querySelector("#removeOtherButton").addEventListener("click", clickRemoveOther);

    //if ignore - do nothing
    function closeDialog() {
      document.querySelector("#removeOther").classList.add("hidden");
      document.querySelector("#removeOther .closeButton").removeEventListener("click", closeDialog);
      document.querySelector("#removeOtherButton").removeEventListener("click", clickRemoveOther);
    }

    //if remove other:
    function clickRemoveOther() {
      removeWinner(other);
      makeWinner(selectedAnimal);
      buildList();
      closeDialog();
    }
  }

  function removeAorB(winnerA, winnerB) {
    //ask the user to ingore or remove A or B

    //if ignore - do nothing
    //if removeA:
    removeWinner(winnerA);
    makeWinner(selectedAnimal);
  }

  function removeWinner(winnerAnimal) {
    winnerAnimal.winner = false;
  }

  makeWinner(selectedAnimal);

  function makeWinner(animal) {
    animal.winner = true;
  }
}
