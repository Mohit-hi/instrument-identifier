// Select elements
const startBtn = document.getElementById("start-btn");
const canvas = document.getElementById("audio-visualizer");
const instrumentName = document.getElementById("instrument-name");

// Initialize audio context and canvas
let audioContext, analyser, microphone, dataArray, canvasCtx;

startBtn.addEventListener("click", async () => {
    // Request microphone access
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        handleAudioStream(stream);
    } catch (error) {
        alert("Microphone access denied. Please enable it to proceed.");
        console.error(error);
    }
});

function handleAudioStream(stream) {
    // Initialize audio context and analyser
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);

    // Set up analyser properties
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    // Set up canvas context
    canvasCtx = canvas.getContext("2d");

    // Start visualizing audio
    visualizeAudio();

    // Simulate instrument detection (replace with back-end API call)
    setInterval(() => {
        // Dummy instrument detection (replace this with real data)
        const instruments = ["Guitar", "Piano", "Violin", "Drums", "Flute"];
        const randomInstrument = instruments[Math.floor(Math.random() * instruments.length)];
        instrumentName.textContent = randomInstrument;
    }, 2000);
}

function visualizeAudio() {
    requestAnimationFrame(visualizeAudio);

    analyser.getByteTimeDomainData(dataArray);
    canvasCtx.fillStyle = "#f3f4f6";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "#4caf50";

    canvasCtx.beginPath();

    const sliceWidth = (canvas.width * 1.0) / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
} 

async function sendAudioToServer(blob) {
    const formData = new FormData();
    formData.append("audio", blob, "recording.wav");

    try {
        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        document.getElementById("instrument-name").textContent = data.instrument || "Unknown";
    } catch (error) {
        console.error("Error sending audio to server:", error);
    }
}