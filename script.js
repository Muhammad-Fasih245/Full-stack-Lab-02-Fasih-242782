class Student {
  constructor(name, rollNumber, department, semester, cgpa, marks) {
    this.name = name;
    this.rollNumber = rollNumber;
    this.department = department;
    this.semester = semester;
    this.cgpa = cgpa;
    this.marks = marks;
  }
}

const students = [
  new Student("M.Fasih", "242782", "Computer Science", 6, 3.45, 82),
  new Student("Ahmed", "BSCS-002", "Computer Science", 5, 2.8, 67),
  new Student("Sara", "BSSE-023", "Software Engineering", 4, 3.72, 91),
  new Student("Hina", "BSAI-007", "Artificial Intelligence", 3, 2.25, 58),
  new Student("Bilal", "BSIT-015", "Information Technology", 2, 1.85, 42),
  new Student("Zainab", "BSCS-004", "Computer Science", 7, 3.1, 76)
];

function calculateGrade(marks) {
  if (marks >= 80) return "A";
  if (marks >= 70) return "B";
  if (marks >= 60) return "C";
  if (marks >= 50) return "D";
  return "F";
}

const getStatus = (cgpa) => (cgpa >= 2.0 ? "Eligible" : "Academic Warning");

const departments = [];
for (const student of students) {
  if (!departments.includes(student.department)) {
    departments.push(student.department);
  }
}

const filters = document.getElementById("filters");
const cards = document.getElementById("cards");
const picker = document.getElementById("picker");
const record = document.getElementById("record");
const stats = document.getElementById("stats");

let activeFilter = "All";

function renderCards(list) {
  cards.innerHTML = "";
  list.forEach((student) => {
    const { name, rollNumber, department, semester, cgpa, marks } = student;
    const grade = calculateGrade(marks);
    const status = getStatus(cgpa);
    cards.insertAdjacentHTML("beforeend", `
      <article class="card">
        <h3>Student: ${name}</h3>
        <p><span>Roll No</span><b>${rollNumber}</b></p>
        <p><span>Department</span><b>${department}</b></p>
        <p><span>Semester</span><b>${semester}</b></p>
        <p><span>CGPA</span><b>${cgpa.toFixed(2)}</b></p>
        <p><span>Marks</span><b>${marks}</b></p>
        <p><span>Grade</span><b class="badge g-${grade}">${grade}</b></p>
        <p><span>Status</span><b class="badge ${status === "Eligible" ? "b-green" : "b-red"}">${status}</b></p>
      </article>`);
  });
}

function renderFilters() {
  filters.innerHTML = "";
  for (const label of ["All", ...departments]) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip" + (label === activeFilter ? " active" : "");
    chip.textContent = label;
    chip.addEventListener("click", () => {
      activeFilter = label;
      renderFilters();
      renderCards(label === "All" ? students : students.filter((s) => s.department === label));
    });
    filters.appendChild(chip);
  }
}

function renderRecord(student) {
  record.innerHTML = "";
  for (const key in student) {
    record.insertAdjacentHTML("beforeend", `<div><dt>${key}</dt><dd>${student[key]}</dd></div>`);
  }
}

function renderStats() {
  let passed = 0;
  let failed = 0;
  for (let i = 0; i < students.length; i++) {
    calculateGrade(students[i].marks) === "F" ? failed++ : passed++;
  }
  stats.innerHTML = `
    <div class="tile"><strong>${students.length}</strong><span>Total Students</span></div>
    <div class="tile pass"><strong>${passed}</strong><span>Passed Students</span></div>
    <div class="tile fail"><strong>${failed}</strong><span>Failed Students</span></div>`;
}

students.forEach((student, index) => {
  picker.add(new Option(student.name + " (" + student.rollNumber + ")", index));
});
picker.addEventListener("change", () => renderRecord(students[picker.value]));

renderFilters();
renderCards(students);
renderRecord(students[0]);
renderStats();
