const faces = [
  {
    id: "00",
    fileName: "na",
    label: "Difficulty face 00",
    src: "assets/diffIcon_00_btn_001.png",
  },
  {
    id: "auto",
    fileName: "auto",
    label: "Auto difficulty face",
    src: "assets/diffIcon_auto_btn_001.png",
  },
  {
    id: "01",
    fileName: "easy",
    label: "Difficulty face 01",
    src: "assets/diffIcon_01_btn_001.png",
  },
  {
    id: "02",
    fileName: "normal",
    label: "Difficulty face 02",
    src: "assets/diffIcon_02_btn_001.png",
  },
  {
    id: "03",
    fileName: "hard",
    label: "Difficulty face 03",
    src: "assets/diffIcon_03_btn_001.png",
  },
  {
    id: "04",
    fileName: "harder",
    label: "Difficulty face 04",
    src: "assets/diffIcon_04_btn_001.png",
  },
  {
    id: "05",
    fileName: "insane",
    label: "Difficulty face 05",
    src: "assets/diffIcon_05_btn_001.png",
  },
  {
    id: "07",
    fileName: "easyDemon",
    label: "Difficulty face 07",
    src: "assets/diffIcon_07_btn_001.png",
  },
  {
    id: "08",
    fileName: "mediumDemon",
    label: "Difficulty face 08",
    src: "assets/diffIcon_08_btn_001.png",
  },
  {
    id: "06",
    fileName: "hardDemon",
    label: "Difficulty face 06",
    src: "assets/diffIcon_06_btn_001.png",
  },
  {
    id: "09",
    fileName: "insaneDemon",
    label: "Difficulty face 09",
    src: "assets/diffIcon_09_btn_001.png",
  },
  {
    id: "10",
    fileName: "extremeDemon",
    label: "Difficulty face 10",
    src: "assets/diffIcon_10_btn_001.png",
  },
];

const ratings = {
  blank: null,
  featured: {
    label: "Featured",
    src: "assets/GJ_featuredCoin_001.png",
    circleX: 82,
    circleY: 83,
  },
  epic: {
    label: "Epic",
    src: "assets/GJ_epicCoin_001.png",
    circleX: 95,
    circleY: 109,
  },
  legendary: {
    label: "Legendary",
    src: "assets/GJ_epicCoin2_001.png",
    circleX: 98,
    circleY: 111,
  },
  mythic: {
    label: "Mythic",
    src: "assets/GJ_epicCoin3_001.png",
    circleX: 118,
    circleY: 110.5,
  },
};

const ratingFileNames = {
  blank: "",
  featured: "featured",
  epic: "epic",
  legendary: "legendary",
  mythic: "mythic",
};

const previewCenter = {
  x: 135,
  y: 135,
};

const snapDistance = 6;
const rotateSnapRadians = Math.PI / 36;
const rotationSnapAngles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];
const minObjectSize = 24;

const canvas = document.querySelector("#iconCanvas");
const context = canvas.getContext("2d");
const previousButton = document.querySelector("#previousFace");
const nextButton = document.querySelector("#nextFace");
const downloadButton = document.querySelector("#downloadIcon");
const editButton = document.querySelector("#editIcon");
const editButtonImage = editButton.querySelector("img");
const resetButton = document.querySelector("#resetCanvas");
const actionButtons = document.querySelector(".action-buttons");
const importFaceButton = document.querySelector("#importFaceButton");
const faceFileInput = document.querySelector("#faceFileInput");
const customFaceButtons = document.querySelector("#customFaceButtons");
const ratingButtons = document.querySelectorAll(".rating-button");
const imageCache = new Map();

let currentFaceIndex = faces.findIndex((face) => face.id === "01");
let currentRating = "blank";
let customFaceCounter = 0;
let currentCustomFaceId = null;
let customFaces = [];
let iconObjects = [];
let isEditorOpen = false;
let selectedObjectId = null;
let dragState = null;
let snapLines = {
  x: false,
  y: false,
};

function loadImage(src) {
  if (!imageCache.has(src)) {
    const image = new Image();
    imageCache.set(
      src,
      new Promise((resolve, reject) => {
        image.addEventListener("load", () => resolve(image), { once: true });
        image.addEventListener("error", reject, { once: true });
        image.src = src;
      }),
    );
  }

  return imageCache.get(src);
}

function rotatePoint(point, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos,
  };
}

