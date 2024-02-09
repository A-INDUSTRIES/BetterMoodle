// ==UserScript==
// @name         Better Moodle
// @namespace    http://tampermonkey.net/
// @version      2024-02-07
// @description  Better, Stronger
// @author       ME
// @match        https://moodle.umons.ac.be/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ac.be
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let ordering = getOrdering();
    parseStyle(ordering);
    addUi(ordering);
    addStyleSheet();
})();

function addStyleSheet() {
    let stylesheet = document.createElement("style");
    stylesheet.innerText = `
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
        color:red;
        margin-bottom: 4px;;
    }`;
    let head = document.getElementsByTagName("head")[0];
    head.appendChild(stylesheet);
}

function addUi() {
    let courses = document.querySelector(".courses");
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

    courses.getElementsByClassName("coursebox").forEach(element => {
        let index = parseInt(element.getAttribute("style").split(":")[1].replace(";", ""));
        let input = document.createElement("input");
        let box = document.createElement("div");
        box.setAttribute("class", "box")
        input.setAttribute("type", "number");
        input.setAttribute("class", "input");
        input.value = index;
        box.appendChild(input);
        element.appendChild(box);
        input.addEventListener("change", () => {
            let index = parseInt(element.getAttribute("style").split(":")[1].replace(";", ""));
            moveCourse(index, input.value);
        });
    });

    let list = document.getElementById("frontpage-course-list");
    let search = document.createElement("input");
    search.setAttribute("type", "text");
    search.setAttribute("class", "search");
    search.setAttribute("placeholder", "Recherhez un cours.");
    search.addEventListener("input", () => {searchCourse(search.value)});
    list.insertBefore(search, courses);
}

function currentOrdering() {
    let ordering = {};
    let courses = document.querySelector(".courses");
    courses.getElementsByClassName("coursebox").forEach(element => {
        ordering[element.getElementsByClassName("info")[0].innerText] = element.getAttribute("style") || "order:0;";
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
    let courses = document.querySelector(".courses").getElementsByClassName("coursebox");
    for (let i=0; i < courses.length; i++) {
        if (courses[i].getAttribute("style") == `order:${index};`) {
            return courses[i];
        }
    }
    return courses[0];
}

function moveCourse(currentIndex, afterIndex) {
    let activeCourse = getCourseByOrder(currentIndex);
    let swappedCourse = getCourseByOrder(afterIndex);
    activeCourse.setAttribute("style", `order:${afterIndex};`);
    swappedCourse.setAttribute("style", `order:${currentIndex};`);
    swappedCourse.getElementsByClassName("input")[0].value = currentIndex;
    saveOrdering();
}

function parseStyle(ordering={}) {
    let courses = document.querySelector(".courses");
    let items = courses.getElementsByClassName("coursebox");
    if (Object.keys(ordering).length !== 0) {
        console.log("Parse with save");
        items.forEach(element => {
            let courseName = element.getElementsByClassName("info")[0].innerText;
            element.setAttribute("style", `${ordering[courseName]}`);
        });
    } else {
        console.log("Parse default");
        for (let i=0; i<items.length; i++) {
            items[i].setAttribute("style", `order:${i+1};`);
        }
    }
    let bottomButton = document.getElementsByClassName("paging paging-morelink")[0];
    bottomButton.setAttribute("style", `order:${items.length+1};`);
}

function saveOrdering() {
    let ordering = currentOrdering();
    window.localStorage.setItem("bettermoodleconfig", JSON.stringify(ordering));
    console.log("Saved config");
}

function searchCourse(courseName) {
    console.log(courseName);
}