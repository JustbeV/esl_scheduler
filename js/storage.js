const Storage = {
  keys: { students: "esl_students", schedules: "esl_schedules", settings: "esl_settings" },
  read(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (error) { console.error("Could not read local data:", error); return fallback; }
  },
  write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (error) { console.error("Could not save local data:", error); Utils.showToast("Storage is full or unavailable. Export a backup and try again."); return false; }
  },
  get students() { return this.read(this.keys.students, []); },
  set students(value) { this.write(this.keys.students, value); },
  get schedules() { return this.read(this.keys.schedules, []); },
  set schedules(value) { this.write(this.keys.schedules, value); },
  get settings() { return this.read(this.keys.settings, { teacherName: "ESL Teacher", defaultDuration: 50 }); },
  set settings(value) { this.write(this.keys.settings, value); },
  exportBackup() {
    const backup = { app: "ESL Scheduler", version: 1, exportedAt: new Date().toISOString(), students: this.students, schedules: this.schedules, settings: this.settings };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `esl-scheduler-backup-${Utils.todayISO()}.json`; a.click();
    URL.revokeObjectURL(url); Utils.showToast("Backup downloaded.");
  },
  async importBackup(file) {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data || data.app !== "ESL Scheduler" || !Array.isArray(data.students) || !Array.isArray(data.schedules) || !data.settings) {
      throw new Error("This file is not a valid ESL Scheduler backup.");
    }
    if (!confirm(`Import ${data.students.length} students and ${data.schedules.length} classes? This will replace the current browser data.`)) return false;
    this.students = data.students; this.schedules = data.schedules; this.settings = data.settings;
    return true;
  }
};