function makeEditableObject(id, image, centerX, centerY, layer, dimensions = null) {
  return {
    id,
    image,
    x: centerX,
    y: centerY,
    width: dimensions?.width ?? image.naturalWidth,
    height: dimensions?.height ?? image.naturalHeight,
    rotation: 0,
    layer,
  };
}

function getEasyFaceIndex() {
  return faces.findIndex((face) => face.id === "01");
}

function getSelectedCustomFace() {
  return customFaces.find((face) => face.id === currentCustomFaceId) || null;
}

function sanitizeFileName(fileName) {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .trim()
    .replace(/\s+/g, " ") || "custom";
}

function getCurrentFaceLabel() {
  const customFace = getSelectedCustomFace();

  if (customFace) {
    return customFace.label;
  }

  return faces[currentFaceIndex].label;
}

async function buildDefaultObjects() {
  const rating = ratings[currentRating];
  const customFace = getSelectedCustomFace();
  const normalFace = faces[currentFaceIndex];
  const faceImage = await loadImage(customFace?.src ?? normalFace.src);
  const nextObjects = [];

  if (rating) {
    const ratingImage = await loadImage(rating.src);
    nextObjects.push(
      makeEditableObject(
        "rating",
        ratingImage,
        previewCenter.x - rating.circleX + ratingImage.naturalWidth / 2,
        previewCenter.y - rating.circleY + ratingImage.naturalHeight / 2,
        0,
      ),
    );
  }

  nextObjects.push(
    makeEditableObject(
      "face",
      faceImage,
      previewCenter.x,
      previewCenter.y,
      1,
      customFace
        ? {
            width: customFace.width,
            height: customFace.height,
          }
        : null,
    ),
  );

  iconObjects = nextObjects;
  selectedObjectId = null;
  dragState = null;
  snapLines = {
    x: false,
    y: false,
  };
}

function getSelectedObject() {
  return iconObjects.find((object) => object.id === selectedObjectId) || null;
}

function getObjectCorners(object) {
  const halfWidth = object.width / 2;
  const halfHeight = object.height / 2;
  const corners = [
    { name: "nw", x: -halfWidth, y: -halfHeight },
    { name: "ne", x: halfWidth, y: -halfHeight },
    { name: "se", x: halfWidth, y: halfHeight },
    { name: "sw", x: -halfWidth, y: halfHeight },
  ];

  return corners.map((corner) => {
    const rotated = rotatePoint(corner, object.rotation);
    return {
      name: corner.name,
      x: object.x + rotated.x,
      y: object.y + rotated.y,
    };
  });
}

function getRotateHandle(object) {
  const rotated = rotatePoint(
    {
      x: 0,
      y: -object.height / 2 - 28,
    },
    object.rotation,
  );

  return {
    x: object.x + rotated.x,
    y: object.y + rotated.y,
  };
}

function drawObject(object) {
  context.save();
  context.translate(object.x, object.y);
  context.rotate(object.rotation);
  context.drawImage(
    object.image,
    -object.width / 2,
    -object.height / 2,
    object.width,
    object.height,
  );
  context.restore();
}

function drawSnapLines() {
  context.save();
  context.strokeStyle = "rgb(16 132 255 / 0.82)";
  context.lineWidth = 1.5;
  context.setLineDash([6, 5]);

  if (snapLines.x) {
    context.beginPath();
    context.moveTo(previewCenter.x, 0);
    context.lineTo(previewCenter.x, canvas.height);
    context.stroke();
  }

  if (snapLines.y) {
    context.beginPath();
    context.moveTo(0, previewCenter.y);
    context.lineTo(canvas.width, previewCenter.y);
    context.stroke();
  }

  context.restore();
}

