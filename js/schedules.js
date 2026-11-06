const Schedules = {
  openModal(schedule = null, date = null) {
    const form = document.getElementById("classForm"); form.reset();
    document.getElementById("classId").value = schedule?.id || "";
    document.getElementById("modalTitle").textContent = schedule ? "Edit class" : "Schedule a class";
    document.getElementById("classDate").value = schedule?.date || date || Utils.todayISO();
    document.getElementById("classMode").value = schedule?.mode || "online";
    document.getElementById("classStudentType").value = schedule?.studentType || "individual";
    document.getElementById("classTopic").value = schedule?.topic || "";
    const defaultDuration = Number(Storage.settings.defaultDuration || 50);
    const start = schedule?.startTime || "09:00";
    document.getElementById("classStart").value = start;
    document.getElementById("classEnd").value = schedule?.endTime || this.addMinutes(start, defaultDuration);
    document.getElementById("classLocation").value = schedule?.location || "";
    document.getElementById("classNotes").value = schedule?.notes || "";
    document.getElementById("conflictMessage").hidden = true;
    this.populateStudentSelect(schedule?.studentIds || []);
    this.updateModeField();
    document.getElementById("modalBackdrop").hidden = false;
    document.getElementById("classTopic").focus();
  },
  addMinutes(time, mins) {
    const [h,m] = time.split(":").map(Number); const total = h*60+m+mins;
    return `${String(Math.floor(total/60)%24).padStart(2,"0")}:${String(total%60).padStart(2,"0")}`;
  },
  closeModal() { document.getElementById("modalBackdrop").hidden = true; },
  populateStudentSelect(selected = []) {
    const type = document.getElementById("classStudentType").value;
    const select = document.getElementById("classStudent");
    const students = Storage.students.filter(s => s.type === type);
    select.multiple = type === "group";
    select.size = type === "group" ? Math.min(Math.max(students.length, 2), 4) : 1;
    select.innerHTML = students.map(s => `<option value="${s.id}" ${selected.includes(s.id) ? "selected" : ""}>${Utils.escapeHTML(s.name)}</option>`).join("");
    if (!students.length) select.innerHTML = `<option value="">No ${type === "group" ? "groups" : "individual students"} yet. Add one first.</option>`;
    document.getElementById("studentSelectLabel").innerHTML = type === "group" ? "Group(s) <small style='font-weight:400;color:#929cad'>You can select multiple groups.</small>" : "Student";
    document.getElementById("studentSelectLabel").appendChild(select);
  },
  updateModeField() {
    const mode = document.getElementById("classMode").value;
    const label = document.getElementById("locationLabel");
    label.innerHTML = mode === "online" ? "Meeting link <small style='font-weight:400;color:#929cad'>Optional</small>" : "Location <small style='font-weight:400;color:#929cad'>Optional</small>";
    const input = document.createElement("input");
    input.type = mode === "online" ? "url" : "text"; input.id = "classLocation";
    input.placeholder = mode === "online" ? "https://..." : "Classroom or meeting address";
    label.appendChild(input);
  },
  getSelectedIds() {
    return [...document.getElementById("classStudent").selectedOptions].map(o => o.value).filter(Boolean);
  },
  findConflicts(date, start, end, excludeId) {
    return Storage.schedules.filter(c => c.id !== excludeId && c.date === date && c.status !== "cancelled" && start < c.endTime && end > c.startTime);
  },
  save(event) {
    event.preventDefault();
    const id = document.getElementById("classId").value;
    const date = document.getElementById("classDate").value;
    const startTime = document.getElementById("classStart").value;
    const endTime = document.getElementById("classEnd").value;
    const studentIds = this.getSelectedIds();
    const message = document.getElementById("conflictMessage");
    message.hidden = true; message.classList.remove("error");
    if (!studentIds.length) { message.textContent = "Add a matching student or group before scheduling this class."; message.hidden = false; message.classList.add("error"); return; }
    if (!date || !startTime || !endTime || Utils.duration(startTime, endTime) <= 0) {
      message.textContent = "Please choose a valid date and an end time later than the start time."; message.hidden = false; message.classList.add("error"); return;
    }
    const conflicts = this.findConflicts(date, startTime, endTime, id);
    if (conflicts.length) {
      message.textContent = `Schedule conflict: this overlaps with ${conflicts.map(c => `${Utils.formatTime(c.startTime)} ${this.classNames(c)}`).join(", ")}. You can still save if this overlap is intentional.`;
      message.hidden = false;
      if (!confirm(message.textContent + "\n\nSave anyway?")) return;
    }
    const record = {
      id: id || `cls_${Date.now()}`, studentIds,
      studentType: document.getElementById("classStudentType").value,
      mode: document.getElementById("classMode").value,
      date, startTime, endTime,
      topic: document.getElementById("classTopic").value.trim(),
      location: document.getElementById("classLocation").value.trim(),
      notes: document.getElementById("classNotes").value.trim(),
      status: id ? (Storage.schedules.find(c => c.id === id)?.status || "upcoming") : "upcoming",
      updatedAt: new Date().toISOString()
    };
    const list = Storage.schedules, index = list.findIndex(c => c.id === id);
    if (index >= 0) list[index] = {...list[index], ...record}; else list.push({...record, createdAt:new Date().toISOString()});
    Storage.schedules = list; this.closeModal(); App.renderAll(); Utils.showToast(id ? "Class updated." : "Class scheduled.");
  },
  classNames(c) {
    return (c.studentIds || []).map(id => Storage.students.find(s => s.id === id)?.name || "Archived student").join(", ");
  },
  setStatus(id, status) {
    const list = Storage.schedules; const item = list.find(c => c.id === id);
    if (!item) return; item.status = status; item.updatedAt = new Date().toISOString();
    Storage.schedules = list; App.renderAll(); Utils.showToast(`Class marked ${Utils.statusLabel(status).toLowerCase()}.`);
  },
  delete(id) {
    if (!confirm("Delete this class permanently?")) return;
    Storage.schedules = Storage.schedules.filter(c => c.id !== id);
    App.renderAll(); Utils.showToast("Class deleted.");
  },
  renderTable() {
    const tbody = document.getElementById("classesTable"); if (!tbody) return;
    const q = (document.getElementById("classSearch")?.value || "").toLowerCase();
    const status = document.getElementById("classStatusFilter")?.value || "all";
    const mode = document.getElementById("classModeFilter")?.value || "all";
    const list = [...Storage.schedules].filter(c => {
      const name = this.classNames(c);
      return (status === "all" || c.status === status) && (mode === "all" || c.mode === mode) && `${name} ${c.topic}`.toLowerCase().includes(q);
    }).sort((a,b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
    if (!list.length) { tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><strong>No classes found</strong>Schedule a lesson to see it here.</div></td></tr>`; return; }
    tbody.innerHTML = list.map(c => `<tr><td><div class="person-cell"><span class="person-avatar">${Utils.escapeHTML(Utils.initials(this.classNames(c)))}</span><span><strong>${Utils.escapeHTML(this.classNames(c))}</strong><small>${c.studentType === "group" ? "Group class" : "Individual lesson"}</small></span></div></td><td>${Utils.formatDate(c.date,{month:"short",day:"numeric",year:"numeric"})}<br><small>${Utils.formatTime(c.startTime)} – ${Utils.formatTime(c.endTime)}</small></td><td>${Utils.escapeHTML(c.topic)}</td><td><span class="mode-tag mode-${c.mode}">${Utils.modeLabel(c.mode)}</span></td><td><span class="status status-${c.status}">${Utils.statusLabel(c.status)}</span></td><td><button class="action-button" data-edit-class="${c.id}">Edit</button><button class="action-button danger" data-delete-class="${c.id}">Delete</button><select aria-label="Change class status" data-status-class="${c.id}" style="max-width:105px;padding:5px;border:1px solid #e5e9f0;border-radius:6px;font-size:10px"><option value="">Status...</option><option value="upcoming">Upcoming</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="no-show">No-show</option></select></td></tr>`).join("");
  }
};
