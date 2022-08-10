let mediaRecorder = null;

chrome.runtime.onMessage.addListener((msg) => {
    switch(msg.message) {
        case "initRecordScreen":
            onRecordScreen();
            break;
        case "initRecordCamera":
            onRecordCamera();
            break;
        case "initRecordScreenCam":
            onRecordScreenCam();
            break;
    }
});

function findElement(pattern) {
    return document.querySelector("rsd-shadow").shadowRoot.querySelector(pattern);
}

async function onRecordScreen() {
    try {
        let screenRecord = null;

        navigator.mediaDevices.getUserMedia({audio: true, video: true}).then(async function () {
            //append
            const shadow = appendContentner();
        
            //get devices
            const devicesInfo = await getDevices();
        
            //render
            render(shadow, devicesInfo);
    
            //disable button
            const btnPause = findElement("#rsd-button-pauserecord");
            const buttonStop = findElement("#rsd-button-stoprecord");
            const btnMute = findElement("#rsd-button-mutemic");
            const btnOnOffCam = findElement("#rsd-button-onoffcam");
    
            btnPause.disabled = true;
            buttonStop.disabled = true;
            btnMute.disabled = true;
            btnOnOffCam.disabled = true;
        
            //show screen
            const buttonStart = findElement("#rsd-button-startrecord");
            if (buttonStart) {
                buttonStart.addEventListener("click", async function() {
                    try {
                        buttonStart.disabled = true;
                        btnPause.disabled = false;
                        buttonStop.disabled = false;
                        btnMute.disabled = false;
                        
                        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                        screenRecord = findElement("#rsd-camera");
                        if (screenRecord) {
                            screenRecord.srcObject = screenStream;
                        }
    
                        //pause record
                        btnPause.onclick = onPauseRecord;
    
                        //mute mic
                        btnMute.onclick = OnOffMic;
    
                        //listen stop sharing
                        screenStream.oninactive = onStopRecord;
                        buttonStop.onclick = onStopRecord;
    
                        //record stream
                        onRecord(screenStream, shadow);
                    } catch (error) {
                        console.log("Something media wrong");
                    }
                });
            }
        });
    } catch (error) {
        console.log("Something wrong: ", error);
    }
}

async function onRecordCamera() {
    try {
        let cameraDOM = null;

        navigator.mediaDevices.getUserMedia({audio: true, video: true}).then(async function () {
            //append
            const shadow = appendContentner();
        
            //get devices
            const devicesInfo = await getDevices();
        
            //render
            render(shadow, devicesInfo)

            //chose audio/camera input
            const audioInputSelect = findElement("#rsd-audio-devices");
            const videoInputSelect = findElement("#rsd-video-devices");
            console.log(audioInputSelect.value);

            //disable button
            const btnPause = findElement("#rsd-button-pauserecord");
            const buttonStop = findElement("#rsd-button-stoprecord");
            const btnMute = findElement("#rsd-button-mutemic");
            const btnOnOffCam = findElement("#rsd-button-onoffcam");

            btnPause.disabled = true;
            buttonStop.disabled = true;
            btnMute.disabled = true;
            btnOnOffCam.disabled = true;

            //show camera
            const buttonStart = findElement("#rsd-button-startrecord");
            if (buttonStart) {
                buttonStart.addEventListener("click", async function() {
                    try {
                        buttonStart.disabled = true;
                        btnPause.disabled = false;
                        buttonStop.disabled = false;
                        btnMute.disabled = false;
                        btnOnOffCam.disabled = false;

                        if (devicesInfo.videoInput.length > 0) {
                            const cameraOpts =  {
                                audio: false,
                                video: {
                                    deviceId: videoInputSelect.value,
                                    width: { min: 100, max: 1920, ideal: 1280 },
                                    height: { min: 100, max: 1080, ideal: 720 },
                                    frameRate: { ideal: 30 }
                                }
                            }
                            const stream = await navigator.mediaDevices.getUserMedia(cameraOpts);
                            cameraDOM = findElement('#rsd-camera');
                            if (cameraDOM) {
                                cameraDOM.srcObject = stream;
                            }

                            //pause record
                            btnPause.onclick = onPauseRecord;

                            //mute mic
                            btnMute.onclick = OnOffMic;

                            //turn on/off cam
                            btnOnOffCam.onclick = OnOffCam;
                
                            //listen stop sharing
                            buttonStop.onclick = onStopRecord;

                            //audio stream
                            const audioStreamOpts = {
                                mineType: "video/webm;codecs=vp8,opus",
                                //mineType: "video/mp4"
                                audio: {
                                    deviceId: audioInputSelect.value
                                }
                            }
                            console.log(audioStreamOpts);

                            const audioStream = await navigator.mediaDevices.getUserMedia(audioStreamOpts);
                            for (const track of audioStream.getTracks()) {
                                stream.addTrack(track);
                            }
                            //record stream
                            onRecord(stream, shadow);
                        }
                    } catch (error) {
                        console.log("Something media wrong", error);
                    }
                });
            }
        });
    } catch (error) {
        console.log("Something wrong: ", error);
    }
}

