const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const emotionsDiv = document.getElementById("emotions");

let isDetecting = false;
let detectionTimeout;

// Get webcam stream
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream)
  .catch(err => console.error("Webcam error:", err));

startBtn.addEventListener("click", () => {
  if (!isDetecting) {
    isDetecting = true;
    detectEmotion();
  }
});

stopBtn.addEventListener("click", () => {
  isDetecting = false;
  clearTimeout(detectionTimeout);
  emotionsDiv.innerHTML = "Detection stopped.";
});

async function detectEmotion() {
  if (!isDetecting) return;

  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL("image/jpeg");
  const blob = dataURItoBlob(dataUrl);
  const formData = new FormData();
  formData.append("photo", blob, "frame.jpg");

  try {
    const res = await fetch("/detect", { method: "POST", body: formData });
    const data = await res.json();

    if (data.faces && data.faces.length > 0) {
      const emotions = data.faces[0].attributes.emotion;
      displayEmotions(emotions);
    } else {
      emotionsDiv.innerHTML = "No face detected.";
    }
  } catch (err) {
    console.error(err);
    emotionsDiv.innerHTML = "Detection failed.";
  }

  detectionTimeout = setTimeout(detectEmotion, 2000);
}

function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: 'image/jpeg' });
}

function displayEmotions(emotions) {
  emotionsDiv.innerHTML = "";

  for (let e in emotions) {
    const percent = Math.round(emotions[e]);
    
    // Create bar element
    const barHTML = `
      <div class="emotion-bar">
        <span class="emotion-name">${e}</span>
        <span class="emotion-score">${percent}%</span>
        <div class="bar-container">
          <div class="bar-fill" style="width: ${percent}%;"></div>
        </div>
      </div>
    `;
    emotionsDiv.innerHTML += barHTML;
  }
}
