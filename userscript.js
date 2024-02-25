// ==UserScript==
// @name         Better Moodle
// @namespace    http://tampermonkey.net/
// @version      2024-02-25
// @description  Better, Stronger
// @author       AINDUSTRIES
// @match        https://moodle.umons.ac.be/*
// @icon         https://moodle.umons.ac.be/pluginfile.php/1/core_admin/favicon/64x64/1706617662/UMONS%20FavIcon%20Blanc%20sur%20rouge.png
// @grant        none
// @downloadURL https://raw.githubusercontent.com/A-INDUSTRIES/BetterMoodle/main/userscript.js
// @updateURL https://raw.githubusercontent.com/A-INDUSTRIES/BetterMoodle/main/userscript.js
// ==/UserScript==

(function () {
  "use strict";
  login();
  let ordering = getOrdering();
  parseStyle(ordering);
  addUi(ordering);
  addStyleSheet();
  animate();
})();

function addStyleSheet() {
  let stylesheet = document.createElement("style");
  stylesheet.innerText = `
    .navbar.fixed-top {
        background: linear-gradient(90deg in hsl shorter hue, #a80039 20%, rgb(0,0,150) 100%) !important;
        background-size: 500% 100% !important;
    }
    .main-inner, .section {
        border-radius: 10px !important;
    }
    .coursebox, .tile, .sectionbutton, .tiles-top-button {
        border-radius: 5px !important;
    }
    .input {
        width: 40px;
        height: 30px;
        color: grey;
        border: None;
        text-align: right;
        background-color:transparent;
    }

    .input::-webkit-outer-spin-button,
    .input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    .box {
        display:flex;
        justify-content:right;
        position:relative;
        top:-20px;
        right: -5px;
        height:0;
    }

    .courses {
        display: flex;
        flex-direction:column;
    }
    
    .search {
        color:black;
        margin-bottom: 4px;
        border: solid 1px black;
        border-radius: 3px;
    }
    
    .searchedempty {
        border: None;
        margin-bottom:0px;
        padding: 0px 0px 0px 0px;
    }
    
    .searchedfound {
        border: solid 4px green;
        border-radius: 10px;
        margin-bottom: 4px;
        padding: 2px 2px 2px 2px;
    }`;
  document.head.appendChild(stylesheet);
}

function addUi() {
  let courses = document.querySelector(".courses");
  if (courses !== null) {
    const div = document.getElementById("carousel-item-main");

    let save = document.createElement("button");
    save.textContent = "BetterMoodle Save Config";
    save.addEventListener("click", saveOrdering);
    save.setAttribute("class", "dropdown-item");

    let del = document.createElement("button");
    del.textContent = "BetterMoodle Delete Config";
    del.addEventListener("click", deleteOrdering);
    del.setAttribute("class", "dropdown-item");

    div.insertBefore(save, div.getElementsByClassName("dropdown-divider")[1]);
    div.insertBefore(del, div.getElementsByClassName("dropdown-divider")[1]);

    courses.getElementsByClassName("coursebox").forEach((element) => {
      let index = parseInt(
        element.getAttribute("style").split(":")[1].replace(";", ""),
      );
      let input = document.createElement("input");
      let box = document.createElement("div");
      box.setAttribute("class", "box");
      input.setAttribute("type", "number");
      input.setAttribute("class", "input");
      input.value = index;
      box.appendChild(input);
      element.appendChild(box);
      input.addEventListener("change", () => {
        let index = parseInt(
          element.getAttribute("style").split(":")[1].replace(";", ""),
        );
        moveCourse(index, input.value);
      });
    });

    let list = document.getElementById("frontpage-course-list");
    let search = document.createElement("input");
    search.setAttribute("type", "text");
    search.setAttribute("class", "search");
    search.setAttribute("placeholder", "Recherchez un cours.");
    search.addEventListener("input", () => {
      searchCourse(search.value);
    });
    list.insertBefore(search, courses);

    let searched = document.createElement("div");
    searched.setAttribute("id", "searched");
    list.insertBefore(searched, courses);
  }
}

function animate() {
  let banner = document.getElementsByClassName("navbar")[0];
  let x = 0;
  let d = 10;
  setInterval(() => {
    if (x == 100) {
      d = -2;
    } else if (x == 0) {
      d = 2;
    }
    banner.style.setProperty("background-position", `${x}% 50%`, "important");
    x += d;
  }, 100);
}

function currentOrdering() {
  let ordering = {};
  let courses = document.querySelector(".courses");
  courses.getElementsByClassName("coursebox").forEach((element) => {
    ordering[element.getElementsByClassName("info")[0].innerText] =
      element.getAttribute("style") || "order:0;";
  });
  return ordering;
}

function deleteOrdering() {
  window.localStorage.removeItem("bettermoodleconfig");
  console.log("Deleted config");
}

function getOrdering() {
  return JSON.parse(window.localStorage.getItem("bettermoodleconfig") || "{}");
}

function getCourseByOrder(index) {
  let courses = document
    .querySelector(".courses")
    .getElementsByClassName("coursebox");
  for (let i = 0; i < courses.length; i++) {
    if (courses[i].getAttribute("style") == `order:${index};`) {
      return courses[i];
    }
  }
  return courses[0];
}

function login() {
  if (document.getElementsByClassName("login").length !== 0) {
    document.location.replace("https://moodle.umons.ac.be/login/index.php");
  }
}

function moveCourse(currentIndex, afterIndex) {
  let activeCourse = getCourseByOrder(currentIndex);
  let swappedCourse = getCourseByOrder(afterIndex);
  activeCourse.setAttribute("style", `order:${afterIndex};`);
  swappedCourse.setAttribute("style", `order:${currentIndex};`);
  swappedCourse.getElementsByClassName("input")[0].value = currentIndex;
  saveOrdering();
}

function parseStyle(ordering = {}) {
  let courses = document.querySelector(".courses");
  if (courses !== null) {
    let items = courses.getElementsByClassName("coursebox");
    if (Object.keys(ordering).length !== 0) {
      console.log("Parse with save");
      items.forEach((element) => {
        let courseName = element.getElementsByClassName("info")[0].innerText;
        element.setAttribute("style", `${ordering[courseName]}`);
      });
    } else {
      console.log("Parse default");
      for (let i = 0; i < items.length; i++) {
        items[i].setAttribute("style", `order:${i + 1};`);
      }
    }
    let bottomButton = document.getElementsByClassName(
      "paging paging-morelink",
    )[0];
    bottomButton.setAttribute("style", `order:${items.length + 1};`);
  }
}

function saveOrdering() {
  let ordering = currentOrdering();
  window.localStorage.setItem("bettermoodleconfig", JSON.stringify(ordering));
  console.log("Saved config");
}

function searchCourse(courseName) {
  let courses = document.querySelector(".courses");
  let elements = courses.getElementsByClassName("coursebox");
  let searched = document.getElementById("searched");
  if (courseName !== "") {
    elements.forEach((element) => {
      let name = element
        .getElementsByClassName("info")[0]
        .innerText.toLowerCase();
      if (name.includes(courseName.toLowerCase())) {
        searched.innerHTML = "";
        let copy = element.cloneNode(true);
        copy.setAttribute(
          "style",
          copy.getAttribute("style") + " margin-bottom:0px;",
        );
        searched.appendChild(copy);
        searched.setAttribute("class", "searchedfound");
      }
    });
  } else {
    searched.innerHTML = "";
    searched.setAttribute("class", "searchedempty");
  }
}