function drawSelectionBox(object) {
  const corners = getObjectCorners(object);
  const rotateHandle = getRotateHandle(object);

  context.save();
  context.strokeStyle = "#1f8cff";
  context.fillStyle = "#ffffff";
  context.lineWidth = 2;

  context.beginPath();
  corners.forEach((corner, index) => {
    if (index === 0) {
      context.moveTo(corner.x, corner.y);
      return;
    }

    context.lineTo(corner.x, corner.y);
  });
  context.closePath();
  context.stroke();

  const topCenter = {
    x: (corners[0].x + corners[1].x) / 2,
    y: (corners[0].y + corners[1].y) / 2,
  };

  context.beginPath();
  context.moveTo(topCenter.x, topCenter.y);
  context.lineTo(rotateHandle.x, rotateHandle.y);
  context.stroke();

  corners.forEach((corner) => {
    context.fillRect(corner.x - 5, corner.y - 5, 10, 10);
    context.strokeRect(corner.x - 5, corner.y - 5, 10, 10);
  });

  context.beginPath();
  context.arc(rotateHandle.x, rotateHandle.y, 7, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.restore();
}

function drawRotationPopup(object) {
  const rotateHandle = getRotateHandle(object);
  const text = formatRotationDegrees(object.rotation);
  const paddingX = 8;
  const boxHeight = 24;

  context.save();
  context.font = "bold 13px Arial, Helvetica, sans-serif";
  context.textBaseline = "middle";

  const textWidth = context.measureText(text).width;
  const boxWidth = textWidth + paddingX * 2;
  const boxX = Math.max(
    4,
    Math.min(canvas.width - boxWidth - 4, rotateHandle.x - boxWidth / 2),
  );
  const boxY = Math.max(4, rotateHandle.y - 38);

  context.fillStyle = "rgb(0 0 0 / 0.72)";
  context.strokeStyle = "rgb(255 255 255 / 0.85)";
  context.lineWidth = 1;
  context.beginPath();
  context.roundRect(boxX, boxY, boxWidth, boxHeight, 5);
  context.fill();
  context.stroke();

  context.fillStyle = "#ffffff";
  context.fillText(text, boxX + paddingX, boxY + boxHeight / 2);
  context.restore();
}

function renderCanvas(animate = false) {
  const rating = ratings[currentRating];
  const faceLabel = getCurrentFaceLabel();

  context.clearRect(0, 0, canvas.width, canvas.height);
  iconObjects
    .slice()
    .sort((a, b) => a.layer - b.layer)
    .forEach(drawObject);

  if (isEditorOpen) {
    drawSnapLines();
    const selectedObject = getSelectedObject();

    if (selectedObject) {
      drawSelectionBox(selectedObject);

      if (dragState?.mode === "rotate") {
        drawRotationPopup(selectedObject);
      }
    }
  }

  canvas.setAttribute(
    "aria-label",
    `${rating ? `${rating.label} ` : ""}${faceLabel} preview`,
  );

  if (animate) {
    canvas.classList.remove("is-changing");
    void canvas.offsetWidth;
    canvas.classList.add("is-changing");
  }
}

async function resetCanvasObjects(animate = false) {
  await buildDefaultObjects();
  selectedObjectId = isEditorOpen ? "face" : null;
  renderCanvas(animate);
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

function distance(pointA, pointB) {
  return Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);
}

function normalizeRotation(rotation) {
  const fullTurn = Math.PI * 2;
  return ((rotation % fullTurn) + fullTurn) % fullTurn;
}

function getShortestAngleDistance(angleA, angleB) {
  return Math.abs(Math.atan2(Math.sin(angleA - angleB), Math.cos(angleA - angleB)));
}

function formatRotationDegrees(rotation) {
  const degrees = (normalizeRotation(rotation) * 180) / Math.PI;
  const roundedDegrees = Math.round(degrees * 10) / 10;
  return `${roundedDegrees === 360 ? "0.0" : roundedDegrees.toFixed(1)} deg`;
}

function getCornerHit(point, object) {
  return getObjectCorners(object).find((corner) => distance(point, corner) <= 10);
}

function hitTestObject(point, object) {
  const local = rotatePoint(
    {
      x: point.x - object.x,
      y: point.y - object.y,
    },
    -object.rotation,
  );

  return (
    Math.abs(local.x) <= object.width / 2 &&
    Math.abs(local.y) <= object.height / 2
  );
}

function hitTest(point) {
  const orderedObjects = iconObjects.slice().sort((a, b) => b.layer - a.layer);

  for (const object of orderedObjects) {
    const corner = getCornerHit(point, object);

    if (corner) {
      return {
        object,
        mode: "scale",
        corner,
      };
    }

    if (distance(point, getRotateHandle(object)) <= 12) {
      return {
        object,
        mode: "rotate",
      };
    }

    if (hitTestObject(point, object)) {
      return {
        object,
        mode: "move",
      };
    }
  }

  return null;
}

function updateCanvasCursor(point) {
  if (!isEditorOpen || dragState) {
    return;
  }

  const hit = hitTest(point);

  if (!hit) {
    canvas.style.cursor = "default";
    return;
  }

  if (hit.mode === "move") {
    canvas.style.cursor = "move";
  } else if (hit.mode === "rotate") {
    canvas.style.cursor = "grab";
  } else {
    canvas.style.cursor = "nwse-resize";
  }
}

function startCanvasEdit(event) {
  if (!isEditorOpen) {
    return;
  }

  const point = getCanvasPoint(event);
  const hit = hitTest(point);

  if (!hit) {
    selectedObjectId = null;
    renderCanvas();
    return;
  }

  selectedObjectId = hit.object.id;
  canvas.setPointerCapture(event.pointerId);

  dragState = {
    mode: hit.mode,
    object: hit.object,
    startPoint: point,
    startX: hit.object.x,
    startY: hit.object.y,
    startWidth: hit.object.width,
    startHeight: hit.object.height,
    startRotation: hit.object.rotation,
    startDistance: Math.max(1, distance(point, hit.object)),
    startAngle: Math.atan2(point.y - hit.object.y, point.x - hit.object.x),
  };

  canvas.style.cursor = hit.mode === "rotate" ? "grabbing" : canvas.style.cursor;
  renderCanvas();
}

function moveSelectedObject(point) {
  const deltaX = point.x - dragState.startPoint.x;
  const deltaY = point.y - dragState.startPoint.y;
  let nextX = dragState.startX + deltaX;
  let nextY = dragState.startY + deltaY;

  snapLines = {
    x: false,
    y: false,
  };

  if (Math.abs(nextX - previewCenter.x) <= snapDistance) {
    nextX = previewCenter.x;
    snapLines.x = true;
  }

  if (Math.abs(nextY - previewCenter.y) <= snapDistance) {
    nextY = previewCenter.y;
    snapLines.y = true;
  }

  dragState.object.x = nextX;
  dragState.object.y = nextY;
}

function scaleSelectedObject(point) {
  const nextDistance = Math.max(1, distance(point, dragState.object));
  const scale = nextDistance / dragState.startDistance;
  const ratio = dragState.startWidth / dragState.startHeight;

  let nextWidth = Math.max(minObjectSize, dragState.startWidth * scale);
  let nextHeight = nextWidth / ratio;

  if (nextHeight < minObjectSize) {
    nextHeight = minObjectSize;
    nextWidth = nextHeight * ratio;
  }

  dragState.object.width = nextWidth;
  dragState.object.height = nextHeight;
}

function rotateSelectedObject(point) {
  const nextAngle = Math.atan2(
    point.y - dragState.object.y,
    point.x - dragState.object.x,
  );
  let nextRotation = dragState.startRotation + nextAngle - dragState.startAngle;

  const normalizedRotation = normalizeRotation(nextRotation);
  const snapAngle = rotationSnapAngles.find(
    (angle) => getShortestAngleDistance(normalizedRotation, angle) <= rotateSnapRadians,
  );

  if (snapAngle !== undefined) {
    nextRotation = snapAngle;
  }

  dragState.object.rotation = nextRotation;
}

function updateCanvasEdit(event) {
  if (!isEditorOpen) {
    return;
  }

  const point = getCanvasPoint(event);

  if (!dragState) {
    updateCanvasCursor(point);
    return;
  }

  if (dragState.mode === "move") {
    moveSelectedObject(point);
  } else if (dragState.mode === "scale") {
    scaleSelectedObject(point);
  } else if (dragState.mode === "rotate") {
    rotateSelectedObject(point);
  }

  renderCanvas();
}

function endCanvasEdit(event) {
  if (!dragState) {
    return;
  }

  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }

  dragState = null;
  snapLines = {
    x: false,
    y: false,
  };
  canvas.style.cursor = "default";
  renderCanvas();
}

