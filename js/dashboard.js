const appointsBox = document.querySelector("div.numbers-summary > article.appoints");
appointsBox.onclick = () => (location.href = "/appointments.html#appointments-list");

const scheduleLink = document.querySelector(".schedule-article header span");
scheduleLink.onclick = () => (location.href = "/appointments.html#doctor-schedule");

// Gender chart
const genderCanvas = document.querySelector(".graph > canvas");
genderCanvas.width = "80%";
genderCanvas.height = "100%";
const genderCtx = genderCanvas.getContext("2d");
// global values
const font = {
  weight: 500,
  family: "Poppins",
  size: 15,
};
const borderRadius = {
  topLeft: 28,
  topRight: 28,
  bottomLeft: 0,
  bottomRight: 0,
};
const genderChart = new Chart(genderCtx, {
  type: "bar",
  data: {
    labels: ["Sat.", "Sun.", "Mon.", "Tues.", "Wed.", "Thurs.", "Friday"],
    datasets: [
      {
        label: "Men",
        data: [605, 660, 620, 660, 730, 915, 1000],
        backgroundColor: "#00A8B580",
        borderWidth: 0,
        borderRadius,
      },
      {
        label: "Women",
        data: [800, 590, 720, 620, 900, 730, 960],
        backgroundColor: "#FFA246",
        borderWidth: 0,
        borderRadius,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: false,
        min: 500,
        max: 1000,
        ticks: {
          stepSize: 100,
          color: "#999A9D",
          font,
          callback: (value) => {
            if ([500, 600, 700, 800, 900, 1000].includes(value)) return value;
          },
        },
        grid: {
          color: "#f7f7f7",
        },
        border: {
          color: "#fff",
        },
      },
      x: {
        ticks: {
          color: "#212529",
          font,
        },
        grid: {
          display: false,
          drawBorder: false,
        },
        border: {
          color: "#fff",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    barPercentage: 0.9,
    categoryPercentage: 0.25,
  },
});

// Circle chart
const circleCanvas = document.querySelector(".circle > canvas");
const circleCtx = circleCanvas.getContext("2d");
const circleChart = new Chart(circleCtx, {
  type: "doughnut",
  data: {
    labels: ["ENT", "Dentist", "General Physician", "Cardiology", "Orthopedic"],
    datasets: [
      {
        data: [18, 20, 30, 15, 17],
        backgroundColor: ["#9747FF", "#F7912C", "#00A8B5", "#FFCC00", "#76CAD1"],
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 0,
      },
    ],
  },
  options: {
    responsive: true,
    cutout: "70%",
    rotation: -15,
    plugins: {
      tooltip: {
        enabled: false,
        external: customTooltip,
      },
      legend: {
        display: false,
      },
    },
  },
});
function customTooltip(context) {
  const tooltipModel = context.tooltip;
  const chart = context.chart;

  const oldTooltip = document.getElementById("chartjs-tooltip-li");
  if (oldTooltip) oldTooltip.remove();

  const allLi = document.querySelectorAll(".rates-circle ul li");
  allLi.forEach((li) => li.classList.remove("hidden"));

  if (!tooltipModel.opacity || !tooltipModel.dataPoints?.length) return;

  const label = tooltipModel.dataPoints[0].label?.toLowerCase();

  allLi.forEach((li) => {
    if (li.getAttribute("data-label")?.toLowerCase() !== label) li.classList.add("hidden");
  });

  const originalLi = document.querySelector(`.rates-circle ul li[data-label="${label}"]`);
  if (!originalLi) return;

  const clonedLi = originalLi.cloneNode(true);
  clonedLi.id = "chartjs-tooltip-li";
  clonedLi.classList.add("cloned");
  clonedLi.classList.remove("hidden");

  document.body.appendChild(clonedLi);

  const canvasRect = chart.canvas.getBoundingClientRect();
  const x = canvasRect.left + tooltipModel.caretX + 44;
  const y = canvasRect.top + tooltipModel.caretY + 22;

  clonedLi.style.left = `${x}px`;
  clonedLi.style.top = `${y}px`;
}

// Doctor Schedule
const selectedDay = "2024-12-8";
new Calendar({
  element: "#dash-calendar",
  selectedDates: [new Date(selectedDay)],
  multiSelect: false,
  onSelect: (date) => updateActivity(date),
});

function updateActivity(date) {
  // simulate to get data depending on api
  fetch("/json/db.json")
    .then((resolved) => resolved.json())
    .then((resolved) => {
      if (!resolved?.activities?.length) return Promise.reject("no activities");
      return resolved?.activities;
    })
    .then((resolved) => resolved.filter((e) => e.date === date))
    .then((activities) => activityUl(activities))
    .catch((rejected) => {
      activityUl([]);
      console.log(rejected);
    });
}

function activityUl(activities) {
  const container = document.querySelector(".schedule .activity");
  const ul = container.querySelector("ul");

  ul.innerHTML = "";
  activities.length ? container.classList.remove("empty") : container.classList.add("empty");

  activities.forEach((e) => {
    const li = document.createElement("li");
    ul.appendChild(li);

    const imgContainer = document.createElement("div");
    imgContainer.className = "img-container";
    li.appendChild(imgContainer);

    const img = document.createElement("img");
    img.src = e.img;
    img.alt = "doctor image";
    imgContainer.appendChild(img);

    const infoBox = document.createElement("div");
    infoBox.className = "info";
    li.appendChild(infoBox);

    const upBox = document.createElement("div");
    infoBox.appendChild(upBox);

    const spanName = document.createElement("span");
    spanName.textContent = e.name;
    upBox.appendChild(spanName);

    const spanDepart = document.createElement("span");
    spanDepart.textContent = e.department;
    upBox.appendChild(spanDepart);

    const spanTime = document.createElement("span");
    spanTime.textContent = e.time;
    infoBox.appendChild(spanTime);
  });
}

updateActivity(selectedDay);
