const Calendar = {
  cursor: new Date(),
  view: "month",
  init() { this.cursor = new Date(); this.cursor.setHours(0,0,0,0); },
  changeView(view) { this.view = view; this.render(); },
  move(amount) {
    if (this.view === "month") this.cursor.setMonth(this.cursor.getMonth()+amount);
    else if (this.view === "week") this.cursor.setDate(this.cursor.getDate()+amount*7);
    else this.cursor.setDate(this.cursor.getDate()+amount);
    this.render();
  },
  goToday() { this.cursor = new Date(); this.cursor.setHours(0,0,0,0); this.render(); },
  iso(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; },
  classesFor(date) { return Storage.schedules.filter(c => c.date === this.iso(date)).sort((a,b)=>a.startTime.localeCompare(b.startTime)); },
  render() {
    const title = document.getElementById("calendarTitle"), content = document.getElementById("calendarContent");
    if (!title || !content) return;
    document.querySelectorAll(".view-button").forEach(b => b.classList.toggle("active", b.dataset.view === this.view));
    if (this.view === "month") {
      title.textContent = this.cursor.toLocaleDateString(undefined,{month:"long",year:"numeric"});
      this.renderMonth(content);
    } else if (this.view === "week") {
      const start = this.weekStart(this.cursor), end = new Date(start); end.setDate(end.getDate()+6);
      title.textContent = `${start.toLocaleDateString(undefined,{month:"short",day:"numeric"})} – ${end.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}`;
      this.renderWeek(content, start);
    } else {
      title.textContent = this.cursor.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"});
      this.renderDay(content, this.cursor);
    }
  },
  weekStart(date) { const d = new Date(date); d.setDate(d.getDate()-d.getDay()); d.setHours(0,0,0,0); return d; },
  renderMonth(root) {
    const first = new Date(this.cursor.getFullYear(),this.cursor.getMonth(),1);
    const start = this.weekStart(first);
    let html = `<div class="calendar-grid">${["SUN","MON","TUE","WED","THU","FRI","SAT"].map(d=>`<div class="calendar-weekday">${d}</div>`).join("")}`;
    const today = Utils.todayISO();
    for (let i=0;i<42;i++) {
      const d = new Date(start); d.setDate(start.getDate()+i);
      const iso = this.iso(d), events = this.classesFor(d);
      html += `<div class="calendar-day ${d.getMonth()!==this.cursor.getMonth()?"outside":""} ${iso===today?"today":""}" data-calendar-date="${iso}"><div class="day-number"><span>${d.getDate()}</span></div>`;
      events.slice(0,3).forEach(c => html += `<div class="calendar-event ${c.mode==="onsite"?"onsite":""} ${c.status}" data-calendar-class="${c.id}" title="${Utils.escapeHTML(c.topic)}">${Utils.formatTime(c.startTime)} ${Utils.escapeHTML(Schedules.classNames(c))}</div>`);
      if (events.length>3) html += `<div class="calendar-more">+${events.length-3} more</div>`;
      html += `</div>`;
    }
    root.innerHTML = html + `</div>`;
  },
  renderWeek(root, start) {
    const days = Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d;});
    let html = `<div class="calendar-grid">${days.map(d=>`<div class="calendar-weekday">${d.toLocaleDateString(undefined,{weekday:"short"}).toUpperCase()}<br>${d.getDate()}</div>`).join("")}</div><div class="time-grid">`;
    for (let hour=7;hour<=21;hour++) {
      html += `<div class="time-label">${String(hour%12||12)} ${hour<12?"AM":"PM"}</div><div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr))">`;
      days.forEach(d=>{
        const events = this.classesFor(d).filter(c=>Number(c.startTime.slice(0,2))===hour);
        html += `<div class="time-slot" data-calendar-date="${this.iso(d)}" data-calendar-hour="${String(hour).padStart(2,"0")}">${events.map(c=>`<div class="time-event ${c.mode==="onsite"?"onsite":""} ${c.status}" data-calendar-class="${c.id}">${Utils.formatTime(c.startTime)} ${Utils.escapeHTML(Schedules.classNames(c))}</div>`).join("")}</div>`;
      });
      html += `</div>`;
    }
    root.innerHTML = html + `</div>`;
  },
  renderDay(root, date) {
    const events = this.classesFor(date);
    let html = `<div class="time-grid">`;
    for (let hour=7;hour<=21;hour++) {
      const items = events.filter(c=>Number(c.startTime.slice(0,2))===hour);
      html += `<div class="time-label">${String(hour%12||12)} ${hour<12?"AM":"PM"}</div><div class="time-slot" data-calendar-date="${this.iso(date)}" data-calendar-hour="${String(hour).padStart(2,"0")}">${items.map(c=>`<div class="time-event ${c.mode==="onsite"?"onsite":""} ${c.status}" data-calendar-class="${c.id}">${Utils.formatTime(c.startTime)}–${Utils.formatTime(c.endTime)} · ${Utils.escapeHTML(Schedules.classNames(c))}<br>${Utils.escapeHTML(c.topic)}</div>`).join("")}</div>`;
    }
    root.innerHTML = html + `</div>`;
  }
};
