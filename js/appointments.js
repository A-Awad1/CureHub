window.addEventListener("load", () => {
  const hash = window.location.hash.slice(1);
  if (!["appointments-list", "doctor-schedule"].includes(hash)) return;
  const link = document.querySelector(`.nav-links a[data-section='${hash}']`);
  if (link) {
    link.click();
  } else {
    console.error(`No element found for selector: .nav-links a[data-section='${hash}']`);
  }
});

async function getData() {
  return fetch("/json/db.json")
    .then((res) => res.json())
    .then((res) => {
      return {
        requests: res.appointmentsRequest,
        list: res.appointmentsList,
        schedule: res.schedule,
      };
    })
    .catch((rejected) => console.log(rejected));
}

getData().then((data) => {
  const dataSources = {
    "appointments-request": data.requests,
    "appointments-list": data.list,
    "doctor-schedule": data.schedule,
  };
  const constHeader = ["patient name", "gender", "department", "doctor", "time", "date", "status"];
  const headers = {
    "appointments-request": constHeader,
    "appointments-list": constHeader,
    "doctor-schedule": [],
  };

  const table = document.querySelector(".appointments-table");
  const tbody = table.querySelector("tbody");
  const tHead = table.querySelector("thead tr");
  const pagination = document.querySelector(".pagination");
  const navLinks = document.querySelectorAll(".nav-links a");
  const calendarElement = document.querySelector(".appointments .calender-container");
  const calendarPopup = document.querySelector(".calendar-popup");
  const monthNameSpan = document.querySelector(".month-name span");
  const itemsPerPage = 10;
  let currentPage = 1;
  let currentSection = "appointments-request";
  let currentData = dataSources[currentSection];
  let calendar;

  function updateTableHeaders(section) {
    tHead.innerHTML = headers[section].map((e) => `<th>${e}</th>`).join("");
  }

  function renderTable(page, sectionData) {
    if (currentSection === "doctor-schedule") {
      table.classList.add("hidden-part");
      pagination.classList.add("hidden-part");
      calendarElement.classList.remove("hidden-part");
      calendarPopup.classList.add("hidden-part");
      if (calendar) return;

      calendar = new FullCalendar.Calendar(calendarElement, {
        initialView: "dayGridMonth",
        initialDate: "2024-11-05",
        headerToolbar: false,
        firstDay: 6,
        contentHeight: 696,
        dayHeaderFormat: { weekday: "long" },
        events: sectionData,
        eventContent: function (arg) {
          const img = arg.event.extendedProps.img;
          const time = arg.event.extendedProps.time;
          const title = arg.event.title;
          return {
            html: `
            <div class="day-box ${arg.event.classNames.join(" ")}">
              <div class="img-container">
                <img src="/assets/images/${img}"/>
              </div>
              <div class="time">${time}</div>
              <div class="title">${title}</div>
            </div>
          `,
          };
        },
      });
      calendar.render();

      function formatDate(dateStr) {
        const [year, month, day] = dateStr.split("-");
        const paddedMonth = month.padStart(2, "0");
        const paddedDay = day.padStart(2, "0");
        return `${year}-${paddedMonth}-${paddedDay}`;
      }

      document.querySelector(".month-name").addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        calendarPopup.classList.remove("hidden-part");
      });

      calendarPopup
        .querySelector(".overlay")
        .addEventListener("click", () => calendarPopup.classList.add("hidden-part"));

      const start = new Date("2024-11-01");
      const end = new Date("2024-11-25");
      const dates = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }

      new Calendar({
        element: "#appoints-calendar",
        selectedDates: dates,
        multiSelect: true,
        onSelect: (dates) => {
          const targetDate = formatDate(dates[dates.length - 1]);
          const monthName = new Date(targetDate).toLocaleString("default", { month: "long" });
          calendar.gotoDate(targetDate);
          monthNameSpan.textContent = monthName;
        },
      });
      return;
    }
    table.classList.remove("hidden-part");
    pagination.classList.remove("hidden-part");
    calendarElement.classList.add("hidden-part");
    calendarPopup.classList.add("hidden-part");
    monthNameSpan.textContent = "november";
    if (calendar) {
      calendar.destroy();
      calendar = null;
    }

    tbody.innerHTML = "";
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = sectionData.slice(start, end);

    paginatedData.forEach(({ patientName, gender, department, doctor, time, date, status }) => {
      const row = document.createElement("tr");

      const createCell = (text) => {
        const td = document.createElement("td");
        td.textContent = text;
        return td;
      };

      row.appendChild(createCell(patientName));
      row.appendChild(createCell(gender));
      row.appendChild(createCell(department));
      row.appendChild(createCell(doctor));
      row.appendChild(createCell(time));
      row.appendChild(createCell(date));

      const statusCell = document.createElement("td");
      const statusDiv = document.createElement("div");
      statusDiv.className = "status";

      if (currentSection === "appointments-request") {
        const confirmBtn = document.createElement("button");
        confirmBtn.className = "confirmed";
        const confirmIcon = document.createElement("img");
        confirmIcon.src = "/assets/svg/check.svg";
        confirmBtn.appendChild(confirmIcon);
        statusDiv.appendChild(confirmBtn);

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "canceled";
        const cancelIcon = document.createElement("img");
        cancelIcon.src = "/assets/svg/xMark.svg";
        cancelBtn.appendChild(cancelIcon);
        statusDiv.appendChild(cancelBtn);
      } else {
        const confirmedSpan = document.createElement("span");
        const result = status === "confirmed" ? "confirmed" : "canceled";
        confirmedSpan.className = result;
        confirmedSpan.textContent = result;
        statusDiv.appendChild(confirmedSpan);
      }

      const dotsBtn = document.createElement("button");
      dotsBtn.className = "options";
      const dotsIcon = document.createElement("img");
      dotsIcon.src = "/assets/svg/dots.svg";
      dotsBtn.appendChild(dotsIcon);
      statusDiv.appendChild(dotsBtn);

      statusCell.appendChild(statusDiv);
      row.appendChild(statusCell);
      tbody.appendChild(row);
    });

    renderPagination(sectionData);
  }

  function renderPagination(sectionData) {
    const totalPages = Math.ceil(sectionData.length / itemsPerPage);
    pagination.innerHTML = "";

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "<";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable(currentPage, currentData);
      }
    });
    pagination.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.classList.toggle("active", i === currentPage);
      btn.addEventListener("click", () => {
        currentPage = i;
        renderTable(currentPage, currentData);
      });
      pagination.appendChild(btn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.textContent = ">";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTable(currentPage, currentData);
      }
    });
    pagination.appendChild(nextBtn);
  }

  function handleNavigation(section) {
    if (!dataSources[section]) return;
    currentSection = section;
    currentData = dataSources[section];
    currentPage = 1;

    navLinks.forEach((link) => link.classList.remove("active"));
    document.querySelector(`[data-section="${section}"]`).classList.add("active");

    updateTableHeaders(section);
    renderTable(currentPage, currentData);
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const section = link.getAttribute("data-section");
      handleNavigation(section);
    });
  });

  updateTableHeaders(currentSection);
  renderTable(currentPage, currentData);
});
