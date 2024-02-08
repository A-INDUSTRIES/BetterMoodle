// ==UserScript==
// @name         Better Moodle
// @namespace    http://tampermonkey.net/
// @version      2024-02-07
// @description  better stronger
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

})();

function addUi() {
    let courses = document.querySelector(".courses");
    const div = document.getElementById("frontpage-course-list");
    let save = document.createElement("button");
    save.textContent = "Save config";
    save.addEventListener("click", saveOrdering);
    let del = document.createElement("button");
    del.textContent = "Delete config";
    del.addEventListener("click", deleteOrdering);
    div.insertBefore(save, courses);
    div.insertBefore(del, courses);

    courses.getElementsByClassName("coursebox").forEach(element => {
        let input = document.createElement("input");
        input.setAttribute("type", "number");
        element.appendChild(input);
        input.addEventListener("change", () => {
            moveCourse(parseInt(element.getAttribute("style").split(":")[1].replace(";", "")), input.value);
        });
    });
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
            console.log(courses[i]);
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
}

function parseStyle(ordering={}) {
    let courses = document.querySelector(".courses");
        courses.setAttribute("style", "display: flex; flex-direction:column");
    if (Object.keys(ordering).length !== 0) {
        console.log("Parse with save");
        courses.getElementsByClassName("coursebox").forEach(element => {
            let courseName = element.getElementsByClassName("info")[0].innerText;
            element.setAttribute("style", `${ordering[courseName]}`);
        });
    } else {
        console.log("Parse default");
        courses.getElementsByClassName("coursebox").forEach(element => {
            element.setAttribute("style", 'order:0;');
        });
    }
}

function saveOrdering() {
    let ordering = currentOrdering();
    window.localStorage.setItem("bettermoodleconfig", JSON.stringify(ordering));
    console.log("Saved config");
}