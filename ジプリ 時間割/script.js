"use strict";
// ==========================
// 教科リスト
// ==========================
const firstSubject = [
    "国語","数学","電気","工管","製図","機械工作",
    "社会倫理","英語","セミナー","スクーリング",
    "安全","工業技術基礎","クラブ","学び","テスト","訓練"
];
const secondSubject = [
    "国語","数学","電気","工管","英語","スクーリング",
    "製図","工作","書道・美術","ALT","セミナー",
    "社会倫理","自動車工学","自動車力学","クラブ",
    "学び","テスト","訓練","職場"
];
const thirdSubject = [
    "国語","自動車工学","自動車力学","ALT","製図",
    "機械工作","社会倫理","スクーリング","情報",
    "セミナー","クラブ","学び","テスト","訓練","職場"
];
// クラス名表示用
const CLASS_LABEL = { classA: "A組", classB: "B組", classC: "C組", classD: "D組" };
// 管理者パスワード（必要に応じて変更）
const ADMIN_PASSWORD = "1234";
// 初期フラグ
let isAdmin = false;
// ==========================
// DOM
// ==========================
const roleModal = document.getElementById("roleModal");
const chooseAdminBtn = document.getElementById("chooseAdminBtn");
const chooseViewerBtn = document.getElementById("chooseViewerBtn");
const adminPwdArea = document.getElementById("adminPwdArea");
const adminPwdInput = document.getElementById("adminPwdInput");
const adminPwdSubmit = document.getElementById("adminPwdSubmit");
const adminPwdCancel = document.getElementById("adminPwdCancel");
const pwdError = document.getElementById("pwdError");
const mainContent = document.getElementById("mainContent");
const gradeSelect = document.getElementById("grade");
const classSelect = document.getElementById("class");
const timeCells   = document.querySelectorAll(".time");
const dateInput      = document.getElementById("date");
const readConfirmBtn = document.getElementById("readConfirmBtn");
const undoReadBtn    = document.getElementById("undoReadBtn");
const readStatus     = document.getElementById("readStatus");
const readStats      = document.getElementById("readStats");
const currentClassLabelEl = document.getElementById("currentClassLabel");
const readCountEl    = document.getElementById("readCount");
const classReadStatsDiv = document.getElementById("classReadStats");
const clsACountEl   = document.getElementById("clsACount");
const clsBCountEl   = document.getElementById("clsBCount");
const clsCCountEl   = document.getElementById("clsCCount");
const clsDCountEl   = document.getElementById("clsDCount");
const prevWeekBtn    = document.getElementById("prevWeekBtn");
const thisWeekBtn    = document.getElementById("thisWeekBtn");
const nextWeekBtn    = document.getElementById("nextWeekBtn");
const hdrMon = document.getElementById("hdr-mon");
const hdrTue = document.getElementById("hdr-tue");
const hdrWed = document.getElementById("hdr-wed");
const hdrThu = document.getElementById("hdr-thu");
const hdrFri = document.getElementById("hdr-fri");
// ==========================
// 保存済み時間割の読み込み
// ==========================
const savedTimetables = JSON.parse(localStorage.getItem("timetables") || "{}");
const readData = JSON.parse(localStorage.getItem("reads") || "{}");
const myReads = JSON.parse(localStorage.getItem("myReads") || "{}");
let announcements = JSON.parse(localStorage.getItem("announcements") || "null");
if (!announcements) {
  announcements = {
    first: [
      "new★ 1年生：9月25日の国語は保護メガネが必要です。",
      "new★ 1年生：体育は体育館で行います。"
    ],
    second: [
      "new★ 2年生：9月35日の数学は数字ブロックと計算カードが必要です。",
      "new★ 2年生：緊急9月89日は休校になります。"
    ],
    third: [
      "new★ 3年生：自動車工学レポートの締切は9月30日です。",
      "new★ 3年生：スクーリングの日程が変更されました。"
    ]
  };
}
// ==========================
// ヘルパー
// ==========================
function showMainContent() {
  roleModal.style.display = "none";
  roleModal.setAttribute("aria-hidden", "true");
  mainContent.style.display = "";
  mainContent.setAttribute("aria-hidden", "false");
}
function showRoleModal() {
  roleModal.style.display = "flex";
  roleModal.setAttribute("aria-hidden", "false");
  mainContent.style.display = "none";
  mainContent.setAttribute("aria-hidden", "true");
  chooseAdminBtn.focus();
}
function toISODateString(date) {
    const year  = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day   = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
function formatDateShort(d) {
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${m}/${day}日`;
}
// ==========================
// モーダルの動作
// ==========================
chooseAdminBtn.addEventListener("click", () => {
  adminPwdArea.style.display = "block";
  pwdError.style.display = "none";
  adminPwdInput.value = "";
  adminPwdInput.focus();
  chooseAdminBtn.disabled = true;
  chooseViewerBtn.disabled = true;
});
chooseViewerBtn.addEventListener("click", () => {
  isAdmin = false;
  initializeAfterRoleSelection();
  showMainContent();
});
adminPwdCancel.addEventListener("click", () => {
  // キャンセル→閲覧者として続行
  isAdmin = false;
  initializeAfterRoleSelection();
  showMainContent();
  chooseAdminBtn.disabled = false;
  chooseViewerBtn.disabled = false;
});
adminPwdSubmit.addEventListener("click", tryAdminLogin);
adminPwdInput.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") {
    ev.preventDefault();
    tryAdminLogin();
  }
});
function tryAdminLogin() {
  const val = (adminPwdInput.value || "").trim();
  if (val === ADMIN_PASSWORD) {
    isAdmin = true;
    pwdError.style.display = "none";
    initializeAfterRoleSelection();
    // モーダルを確実に消す
    showMainContent();
    // 解除（念のため）
    chooseAdminBtn.disabled = false;
    chooseViewerBtn.disabled = false;
    // フォーカスをメイン先頭へ
    if (gradeSelect) gradeSelect.focus();
  } else {
    pwdError.style.display = "block";
    pwdError.textContent = "パスワードが違います。もう一度入力してください。";
    adminPwdInput.focus();
  }
}
// ==========================
// 時間割表示（モード別）
// ==========================
function getSubjectsByGrade(grade) {
    switch (grade) {
        case "first":  return firstSubject;
        case "second": return secondSubject;
        case "third":  return thirdSubject;
        default:       return [];
    }
}
function createSubjectSelect(subjects) {
    const timeSelect = document.createElement("select");
    for (const subject of subjects) {
        const option = document.createElement("option");
        option.innerText = subject;
        option.value     = subject;
        timeSelect.appendChild(option);
    }
    return timeSelect;
}
function updateTimetable() {
    const grade  = gradeSelect.value;
    const _class = classSelect.value;
    const subjects = getSubjectsByGrade(grade);
    const key = `${grade}-${_class}`;
    const timetable = savedTimetables[key] || {};
    for (const cell of timeCells) {
        cell.innerHTML = "";
        if (!isAdmin) {
            const span = document.createElement("span");
            span.innerText = timetable[cell.id] || "";
            cell.appendChild(span);
            continue;
        }
        const select = createSubjectSelect(subjects);
        select.dataset.periodId = cell.id;
        if (timetable[cell.id]) select.value = timetable[cell.id];
        select.addEventListener("change", () => {
            const currentGrade  = gradeSelect.value;
            const currentClass  = classSelect.value;
            const currentKey    = `${currentGrade}-${currentClass}`;
            if (!savedTimetables[currentKey]) savedTimetables[currentKey] = {};
            savedTimetables[currentKey][cell.id] = select.value;
            localStorage.setItem("timetables", JSON.stringify(savedTimetables));
        });
        cell.appendChild(select);
    }
}
// ==========================
// お知らせ
// ==========================
const scBox = document.querySelector(".scBox");
const adminAnnouncementArea = document.getElementById("adminAnnouncementArea");
const announcementInput = document.getElementById("announcementInput");
const announcementSaveBtn = document.getElementById("announcementSave");
function renderAnnouncements() {
    const gradeValue = gradeSelect.value;
    const list = announcements[gradeValue] || [];
    if (scBox) scBox.innerHTML = "";
    for (const text of list) {
        const p = document.createElement("p");
        p.textContent = text;
        scBox && scBox.appendChild(p);
    }
    if (isAdmin && announcementInput) announcementInput.value = list.join("\n");
}
// ==========================
// ヘッダーの日付表示・クリックで選択
// ==========================
const colMap = {
    mon: ["月1","月2","月3","月4","月5","月6","月7","月8"],
    tue: ["火1","火2","火3","火4","火5","火6","火7","火8"],
    wed: ["水1","水2","水3","水4","水5","水6","水7","水8"],
    thu: ["木1","木2","木3","木4","木5","木6","木7","木8"],
    fri: ["金1","金2","金3","金4","金5","金6","金7","金8"]
};
function renderHeaderForSelectedDate() {
    const dateStr = dateInput.value;
    if (!dateStr) {
        [hdrMon,hdrTue,hdrWed,hdrThu,hdrFri].forEach(h => { if (h) { h.textContent = "～日"; h.dataset.iso = ""; } });
        clearTodayHighlight();
        return;
    }
    const base = new Date(dateStr);
    const day = base.getDay(); // 0=日,1=月...
    const diffToMon = (day + 6) % 7;
    const mon = new Date(base); mon.setDate(base.getDate() - diffToMon);
    const tue = new Date(mon); tue.setDate(mon.getDate() + 1);
    const wed = new Date(mon); wed.setDate(mon.getDate() + 2);
    const thu = new Date(mon); thu.setDate(mon.getDate() + 3);
    const fri = new Date(mon); fri.setDate(mon.getDate() + 4);
    if (hdrMon) { hdrMon.textContent = formatDateShort(mon); hdrMon.dataset.iso = toISODateString(mon); }
    if (hdrTue) { hdrTue.textContent = formatDateShort(tue); hdrTue.dataset.iso = toISODateString(tue); }
    if (hdrWed) { hdrWed.textContent = formatDateShort(wed); hdrWed.dataset.iso = toISODateString(wed); }
    if (hdrThu) { hdrThu.textContent = formatDateShort(thu); hdrThu.dataset.iso = toISODateString(thu); }
    if (hdrFri) { hdrFri.textContent = formatDateShort(fri); hdrFri.dataset.iso = toISODateString(fri); }
    clearTodayHighlight();
    highlightTodayColumn(day);
}
function clearTodayHighlight() {
    [hdrMon,hdrTue,hdrWed,hdrThu,hdrFri].forEach(h => { if (h && h.parentElement) h.parentElement.classList.remove("today-col-header"); });
    for (const idList of Object.values(colMap)) {
        for (const id of idList) {
            const cell = document.getElementById(id);
            if (cell) cell.classList.remove("today-col-cell");
        }
    }
}
function highlightTodayColumn(day) {
    let key = null; let headerElem = null;
    switch (day) {
        case 1: key = "mon"; headerElem = hdrMon; break;
        case 2: key = "tue"; headerElem = hdrTue; break;
        case 3: key = "wed"; headerElem = hdrWed; break;
        case 4: key = "thu"; headerElem = hdrThu; break;
        case 5: key = "fri"; headerElem = hdrFri; break;
        default: return;
    }
    if (headerElem && headerElem.parentElement) headerElem.parentElement.classList.add("today-col-header");
    const ids = colMap[key];
    for (const id of ids) {
        const cell = document.getElementById(id);
        if (cell) cell.classList.add("today-col-cell");
    }
}
function enableHeaderClickSelection() {
    const hdrs = [hdrMon, hdrTue, hdrWed, hdrThu, hdrFri];
    hdrs.forEach(hdr => {
        if (!hdr) return;
        hdr.addEventListener("click", () => {
            const iso = hdr.dataset.iso;
            if (!iso) return;
            dateInput.value = iso;
            updateReadUI();
            dateInput.focus();
        });
        hdr.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                hdr.click();
            }
        });
    });
}
// ==========================
// 既読管理（localStorage）
// ==========================
function renderClassReadStatsForDate(grade, date) {
    if (!isAdmin || !date) {
        if (classReadStatsDiv) classReadStatsDiv.style.display = "none";
        return;
    }
    if (classReadStatsDiv) classReadStatsDiv.style.display = "block";
    const classes = [
        { key: "classA", countEl: clsACountEl },
        { key: "classB", countEl: clsBCountEl },
        { key: "classC", countEl: clsCCountEl },
        { key: "classD", countEl: clsDCountEl }
    ];
    for (const c of classes) {
        const k = `${grade}-${c.key}-${date}`;
        const count = readData[k] || 0;
        if (c.countEl) c.countEl.textContent = count;
    }
}
function updateReadUI() {
    const grade  = gradeSelect.value;
    const _class = classSelect.value;
    const date   = dateInput.value;
    renderHeaderForSelectedDate();
    if (!date) {
        if (!isAdmin && readStatus) readStatus.textContent = "";
        if (readStats) readStats.style.display = "none";
        if (classReadStatsDiv) classReadStatsDiv.style.display = "none";
        if (undoReadBtn) undoReadBtn.style.display = "none";
        return;
    }
    const key = `${grade}-${_class}-${date}`;
    const count = readData[key] || 0;
    if (readCountEl) readCountEl.textContent = count;
    if (isAdmin) {
        if (readStats) readStats.style.display = "block";
        if (currentClassLabelEl) currentClassLabelEl.textContent = CLASS_LABEL[_class] || _class;
        renderClassReadStatsForDate(grade, date);
        if (readConfirmBtn) readConfirmBtn.style.display = "none";
        if (undoReadBtn) undoReadBtn.style.display = "none";
        if (readStatus) readStatus.style.display = "none";
    } else {
        if (readStats) readStats.style.display = "none";
        if (classReadStatsDiv) classReadStatsDiv.style.display = "none";
        const myKey = key;
        if (myReads[myKey]) {
            if (readStatus) readStatus.textContent = "この日は既読済みです";
            if (undoReadBtn) undoReadBtn.style.display = "inline-block";
            if (readConfirmBtn) readConfirmBtn.style.display = "none";
        } else {
            if (readStatus) readStatus.textContent = "まだ未読です（確認したらボタンを押してください）";
            if (undoReadBtn) undoReadBtn.style.display = "none";
            if (readConfirmBtn) readConfirmBtn.style.display = "inline-block";
        }
    }
}
// 閲覧者：確認済みボタン
if (readConfirmBtn) {
    readConfirmBtn.addEventListener("click", () => {
        if (isAdmin) return;
        const grade  = gradeSelect.value;
        const _class = classSelect.value;
        const date   = dateInput.value;
        if (!date) { alert("日付を選択してください。"); return; }
        const key   = `${grade}-${_class}-${date}`;
        const myKey = key;
        if (myReads[myKey]) { alert("この日はすでに既読として記録されています。"); updateReadUI(); return; }
        const current = readData[key] || 0;
        readData[key] = current + 1;
        localStorage.setItem("reads", JSON.stringify(readData));
        myReads[myKey] = true;
        localStorage.setItem("myReads", JSON.stringify(myReads));
        alert("この日の時間割を既読として記録しました。");
        updateReadUI();
    });
}
// 既読取り消し
if (undoReadBtn) {
    undoReadBtn.addEventListener("click", () => {
        if (isAdmin) return;
        const grade  = gradeSelect.value;
        const _class = classSelect.value;
        const date   = dateInput.value;
        if (!date) { alert("日付を選択してください。"); return; }
        const key   = `${grade}-${_class}-${date}`;
        const myKey = key;
        if (!myReads[myKey]) { alert("この日は既読として記録されていません。"); updateReadUI(); return; }
        const current = readData[key] || 0;
        readData[key] = Math.max(0, current - 1);
        localStorage.setItem("reads", JSON.stringify(readData));
        delete myReads[myKey];
        localStorage.setItem("myReads", JSON.stringify(myReads));
        alert("既読を取り消しました。");
        updateReadUI();
    });
}
// ==========================
// 週切り替え（先週／今週／翌週）
// ==========================
function parseDate(value) {
    if (!value) return new Date();
    return new Date(value);
}
function shiftWeek(days) {
    const base = parseDate(dateInput.value);
    base.setDate(base.getDate() + days);
    dateInput.value = toISODateString(base);
    updateReadUI();
}
if (prevWeekBtn) prevWeekBtn.addEventListener("click", () => { shiftWeek(-7); });
if (nextWeekBtn) nextWeekBtn.addEventListener("click", () => { shiftWeek(7); });
if (thisWeekBtn) thisWeekBtn.addEventListener("click", () => {
    const now = new Date();
    dateInput.value = toISODateString(now);
    updateReadUI();
});
// ==========================
// イベント登録＆初期表示（ロール選択後に実行）
// ==========================
if (gradeSelect) gradeSelect.addEventListener("change", () => { updateTimetable(); renderAnnouncements(); updateReadUI(); });
if (classSelect) classSelect.addEventListener("change", () => { updateTimetable(); updateReadUI(); });
if (dateInput) dateInput.addEventListener("change", updateReadUI);
// 初期日付：今日
if (dateInput) dateInput.value = toISODateString(new Date());
// 初期化（ロール選択後に呼ぶ）
function initializeAfterRoleSelection() {
  // 管理者向け表示切替
  if (isAdmin) {
    if (adminAnnouncementArea) adminAnnouncementArea.style.display = "block";
    const adminSection = document.getElementById("adminSection");
    if (adminSection) adminSection.style.display = "block";
  } else {
    if (adminAnnouncementArea) adminAnnouncementArea.style.display = "none";
    const adminSection = document.getElementById("adminSection");
    if (adminSection) adminSection.style.display = "none";
  }
  updateTimetable();
  renderAnnouncements();
  renderHeaderForSelectedDate();
  enableHeaderClickSelection();
  updateReadUI();
  // 管理者のみお知らせ保存イベントを有効にする
  if (isAdmin && announcementSaveBtn) {
    announcementSaveBtn.addEventListener("click", () => {
      const gradeValue = gradeSelect.value;
      const lines = (announcementInput.value || "").split("\n").map(s => s.trim()).filter(s => s.length > 0);
      announcements[gradeValue] = lines;
      localStorage.setItem("announcements", JSON.stringify(announcements));
      renderAnnouncements();
      alert("この学年のお知らせを保存しました。");
    });
  }
}
// // TOPリンクスクロール
// const topLink = document.getElementById("topLink");
// if (topLink) {
//   topLink.addEventListener("click", (e) => {
//     e.preventDefault();
//     window.scrollTo({top: 0, behavior: "smooth"});
//   });
// }
// 最初にモーダルを表示
showRoleModal();