class Calendar {
  constructor({
    element,
    className = "main-calendar",
    selectedDates = [new Date()],
    multiSelect = false,
    onSelect = () => {},
  }) {
    this.container = typeof element === "string" ? document.querySelector(element) : element;
    this.container.classList.add(className);
    this.multiSelect = multiSelect;
    this.onSelect = onSelect;

    this.selectedDates = selectedDates.map((d) => new Date(d));
    this.displayDate = new Date(
      this.selectedDates[0].getFullYear(),
      this.selectedDates[0].getMonth(),
      1
    );

    this.build();
  }

  build() {
    this.container.innerHTML = "";

    // Header
    this.header = document.createElement("div");
    this.header.className = "calendar-header";

    this.prevBtn = document.createElement("button");
    this.prevBtn.textContent = "<";
    this.prevBtn.onclick = () => this.changeMonth(-1);

    this.monthYearSpan = document.createElement("span");

    this.nextBtn = document.createElement("button");
    this.nextBtn.textContent = ">";
    this.nextBtn.onclick = () => this.changeMonth(1);

    this.header.appendChild(this.prevBtn);
    this.header.appendChild(this.monthYearSpan);
    this.header.appendChild(this.nextBtn);

    // Grid
    this.grid = document.createElement("div");
    this.grid.className = "calendar-grid";

    this.container.appendChild(this.header);
    this.container.appendChild(this.grid);

    this.render();
  }

  render() {
    this.monthYearSpan.textContent = this.displayDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    this.grid.innerHTML = "";

    // Week starts from Saturday
    const daysOfWeek = ["Sa", "Su", "Mo", "Tu", "We", "Th", "Fr"];
    daysOfWeek.forEach((day) => {
      const div = document.createElement("div");
      div.className = "day-header";
      div.textContent = day;
      this.grid.appendChild(div);
    });

    const jsFirstDay = new Date(
      this.displayDate.getFullYear(),
      this.displayDate.getMonth(),
      1
    ).getDay();

    // Shift so Saturday is the first day
    const offset = (jsFirstDay + 1) % 7;

    for (let i = 0; i < offset; i++) {
      this.grid.appendChild(document.createElement("div"));
    }

    const daysInMonth = new Date(
      this.displayDate.getFullYear(),
      this.displayDate.getMonth() + 1,
      0
    ).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.displayDate.getFullYear(), this.displayDate.getMonth(), day);
      const dayDiv = document.createElement("div");
      dayDiv.textContent = day;

      if (this.isSelected(date)) {
        dayDiv.classList.add("selected-day");
      }

      dayDiv.addEventListener("click", () => this.selectDay(date));

      this.grid.appendChild(dayDiv);
    }
  }

  isSameDate(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  isSelected(date) {
    return this.selectedDates.some((d) => this.isSameDate(d, date));
  }

  selectDay(date) {
    if (this.multiSelect) {
      const exists = this.selectedDates.find((d) => this.isSameDate(d, date));
      if (exists) {
        this.selectedDates = this.selectedDates.filter((d) => !this.isSameDate(d, date));
      } else {
        this.selectedDates.push(date);
      }
    } else {
      this.selectedDates = [date];
    }

    const formatShort = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    this.onSelect(this.multiSelect ? this.selectedDates.map(formatShort) : formatShort(date));
    this.render();
  }

  changeMonth(offset) {
    this.displayDate.setMonth(this.displayDate.getMonth() + offset);
    this.render();
  }
}