async function onRecordScreenCam() {
    try {
        let cameraDOM = null;
        let screenDOM = null;

        navigator.mediaDevices.getUserMedia({audio: true, video: true}).then(async function () {
            //append
            const shadow = appendContentner();
        
            //get devices
            const devicesInfo = await getDevices();
        
            //render update devices list
            render(shadow, devicesInfo);
    
            //chose audio/camera input
            const audioInputSelect = findElement("#rsd-audio-devices");
            const videoInputSelect = findElement("#rsd-video-devices");
            console.log(audioInputSelect.value);
    
            //disable button
            const btnPause = findElement("#rsd-button-pauserecord");
            const buttonStop = findElement("#rsd-button-stoprecord");
            const btnMute = findElement("#rsd-button-mutemic");
            const btnOnOffCam = findElement("#rsd-button-onoffcam");
    
            btnPause.disabled = true;
            buttonStop.disabled = true;
            btnMute.disabled = true;
            btnOnOffCam.disabled = true;
        
            const buttonStart = findElement("#rsd-button-startrecord");
            if (buttonStart) {
                buttonStart.addEventListener("click", async function() {
                    try {
                        buttonStart.disabled = true;
                        btnPause.disabled = false;
                        buttonStop.disabled = false;
                        btnMute.disabled = false;
                        btnOnOffCam.disabled = false;
    
                        //show screen
                        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    
                        await navigator.mediaDevices.getUserMedia({
                            audio: {deviceId: audioInputSelect.value},
                            video: false
                        }).then(async function(audioStream) {
                            const stream = new MediaStream();
                            screenStream.getVideoTracks().forEach(function(videoTrack) {
                                stream.addTrack(videoTrack);
                            });
                            
                            var context = new AudioContext();
                            var audioDestinationNode = context.createMediaStreamDestination();
                            if (screenStream && screenStream.getAudioTracks().length > 0) {
                                //get the audio from the screen stream
                                const systemSource = context.createMediaStreamSource(screenStream);
                    
                                //set it's volume (from 0.1 to 1.0)
                                const systemGain = context.createGain();
                                systemGain.gain.value = 1.0;
                    
                                //add it to the destination
                                systemSource.connect(systemGain).connect(audioDestinationNode);
                            }
                    
                            //check to see if we have a microphone stream and only then add it
                            if (audioStream && audioStream.getAudioTracks().length > 0) {
                                //get the audio from the microphone stream
                                const micSource = context.createMediaStreamSource(audioStream);
                    
                                //set it's volume
                                const micGain = context.createGain();
                                micGain.gain.value = 1.0;
                    
                                //add it to the destination
                                micSource.connect(micGain).connect(audioDestinationNode);
                            }
                    
                            //add the combined audio stream
                            audioDestinationNode.stream.getAudioTracks().forEach(function(audioTrack) {
                                stream.addTrack(audioTrack);
                            });
    
                            screenDOM = findElement("#rsd-screen");
                            if (screenDOM) {
                                screenDOM.srcObject = stream;
                                screenDOM.muted = true;
                                screenDOM.style.visibility = "hidden";
                            }
    
                            //show camera
                            if (devicesInfo.videoInput.length > 0) {
                                const cameraOpts =  {
                                    audio: false,
                                    video: {
                                        deviceId: videoInputSelect.value,
                                        width: { min: 100, max: 1920, ideal: 1280 },
                                        height: { min: 100, max: 1080, ideal: 720 },
                                        frameRate: { ideal: 30 }
                                    }
                                }

                                const cameraStream = await navigator.mediaDevices.getUserMedia(cameraOpts);
                                cameraDOM = findElement('#rsd-camera');
                                if (cameraDOM) {
                                    cameraDOM.srcObject = cameraStream;
                                    cameraDOM.style.visibility = "hidden";
                                }
                            }
                            
                            //pause record
                            btnPause.onclick = onPauseRecord;
    
                            //mute mic
                            btnMute.onclick = OnOffMic;
    
                            //turn on/off cam
                            btnOnOffCam.onclick = OnOffCam;
    
                            //listen stop sharing
                            screenStream.oninactive = onStopRecord;
                            buttonStop.onclick = onStopRecord;
    
                            //merged into 1 video via canvas
                            const canvasDOM = findElement("#rsd-canvas");
                            if (canvasDOM) {
                                //setting high resolution video record
                                var scale = 3;
                                canvasDOM.width = 350 * scale;
                                canvasDOM.height = 200 * scale;
                                //setting display style
                                canvasDOM.style.width = "350px";
                                canvasDOM.style.height = "200px";
                                const ctx = canvasDOM.getContext("2d");
    
                                //move 2 video into canvas
                                drawVideo(ctx, screenDOM, cameraDOM);
                            }
    
                            //capture screen from canvas
                            const canvasStream = canvasDOM.captureStream(30);
    
                            for (const track of stream.getTracks()) {
                                canvasStream.addTrack(track);
                            }
    
                            //record stream
                            onRecord(canvasStream, shadow);
                        });
                    } catch (error) {
                        console.log("Something media wrong");
                    }
                });
            }
        });
    } catch (error) {
        console.log("Something wrong: ", error);
    }
}