async function moveFace(direction) {
  if (currentCustomFaceId) {
    currentCustomFaceId = null;
    currentFaceIndex = getEasyFaceIndex();
    renderCustomFaceButtons();
    await resetCanvasObjects(true);
    return;
  }

  currentFaceIndex = (currentFaceIndex + direction + faces.length) % faces.length;
  await resetCanvasObjects(true);
}

async function selectRating(ratingName) {
  currentRating = ratingName;

  ratingButtons.forEach((button) => {
    const isSelected = button.dataset.rating === ratingName;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  await resetCanvasObjects(true);
}

function toggleEditor() {
  isEditorOpen = !isEditorOpen;
  selectedObjectId = isEditorOpen ? "face" : null;
  dragState = null;
  snapLines = {
    x: false,
    y: false,
  };

  canvas.classList.toggle("is-editing", isEditorOpen);
  actionButtons.classList.toggle("is-editing", isEditorOpen);
  editButton.classList.toggle("is-selected", isEditorOpen);
  editButton.setAttribute("aria-pressed", String(isEditorOpen));
  editButton.setAttribute(
    "aria-label",
    isEditorOpen ? "Close canvas editor" : "Open canvas editor",
  );
  editButtonImage.src = isEditorOpen
    ? "assets/GJ_deleteSongBtn_001.png"
    : "assets/GJ_viewLevelsBtn_001.png";
  renderCanvas();
}

function resetCurrentCanvas() {
  resetCanvasObjects(true);
}

function renderCustomFaceButtons() {
  customFaceButtons.hidden = customFaces.length === 0;
  customFaceButtons.replaceChildren();

  customFaces.forEach((customFace) => {
    const button = document.createElement("button");
    const image = document.createElement("img");
    const isSelected = customFace.id === currentCustomFaceId;

    button.className = "custom-face-button";
    button.type = "button";
    button.dataset.customFaceId = customFace.id;
    button.setAttribute("aria-label", customFace.label);
    button.setAttribute("aria-pressed", String(isSelected));
    button.classList.toggle("is-selected", isSelected);
    image.src = customFace.src;
    image.alt = "";
    button.append(image);
    button.addEventListener("click", () => selectCustomFace(customFace.id));
    customFaceButtons.append(button);
  });
}

async function selectCustomFace(customFaceId) {
  if (currentCustomFaceId === customFaceId) {
    currentCustomFaceId = null;
    currentFaceIndex = getEasyFaceIndex();
  } else {
    currentCustomFaceId = customFaceId;
  }

  renderCustomFaceButtons();
  await resetCanvasObjects(true);
}

async function importCustomFace(file) {
  if (!file) {
    return;
  }

  const src = URL.createObjectURL(file);
  const image = await loadImage(src);
  const scale = Math.min(160 / image.naturalWidth, 144 / image.naturalHeight, 1);
  const customFace = {
    id: `custom-${customFaceCounter}`,
    fileName: sanitizeFileName(file.name),
    label: `Custom difficulty face ${customFaceCounter + 1}`,
    src,
    width: image.naturalWidth * scale,
    height: image.naturalHeight * scale,
  };

  customFaceCounter += 1;
  customFaces.push(customFace);
  currentCustomFaceId = customFace.id;
  renderCustomFaceButtons();
  await resetCanvasObjects(true);
}

function getDownloadFileName(face) {
  const difficultyName = face.fileName ?? sanitizeFileName(face.label);
  const ratingName = ratingFileNames[currentRating];

  if (!ratingName) {
    return `${difficultyName}.png`;
  }

  return `${difficultyName}-${ratingName}.png`;
}

function downloadIcon() {
  const face = getSelectedCustomFace() || faces[currentFaceIndex];
  const previousEditorState = isEditorOpen;
  const previousSelection = selectedObjectId;

  isEditorOpen = false;
  selectedObjectId = null;
  renderCanvas();

  canvas.toBlob((blob) => {
    isEditorOpen = previousEditorState;
    selectedObjectId = previousSelection;
    renderCanvas();

    if (!blob) {
      return;
    }

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.download = getDownloadFileName(face);
    link.href = url;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}

previousButton.addEventListener("click", () => moveFace(-1));
nextButton.addEventListener("click", () => moveFace(1));
downloadButton.addEventListener("click", downloadIcon);
editButton.addEventListener("click", toggleEditor);
resetButton.addEventListener("click", resetCurrentCanvas);
importFaceButton.addEventListener("click", () => faceFileInput.click());
faceFileInput.addEventListener("change", () => {
  importCustomFace(faceFileInput.files?.[0]);
  faceFileInput.value = "";
});

ratingButtons.forEach((button) => {
  button.addEventListener("click", () => selectRating(button.dataset.rating));
});

canvas.addEventListener("pointerdown", startCanvasEdit);
canvas.addEventListener("pointermove", updateCanvasEdit);
canvas.addEventListener("pointerup", endCanvasEdit);
canvas.addEventListener("pointercancel", endCanvasEdit);
canvas.addEventListener("pointerleave", (event) => {
  if (dragState) {
    return;
  }

  updateCanvasCursor(event);
});

resetCanvasObjects();
