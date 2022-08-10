const btnScreen = document.getElementById("btnScreen");
const btnCamera = document.getElementById("btnCamera");
const btnScreenCam = document.getElementById("btnScreenCam");

btnScreen.onclick = function() {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { message: "initRecordScreen" });
    });

    window.close();
}

btnCamera.onclick = function() {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { message: "initRecordCamera" });
    });

    window.close();
}

btnScreenCam.onclick = function() {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { message: "initRecordScreenCam" });
    });

    window.close();
}