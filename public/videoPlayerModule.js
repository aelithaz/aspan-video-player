// videoPlayerModule.js
import { quizzes, renderQuiz, handleQuizAnswer } from './quizModule.js';

const video = document.getElementById("surveyVideo");
const videoSource = document.getElementById("videoSource");
const videoSelector = document.getElementById("videoSelector");
const progressBar = document.getElementById("progressBar");
const progressContainer = document.getElementById("progressContainer");
const chunkMarkers = document.getElementById("chunkMarkers");
const chunkSize = 5; // 5-second chunks
let chunkViews = {}; // Stores chunk views per video
let lastChunk = -1; // Tracks last recorded chunk
let currentVideo = "wealthReport.mp4"; // Default video
let manualSeek = false; // Tracks manual seeking
let seekWhilePaused = false; // Checks if seeking is done while paused
let dataAlreadySent = false;
let quizAnswers = {}; // Store user's selected answers
let recordedChunks = {}; // Prevents double counting

function initializeTracking() {
    let numChunks = Math.ceil(video.duration / chunkSize);

    if (!chunkViews[currentVideo]) {
        chunkViews[currentVideo] = {};
        for (let i = 0; i < numChunks; i++) {
            chunkViews[currentVideo][i] = 0;
        }
    }

    if (!recordedChunks[currentVideo]) {
        recordedChunks[currentVideo] = new Set();
    }

    createChunkMarkers(numChunks);
    lastChunk = -1;
}

let firstLoad = true;

video.onloadedmetadata = () => {
    initializeTracking();
    renderQuiz(currentVideo, document.getElementById("quizContainer"), quizAnswers, handleQuizAnswerWrapper);

    // Avoid re-triggering changeVideo() on page load if default video is already selected
    if (firstLoad) {
        firstLoad = false;
    }
};

video.ontimeupdate = null;
video.ontimeupdate = () => {
    const progress = (video.currentTime / video.duration) * 100;
    progressBar.style.width = progress + "%";
    if (!manualSeek) {
        trackChunkViews();
    }
};

let trackingInProgress = false;

function trackChunkViews() {
    if (trackingInProgress) return;

    trackingInProgress = true;

    const currentChunk = Math.floor(video.currentTime / chunkSize);

    if (currentChunk !== lastChunk && chunkViews[currentVideo]?.hasOwnProperty(currentChunk)) {
        chunkViews[currentVideo][currentChunk]++;
        lastChunk = currentChunk;
    }

    trackingInProgress = false;
}

function changeVideo() {
    currentVideo = videoSelector.value;
    video.pause();
    videoSource.src = "videos/" + currentVideo;
    video.load();
    lastChunk = -1; // Reset chunk tracking
    video.currentTime = 0;
    progressBar.style.width = "0%";
}

function generateUserId() {
    let uid = sessionStorage.getItem('uid');
    if (!uid) {
        uid = Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('uid', uid);
    }
    return uid;
}

const uid = generateUserId();  // Call only ONCE at the start

function generateSubmissionTimestamp(video) {
    return `${new Date().toISOString()}_${video}_${Math.random().toString(36).substring(2, 6)}`;
}

let submitting = false;

function submitDataToServer() {
    if (submitting || dataAlreadySent) {
        console.warn("⏹️ Prevented duplicate submission");
        return;
    }
    submitting = true;
    dataAlreadySent = true;
    console.warn("🚨 SUBMITTING DATA NOW");

    const orderedVideos = ["wealthReport.mp4", "genderEquality.mp4", "branding.mp4"];

    for (const video of orderedVideos) {
        const videoChunks = chunkViews[video] || {};
        const hasViews = Object.values(videoChunks).some(count => count > 0);
        const hasQuiz = quizAnswers[video] && quizAnswers[video].length > 0;

        if (!hasViews && !hasQuiz) continue;

        const correctAnswers = quizAnswers[video]?.filter((entry, i) =>
            entry?.selectedIndex === quizzes[video][i].correct
        ).length || 0;

        const selectedAnswers = quizAnswers[video]?.map((entry, i) => ({
            question: quizzes[video][i].question,
            selected: entry?.selectedText || null
        })) || [];

        console.log("💾 Submitting chunks for:", video, chunkViews[video]);

        const payload = {
            userId: uid,
            video: video,
            chunkViews: videoChunks,
            timestamp: generateSubmissionTimestamp(video),
            quizCorrect: correctAnswers,
            selectedAnswers: selectedAnswers
        };

        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        console.log("🔔 Sending beacon with payload:", payload);
        const success = navigator.sendBeacon("https://aspan-video-player.onrender.com/api/view", blob);
        console.log("📤 Beacon success:", success);
    }
}

function playVideo() {
    if (video.currentTime >= video.duration) {
        lastChunk = -1;
    }

    if (seekWhilePaused) {
        setTimeout(() => {
            trackChunkViews();     
            seekWhilePaused = false;
        }, 100);
    }
    else if (lastChunk === -1) {
        trackChunkViews(); // ensure first view gets tracked
    }

    video.play();
    manualSeek = false;
}

function pauseVideo() { video.pause(); }

function rewind(seconds) {
    video.currentTime = Math.max(video.currentTime - seconds, 0);
    setTimeout(() => {
        trackChunkViews();
    }, 100);
}

function createChunkMarkers(numChunks) {
    chunkMarkers.innerHTML = "";
    for (let i = 0; i < numChunks; i++) {
        const marker = document.createElement("div");
        marker.classList.add("chunk-marker");
        marker.style.left = (i / numChunks * 100) + "%";
        chunkMarkers.appendChild(marker);
    }
}

function seekVideo(event) {
    const rect = progressContainer.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newTime = (clickX / rect.width) * video.duration;
    video.currentTime = newTime;
    manualSeek = true;

    if (video.paused) {
        seekWhilePaused = true;  
    } else {
        setTimeout(() => {
            trackChunkViews();
            manualSeek = false;
        }, 100);
    }
}

document.getElementById("volumeSlider").addEventListener("input", function () {
    video.volume = parseFloat(this.value);
});

window.addEventListener("pagehide", () => {
    submitDataToServer();
});

function handleQuizAnswerWrapper(videoName, questionIndex, answerIndex) {
    handleQuizAnswer(videoName, questionIndex, answerIndex, quizAnswers);
}

window.onload = () => {
    videoSource.src = "videos/" + currentVideo;
    video.load();  
};

export {
    changeVideo,
    playVideo,
    pauseVideo,
    rewind,
    seekVideo
};
