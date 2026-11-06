const App = {
  init() {
    Calendar.init();
    this.bindEvents();
    this.renderAll();
    const settings = Storage.settings;
    document.getElementById("teacherNameInput").value = settings.teacherName || "ESL Teacher";
    document.getElementById("defaultDuration").value = String(settings.defaultDuration || 50);
    document.getElementById("sidebarTeacherName").textContent = settings.teacherName || "ESL Teacher";
    document.getElementById("todayLabel").textContent = new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
  },
  bindEvents() {
    document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>this.go(b.dataset.page)));
    document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>this.go(b.dataset.go)));
    ["topAddClass","dashboardAddClass","calendarAddClass","classesAddClass","quickSchedule"].forEach(id=>document.getElementById(id).addEventListener("click",()=>Schedules.openModal()));
    ["quickStudent","addStudentButton"].forEach(id=>document.getElementById(id).addEventListener("click",()=>Students.openModal()));
    document.getElementById("quickBackup").addEventListener("click",()=>Storage.exportBackup());
    document.getElementById("modalClose").addEventListener("click",()=>Schedules.closeModal());
    document.getElementById("cancelModal").addEventListener("click",()=>Schedules.closeModal());
    document.getElementById("studentModalClose").addEventListener("click",()=>Students.closeModal());
    document.getElementById("studentCancel").addEventListener("click",()=>Students.closeModal());
    document.getElementById("classForm").addEventListener("submit",e=>Schedules.save(e));
    document.getElementById("studentForm").addEventListener("submit",e=>Students.save(e));
    document.getElementById("classStudentType").addEventListener("change",()=>Schedules.populateStudentSelect());
    document.getElementById("classMode").addEventListener("change",()=>Schedules.updateModeField());
    document.getElementById("studentSearch").addEventListener("input",()=>Students.render());
    document.getElementById("studentTypeFilter").addEventListener("change",()=>Students.render());
    ["classSearch","classStatusFilter","classModeFilter"].forEach(id=>document.getElementById(id).addEventListener(id==="classSearch"?"input":"change",()=>Schedules.renderTable()));
    document.getElementById("calendarPrev").addEventListener("click",()=>Calendar.move(-1));
    document.getElementById("calendarNext").addEventListener("click",()=>Calendar.move(1));
    document.getElementById("calendarToday").addEventListener("click",()=>Calendar.goToday());
    document.querySelectorAll(".view-button").forEach(b=>b.addEventListener("click",()=>Calendar.changeView(b.dataset.view)));
    document.getElementById("settingsForm").addEventListener("submit",e=>{
      e.preventDefault(); Storage.settings = {teacherName:document.getElementById("teacherNameInput").value.trim() || "ESL Teacher", defaultDuration:Number(document.getElementById("defaultDuration").value)};
      document.getElementById("sidebarTeacherName").textContent = Storage.settings.teacherName; this.renderAll(); Utils.showToast("Settings saved.");
    });
    document.getElementById("exportButton").addEventListener("click",()=>Storage.exportBackup());
    document.getElementById("importInput").addEventListener("change",async e=>{
      const file=e.target.files[0]; if(!file)return;
      try { const imported=await Storage.importBackup(file); if(imported){this.renderAll();Utils.showToast("Backup restored.");} }
      catch(err){alert(err.message || "Could not import this file.");}
      e.target.value="";
    });
    document.getElementById("mobileMenu").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
    document.getElementById("profileButton").addEventListener("click",()=>this.go("settings"));
    document.getElementById("modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")Schedules.closeModal();});
    document.getElementById("studentModalBackdrop").addEventListener("click",e=>{if(e.target.id==="studentModalBackdrop")Students.closeModal();});
    document.addEventListener("keydown",e=>{if(e.key==="Escape"){Schedules.closeModal();Students.closeModal();}});
    document.addEventListener("click",e=>{
      const editStudent=e.target.closest("[data-edit-student]"); if(editStudent){const s=Storage.students.find(x=>x.id===editStudent.dataset.editStudent);Students.openModal(s);return;}
      const delStudent=e.target.closest("[data-delete-student]"); if(delStudent){Students.delete(delStudent.dataset.deleteStudent);return;}
      const editClass=e.target.closest("[data-edit-class]"); if(editClass){const c=Storage.schedules.find(x=>x.id===editClass.dataset.editClass);Schedules.openModal(c);return;}
      const delClass=e.target.closest("[data-delete-class]"); if(delClass){Schedules.delete(delClass.dataset.deleteClass);return;}
      const calendarClass=e.target.closest("[data-calendar-class]"); if(calendarClass){const c=Storage.schedules.find(x=>x.id===calendarClass.dataset.calendarClass);Schedules.openModal(c);return;}
      const day=e.target.closest("[data-calendar-date]");
      if(day && !e.target.closest("[data-calendar-class]")){const date=day.dataset.calendarDate;const hour=day.dataset.calendarHour;if(hour){Schedules.openModal(null,date);document.getElementById("classStart").value=`${hour}:00`;document.getElementById("classEnd").value=Schedules.addMinutes(`${hour}:00`,Number(Storage.settings.defaultDuration||50));}else if(Calendar.view==="month"){Schedules.openModal(null,date);}else{Calendar.cursor=Utils.dateFromISO(date);Calendar.view="day";Calendar.render();}}
    });
    document.addEventListener("change",e=>{
      const status=e.target.closest("[data-status-class]");if(status&&status.value){Schedules.setStatus(status.dataset.statusClass,status.value);}
    });
  },
  go(page) {
    document.querySelectorAll(".page-section").forEach(s=>s.classList.toggle("active",s.id===`page-${page}`));
    document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
    const labels={dashboard:"Dashboard",calendar:"Calendar",students:"Students",classes:"Classes",reports:"Reports",settings:"Settings"};
    document.getElementById("pageCrumb").textContent=labels[page]||"Dashboard";
    document.getElementById("sidebar").classList.remove("open");
    if(page==="calendar")Calendar.render(); if(page==="students")Students.render(); if(page==="classes")Schedules.renderTable();
  },
  renderAll() {
    Dashboard.render(); Students.render(); Schedules.renderTable(); Calendar.render();
  }
};
document.addEventListener("DOMContentLoaded",()=>App.init());
