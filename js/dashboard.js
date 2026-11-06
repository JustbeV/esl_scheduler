const Dashboard = {
  render() {
    const students = Storage.students, classes = Storage.schedules, today = Utils.todayISO();
    document.getElementById("statStudents").textContent = students.length;
    document.getElementById("statToday").textContent = classes.filter(c=>c.date===today && c.status==="upcoming").length;
    document.getElementById("statUpcoming").textContent = classes.filter(c=>c.status==="upcoming" && c.date>=today).length;
    document.getElementById("statCompleted").textContent = classes.filter(c=>c.status==="completed").length;
    const now = new Date();
    document.getElementById("welcomeTitle").textContent = `Good ${now.getHours()<12?"morning":now.getHours()<18?"afternoon":"evening"}, ${Storage.settings.teacherName || "Teacher"}!`;
    document.getElementById("welcomeDate").textContent = now.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"}).toUpperCase();
    const todayClasses = classes.filter(c=>c.date===today).sort((a,b)=>a.startTime.localeCompare(b.startTime));
    const list = document.getElementById("todaySchedule");
    if (!todayClasses.length) list.innerHTML = `<div class="empty-state"><strong>No classes scheduled today</strong>Enjoy the open time or add a lesson.</div>`;
    else list.innerHTML = todayClasses.map(c=>`<div class="schedule-item"><div class="schedule-time"><strong>${Utils.formatTime(c.startTime)}</strong>${Utils.formatTime(c.endTime)}</div><div class="schedule-accent ${c.mode==="onsite"?"onsite":""}"></div><div class="schedule-info"><strong>${Utils.escapeHTML(Schedules.classNames(c))}</strong><small>${Utils.escapeHTML(c.topic)} · ${Utils.modeLabel(c.mode)}</small></div><span class="status status-${c.status}">${Utils.statusLabel(c.status)}</span></div>`).join("");
    const upcoming = classes.filter(c=>c.status==="upcoming" && c.date>=today).sort((a,b)=>`${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)).slice(0,5);
    const tbody = document.getElementById("upcomingTable");
    if (!upcoming.length) tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><strong>No upcoming classes</strong>Your next scheduled lessons will appear here.</div></td></tr>`;
    else tbody.innerHTML = upcoming.map(c=>`<tr><td><div class="person-cell"><span class="person-avatar">${Utils.escapeHTML(Utils.initials(Schedules.classNames(c)))}</span><span><strong>${Utils.escapeHTML(Schedules.classNames(c))}</strong><small>${c.studentType==="group"?"Group class":"Individual lesson"}</small></span></div></td><td>${Utils.formatDate(c.date,{month:"short",day:"numeric"})}<br><small>${Utils.formatTime(c.startTime)} – ${Utils.formatTime(c.endTime)}</small></td><td>${Utils.escapeHTML(c.topic)}</td><td><span class="mode-tag mode-${c.mode}">${Utils.modeLabel(c.mode)}</span></td><td><span class="status status-${c.status}">${Utils.statusLabel(c.status)}</span></td></tr>`).join("");
    const counts = ["upcoming","completed","cancelled","no-show"].map(s=>[s,classes.filter(c=>c.status===s).length]);
    document.getElementById("reportAll").textContent = classes.length;
    document.getElementById("reportDone").textContent = counts[1][1];
    document.getElementById("reportCancelled").textContent = counts[2][1];
    document.getElementById("reportNoShow").textContent = counts[3][1];
    const total = Math.max(classes.length,1);
    document.getElementById("reportBreakdown").innerHTML = counts.map(([s,n])=>`<div class="breakdown-row"><span>${Utils.statusLabel(s)}</span><div class="breakdown-track"><div class="breakdown-fill ${s}" style="width:${n/total*100}%"></div></div><strong>${n}</strong></div>`).join("");
  }
};
