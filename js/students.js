const Students = {
  openModal(student = null) {
    document.getElementById("studentForm").reset();
    document.getElementById("studentId").value = student?.id || "";
    document.getElementById("studentModalTitle").textContent = student ? "Edit student" : "Add student";
    document.getElementById("studentName").value = student?.name || "";
    document.getElementById("studentType").value = student?.type || "individual";
    document.getElementById("studentContact").value = student?.contact || "";
    document.getElementById("studentCountry").value = student?.country || "";
    document.getElementById("studentNotes").value = student?.notes || "";
    document.getElementById("studentModalBackdrop").hidden = false;
    document.getElementById("studentName").focus();
  },
  closeModal() { document.getElementById("studentModalBackdrop").hidden = true; },
  save(event) {
    event.preventDefault();
    const id = document.getElementById("studentId").value;
    const student = {
      id: id || `stu_${Date.now()}`,
      name: document.getElementById("studentName").value.trim(),
      type: document.getElementById("studentType").value,
      contact: document.getElementById("studentContact").value.trim(),
      country: document.getElementById("studentCountry").value.trim(),
      notes: document.getElementById("studentNotes").value.trim(),
      updatedAt: new Date().toISOString()
    };
    if (!student.name) return;
    const list = Storage.students;
    const index = list.findIndex(s => s.id === id);
    if (index >= 0) list[index] = {...list[index], ...student};
    else list.push({...student, createdAt: new Date().toISOString()});
    Storage.students = list;
    this.closeModal(); App.renderAll(); Utils.showToast(id ? "Student updated." : "Student added.");
  },
  render() {
    const grid = document.getElementById("studentGrid");
    if (!grid) return;
    const query = (document.getElementById("studentSearch")?.value || "").toLowerCase();
    const type = document.getElementById("studentTypeFilter")?.value || "all";
    const students = Storage.students.filter(s => (type === "all" || s.type === type) && `${s.name} ${s.contact} ${s.country}`.toLowerCase().includes(query));
    if (!students.length) {
      grid.innerHTML = `<div class="panel empty-state" style="grid-column:1/-1"><strong>No students found</strong>Add a student or adjust your search.</div>`;
      return;
    }
    grid.innerHTML = students.map(s => {
      const count = Storage.schedules.filter(c => c.studentIds?.includes(s.id)).length;
      return `<article class="student-card"><div class="student-card-top"><span class="person-avatar">${Utils.escapeHTML(Utils.initials(s.name))}</span><div><h3>${Utils.escapeHTML(s.name)}</h3><div class="student-sub">${s.type === "group" ? "Group class" : "Individual student"}</div></div></div><p>${Utils.escapeHTML(s.country || s.contact || s.notes || "No additional details yet.")}</p><div class="student-card-bottom"><small>${count} ${count === 1 ? "lesson" : "lessons"}</small><div class="student-actions"><button class="action-button" data-edit-student="${s.id}">Edit</button><button class="action-button danger" data-delete-student="${s.id}">Delete</button></div></div></article>`;
    }).join("");
  },
  delete(id) {
    const student = Storage.students.find(s => s.id === id);
    if (!student) return;
    if (!confirm(`Delete "${student.name}"? Classes linked to this student will remain in your records but show an archived name.`)) return;
    Storage.students = Storage.students.filter(s => s.id !== id);
    App.renderAll(); Utils.showToast("Student deleted.");
  }
};