function onRecord(stream, shadow) {
    let options = null;
    let recordedStream = [];
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
        options = { mineType: "video/webm;codecs=vp9" };
    } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
        options = { mineType: "video/webm;codecs=vp8" };
    }

    function handleDataAvailable(event) {
        if (event.data.size > 0) {
            recordedStream.push(event.data);
        }
    }

    mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorder.onstop = function(e) {
        if (recordedStream && recordedStream.length > 0) {
            downloadStream(recordedStream);
            unMount(shadow);
        }
    }
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
}

function onStopRecord() {
    if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop()) || mediaRecorder.stop();
    }
}

function downloadStream(recordedStream) {
    const blob = new Blob(recordedStream, {
        type: "video/webm"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "dispaly: none";
    a.href = url;
    a.download = "screen_recorder.webm";
    a.click();
    window.URL.revokeObjectURL(url);
}

function onPauseRecord() {
    const btnPause = findElement("#rsd-button-pauserecord");
    if (btnPause.textContent === "Pause recording") {
        mediaRecorder.pause();
        btnPause.innerHTML = "Resume recording";
    } else {
        mediaRecorder.resume();
        btnPause.innerHTML = "Pause recording";
    }
}

function OnOffMic() {
    const btnMute = findElement("#rsd-button-mutemic");
    let audioTrack = mediaRecorder.stream.getTracks().find(track => track.kind === "audio");
    if (audioTrack.enabled) {
        audioTrack.enabled = false;
        btnMute.innerHTML = "Unmute Mic";
    }
    else {
        audioTrack.enabled = true;
        btnMute.innerHTML = "Mute Mic";
    }
}

function OnOffCam() {
    const btnOnOffCam = findElement("#rsd-button-onoffcam");
    let videoTrack = mediaRecorder.stream.getTracks().find(track => track.kind === "video");
    if (videoTrack.enabled) {
        videoTrack.enabled = false;
        btnOnOffCam.innerHTML = "Turn on Camera";
    }
    else {
        videoTrack.enabled = true;
        btnOnOffCam.innerHTML = "Turn off Camera";
    }
}

function drawVideo(ctx, screen, camera) {
    //screen
    const screenX = 0; //toa do x de dat video trong canvas
    const screenY = 0; //toa do y
    const screenXCor = ctx.canvas.width;
    const screenYCor = ctx.canvas.height;

    //camera
    const cameraX = 0.7 * ctx.canvas.width; //0.6 la dat tu nua ben phai canvas tro di
    const cameraY = 0.65 * ctx.canvas.height;
    const cameraXCor = ctx.canvas.width / 4;
    const cameraYCor = ctx.canvas.height / 3;

    ctx.drawImage(screen, screenX, screenY, screenXCor, screenYCor);
    ctx.drawImage(camera, cameraX, cameraY, cameraXCor, cameraYCor);
    requestAnimationFrame(() => {
        drawVideo(ctx, screen, camera);
    })
}

async function getDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInput = [];
        const videoInput = [];
        devices.forEach(function(device) {
            if (device.kind === "audioinput") {
                audioInput.push(device);
            } else if (device.kind === "videoinput") {
                videoInput.push(device);
            }
        });
        return { audioInput, videoInput };
    } catch (error) {
        console.log("Get devices failed as: ", error);
    }
}

