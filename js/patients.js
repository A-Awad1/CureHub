function addListItem(name, before) {
  const ul = document.querySelector("article.documents ul");

  const li = document.createElement("li");

  const img = document.createElement("img");
  img.src = "/assets/svg/document.svg";
  img.alt = "document icon";
  li.appendChild(img);

  const span = document.createElement("span");
  span.textContent = name;
  li.appendChild(span);

  const div = document.createElement("div");
  li.appendChild(div);

  const downloadBtn = document.createElement("button");
  downloadBtn.className = "btn-icon";
  div.appendChild(downloadBtn);

  const dotsBtn = document.createElement("button");
  dotsBtn.className = "btn-icon";
  div.appendChild(dotsBtn);

  const downloadIcon = document.createElement("img");
  downloadIcon.src = "/assets/svg/download.svg";
  downloadIcon.alt = "download icon";
  downloadBtn.appendChild(downloadIcon);

  const dotsIcon = document.createElement("img");
  dotsIcon.src = "/assets/svg/dots.svg";
  dotsIcon.alt = "dots icon";
  dotsBtn.appendChild(dotsIcon);

  if (before) {
    ul.prepend(li);
    return;
  }
  ul.appendChild(li);
}

fetch("/json/db.json")
  .then((resolved) => resolved.json())
  .then((resolved) => resolved.documents)
  .then((documents) => documents.forEach((e) => addListItem(e)))
  .catch((rejected) => console.log(rejected));

// upload popup

const popupUpload = document.querySelector(".popup.upload");
const dropZone = popupUpload.querySelector(".drop-zone");
const fileInput = popupUpload.querySelector("#fileInput");
const fileList = popupUpload.querySelector(".file-list");
const placeholder = popupUpload.querySelector(".placeholder");

function showFiles(files) {
  fileList.innerHTML = "";
  placeholder.classList.add("hidden");
  Array.from(files).forEach((file) => {
    const li = document.createElement("li");
    li.textContent = file.name;
    fileList.appendChild(li);
  });
}
["dragenter", "dragover"].forEach((eventName) =>
  dropZone.addEventListener(eventName, (e) => e.preventDefault())
);
["dragleave", "drop"].forEach((eventName) =>
  dropZone.addEventListener(eventName, (e) => e.preventDefault())
);

dropZone.addEventListener("drop", (e) => {
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    fileInput.files = files;
    showFiles(files);
  }
});

fileInput.addEventListener("change", () => showFiles(fileInput.files));

fileInput.addEventListener("change", () => {
  if (fileInput.files.length === 0) {
    placeholder.classList.remove("hidden");
    fileList.innerHTML = "";
    return;
  }
  showFiles(fileInput.files);
});

function openUploadPopup() {
  popupUpload.classList.remove("hidden");
}

function closeUploadPopup() {
  placeholder.classList.remove("hidden");
  fileInput.value = "";
  fileList.innerHTML = "";
  popupUpload.classList.add("hidden");
}

function uploadFiles(e) {
  const files = fileInput.files;
  if (!files || files.length === 0) {
    e.preventDefault();
    return;
  }
  const filesNames = Array.from(files).map((e) => e.name);
  closeUploadPopup();

  filesNames.forEach((e) => addListItem(e, true));
}

document
  .querySelector("article.documents button.add-file")
  .addEventListener("click", openUploadPopup);
popupUpload.querySelector("button.close-btn").addEventListener("click", closeUploadPopup);
popupUpload.querySelector("button.cancel").addEventListener("click", closeUploadPopup);
popupUpload.querySelector("button.submit.upload").addEventListener("click", uploadFiles);

// form popup

const formPopup = document.querySelector(".popup.form");

const fields = [
  "name",
  "date",
  "speciality",
  "age",
  "gender",
  "symptoms",
  "diagnosis",
  "rx",
  "signature",
];

const saveBtn = document.getElementById("saveBtn");

function validateForm() {
  const completed = fields.every((id) => document.getElementById(id).value.trim().length > 0);
  completed ? saveBtn.classList.remove("disabled") : saveBtn.classList.add("disabled");
}

fields.forEach((id) => document.getElementById(id).addEventListener("input", validateForm));

function openFormPopup(data) {
  formPopup.classList.remove("hidden");
  if (!data) return;
  fields.forEach((id) => (document.getElementById(id).value = data[id]));
  validateForm();
}

function closeFormPopup() {
  fields.forEach((id) => (document.getElementById(id).value = ""));
  formPopup.classList.add("hidden");
}

const existingData = {
  name: "Mohamed Ahmed",
  date: "26/12/2020",
  speciality: "GIT",
  age: "32",
  gender: "Male",
  symptoms: "Dyspepsia",
  diagnosis: "H-Pylori",
  rx: `Tavoniza 20mg once daily
Curam 1000mg (1g) x3 daily`,
  signature: "Dr John",
};

const addPresBtn = document.querySelector(".add-prescription");
const allPresLi = Array.from(document.querySelectorAll("article.prescriptions ul li"));

formPopup.querySelector("button.close-btn").addEventListener("click", closeFormPopup);
addPresBtn.addEventListener("click", () => openFormPopup());
allPresLi.forEach((e) =>
  e.addEventListener("click", () => {
    openFormPopup(existingData);
  })
);
