const Utils = {
  todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  },
  dateFromISO(value) {
    const [y,m,d] = value.split("-").map(Number);
    return new Date(y, m-1, d);
  },
  formatDate(value, options = { month: "short", day: "numeric", year: "numeric" }) {
    if (!value) return "";
    return this.dateFromISO(value).toLocaleDateString(undefined, options);
  },
  formatTime(value) {
    if (!value) return "";
    const [h,m] = value.split(":").map(Number);
    const d = new Date(); d.setHours(h,m,0,0);
    return d.toLocaleTimeString([], {hour:"numeric", minute:"2-digit"});
  },
  initials(name) {
    return String(name || "?").trim().split(/\s+/).slice(0,2).map(x => x[0]).join("").toUpperCase();
  },
  escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  },
  duration(start, end) {
    const [sh,sm] = start.split(":").map(Number), [eh,em] = end.split(":").map(Number);
    return (eh*60+em) - (sh*60+sm);
  },
  showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message; toast.classList.add("show");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  },
  statusLabel(status) {
    return ({ "upcoming":"Upcoming", "completed":"Completed", "cancelled":"Cancelled", "no-show":"No-show" })[status] || status;
  },
  modeLabel(mode) { return mode === "onsite" ? "Face-to-face" : "Online"; }
};