function appendContentner() {
    const rootDOM = document.createElement("rsd-container");
    const shadowDOM = document.createElement("rsd-shadow");
    rootDOM.appendChild(shadowDOM);
    
    const htmlDOM = document.querySelector("html");
    if (htmlDOM) htmlDOM.appendChild(rootDOM);
    
    const shadow = shadowDOM.attachShadow({ mode: "open" });
    return shadow;
}

function render(shadow, devicesInfo) {
    let audioOpts = `<select id="rsd-audio-devices">`;
    if (devicesInfo.audioInput.length > 0) {
        for (let i = 0; i < devicesInfo.audioInput.length; i++) {
            audioOpts += `<option value="${devicesInfo.audioInput[i].deviceId}">${devicesInfo.audioInput[i].label}</option>`
        }
    }
    audioOpts += `</select>`;

    let videoOpts = `<select id="rsd-video-devices">`;
    if (devicesInfo.videoInput.length > 0) {
        for (let i = 0; i < devicesInfo.videoInput.length; i++) {
            videoOpts += `<option value="${devicesInfo.videoInput[i].deviceId}">${devicesInfo.videoInput[i].label}</option>`
        }
    }
    videoOpts += `</select>`;

    appendElement(shadow, audioOpts, videoOpts);
}

function appendElement(shadow, audioOpts, videoOpts) {
    shadow.innerHTML = `
        <style>
            .rsd-menu {
                position: fixed;
                z-index: 2147483647;
                bottom: 24px;
                right: 0;
                padding: 5px;
                flex-direction: column;
                justify-content: space-between;
                display: flex;
                transition: right 1s cubic-bezier(0.19, 1, 0.22, 1), height 0.2s ease-in-out;
                box-shadow: 0 8px 34px 4px rgb(0, 0, 0 / 6%);
                border: 1px solid hsla(240, 8%, 46%, 0.2);
                border-right: none;
                border-top-left-radius: 6px;
                border-bottom-left-radius: 6px;
                width: 400px;
                height: auto;
                background-color: white;
            }

            .rsd-menu__footer {
                display: flex;
                justify-content: center;
            }

            .rsd-menu__footer button {
                border: 1px solid rgb(211, 218, 223);
                border-radius: 5px;
                width: auto;
                height: 40px;
                margin: 10px;
                justify-content: center;
                transition-duration: 0.4s;
                cursor: pointer;
            }

            .rsd-menu__footer button:hover {
                background-color: DodgerBlue;
            }

            .rsd-menu__footer button:disabled {
                cursor: not-allowed;
            }

            .rsd-cameraoverlay {
                position: fixed;
                z-index: 2147483647;
                bottom: 0;
                left: 0;
            }

            #rsd-camera {
                width: 350px;
            }

            #rsd-screen {
                width: 350px;
            }


        </style>
        <div>
            <div class="rsd-cameraoverlay">
                <video id="rsd-camera" autoplay muted playsinline></video>
                <canvas id="rsd-canvas"></canvas>
                <video id="rsd-screen" autoplay playsinline></video>
            </div>
            <div class="rsd-menu">
                <div class="rsd-menu__content">
                    <div class="row">
                        <h4>Micro Setting</h4>
                        <div>
                            ${audioOpts}
                        </div>
                    </div>
                    <div class="row">
                        <h4>Camera Setting</h4>
                        <div>
                            ${videoOpts}
                        </div>
                    </div>
                </div>
                <div class="rsd-menu__footer">
                    <button id="rsd-button-startrecord">Start recording</button>
                    <button id="rsd-button-pauserecord">Pause recording</button>
                    <button id="rsd-button-stoprecord">Stop recording</button>
                    <button id="rsd-button-mutemic">Mute Mic</button>
                    <button id="rsd-button-onoffcam">Turn off Camera</button>
                </div>
            </div>
        </div>
    `;
}

function unMount(shadow) {
    shadow.innerHTML = `<span></span>`;
}