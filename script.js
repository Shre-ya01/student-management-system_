/* ==========================================================================
   STUDENT MANAGEMENT SYSTEM - JAVASCRIPT (script.js)
   Vanilla JavaScript implementation with LocalStorage persistence.
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. Storage Configuration and Initial Sample Data
// --------------------------------------------------------------------------
const STORAGE_KEY = 'sms_students_data';

// Sample students loaded automatically when a user opens the app for the first time
const INITIAL_STUDENTS = [
  {
    rollNumber: 'CS-2024-001',
    name: 'Emily Watson',
    department: 'Computer Science',
    email: 'emily.watson@university.edu',
    phone: '9876543210'
  },
  {
    rollNumber: 'IT-2024-015',
    name: 'Michael Chen',
    department: 'Information Technology',
    email: 'm.chen@university.edu',
    phone: '9812345678'
  },
  {
    rollNumber: 'EE-2024-032',
    name: 'Sophia Patel',
    department: 'Electrical Engineering',
    email: 'sophia.p@university.edu',
    phone: '9845678901'
  },
  {
    rollNumber: 'ME-2024-008',
    name: 'David Rodriguez',
    department: 'Mechanical Engineering',
    email: 'david.r@university.edu',
    phone: '9765432109'
  }
];

// Global in-memory list of students
let students = [];

// Temporary storage for roll number pending deletion in confirmation modal
let rollToDelete = null;

// --------------------------------------------------------------------------
// 2. DOM Elements Selection
// --------------------------------------------------------------------------
// Navigation & Sidebar
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const menuToggleBtn = document.getElementById('menuToggleBtn');
const navLinks = document.querySelectorAll('.nav-link');
const contentSections = document.querySelectorAll('.content-section');
const pageTitle = document.getElementById('pageTitle');

// Topbar & Direct Action Buttons
const quickAddBtn = document.getElementById('quickAddBtn');
const dashboardAddBtn = document.getElementById('dashboardAddBtn');
const openAddFormBtn = document.getElementById('openAddFormBtn');
const emptyStateAddBtn = document.getElementById('emptyStateAddBtn');
const viewAllStudentsBtn = document.getElementById('viewAllStudentsBtn');

// Dashboard Elements
const statTotalStudents = document.getElementById('statTotalStudents');
const statTotalDepts = document.getElementById('statTotalDepts');
const statRecentStudent = document.getElementById('statRecentStudent');
const recentStudentsTableBody = document.getElementById('recentStudentsTableBody');

// Students List & Search Elements
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const deptFilter = document.getElementById('deptFilter');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const studentsTableBody = document.getElementById('studentsTableBody');
const recordCountText = document.getElementById('recordCountText');
const noDataState = document.getElementById('noDataState');

// Student Form Elements
const studentForm = document.getElementById('studentForm');
const formTitle = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');
const submitBtnText = document.getElementById('submitBtnText');
const cancelBtn = document.getElementById('cancelBtn');
const editOriginalRoll = document.getElementById('editOriginalRoll');

const inputName = document.getElementById('studentName');
const inputRoll = document.getElementById('rollNumber');
const selectDept = document.getElementById('department');
const inputEmail = document.getElementById('email');
const inputPhone = document.getElementById('phone');

// Form Error Labels
const nameError = document.getElementById('nameError');
const rollError = document.getElementById('rollError');
const deptError = document.getElementById('deptError');
const emailError = document.getElementById('emailError');
const phoneError = document.getElementById('phoneError');

// Delete Modal Elements
const deleteModal = document.getElementById('deleteModal');
const deleteStudentName = document.getElementById('deleteStudentName');
const deleteStudentRoll = document.getElementById('deleteStudentRoll');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Toast Notification Container
const toastContainer = document.getElementById('toastContainer');

// --------------------------------------------------------------------------
// 3. Application Initialization
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Load data from browser LocalStorage
  loadStudentsFromStorage();

  // Attach all event listeners
  setupNavigationEvents();
  setupFormEvents();
  setupSearchAndFilterEvents();
  setupModalEvents();

  // Initial render of dashboard and table
  renderAllViews();
});

// --------------------------------------------------------------------------
// 4. LocalStorage Helpers
// --------------------------------------------------------------------------
/**
 * Loads student records from localStorage.
 * If no records exist, initializes with default sample students.
 */
function loadStudentsFromStorage() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      students = JSON.parse(storedData);
    } else {
      // First-time visit: populate sample data
      students = [...INITIAL_STUDENTS];
      saveStudentsToStorage();
    }
  } catch (err) {
    console.error('Error loading data from LocalStorage:', err);
    students = [...INITIAL_STUDENTS];
  }
}

/**
 * Saves current student array into browser localStorage.
 */
function saveStudentsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (err) {
    console.error('Error saving data to LocalStorage:', err);
    showToast('Failed to save data to LocalStorage.', 'error');
  }
}

// --------------------------------------------------------------------------
// 5. Section Navigation Logic
// --------------------------------------------------------------------------
/**
 * Switches the active visible section (Dashboard, Students, Add Student, About).
 * @param {string} sectionId - The target section identifier
 */
function switchSection(sectionId) {
  // Hide all sections and remove active class
  contentSections.forEach(section => {
    section.classList.remove('active');
  });

  // Remove active styling from all navigation links
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.dataset.section === sectionId) {
      link.classList.add('active');
    }
  });

  // Activate the chosen section
  const targetSection = document.getElementById(`section-${sectionId}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Update topbar page title
  const titles = {
    'dashboard': 'Dashboard',
    'students': 'Student Records',
    'add-student': editOriginalRoll.value ? 'Edit Student Details' : 'Add New Student',
    'about': 'About System'
  };
  pageTitle.textContent = titles[sectionId] || 'Student Management';

  // Close mobile sidebar if open
  closeMobileSidebar();

  // Scroll smoothly to top of main wrapper
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupNavigationEvents() {
  // Sidebar links click handler
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.section;
      switchSection(target);
    });
  });

  // Mobile menu button toggle
  menuToggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('show');
    sidebarOverlay.classList.toggle('show');
  });

  // Mobile overlay click to dismiss sidebar
  sidebarOverlay.addEventListener('click', closeMobileSidebar);

  // Quick action buttons that navigate to "Add Student" section
  const openAddSection = () => {
    resetStudentForm();
    switchSection('add-student');
  };

  quickAddBtn.addEventListener('click', openAddSection);
  dashboardAddBtn.addEventListener('click', openAddSection);
  openAddFormBtn.addEventListener('click', openAddSection);
  emptyStateAddBtn.addEventListener('click', openAddSection);

  // "View All Students" button on dashboard
  viewAllStudentsBtn.addEventListener('click', () => {
    switchSection('students');
  });
}

function closeMobileSidebar() {
  sidebar.classList.remove('show');
  sidebarOverlay.classList.remove('show');
}

// --------------------------------------------------------------------------
// 6. Rendering Logic (Dashboard & Tables)
// --------------------------------------------------------------------------
/**
 * Re-renders the entire view (stats, student tables, search results).
 */
function renderAllViews() {
  updateDashboardStats();
  renderRecentStudentsTable();
  applySearchAndFilters();
}

/**
 * Updates the counters displayed on the Dashboard cards.
 */
function updateDashboardStats() {
  // Total Students Count
  statTotalStudents.textContent = students.length;

  // Active Departments Count
  const uniqueDepts = new Set(students.map(s => s.department).filter(Boolean));
  statTotalDepts.textContent = uniqueDepts.size;

  // Latest Added Student Name
  if (students.length > 0) {
    const latestStudent = students[students.length - 1];
    statRecentStudent.textContent = latestStudent.name;
  } else {
    statRecentStudent.textContent = 'None';
  }
}

/**
 * Renders the top 4 most recently registered students on the dashboard.
 */
function renderRecentStudentsTable() {
  recentStudentsTableBody.innerHTML = '';

  if (students.length === 0) {
    recentStudentsTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center" style="padding: 2rem; color: var(--text-muted);">
          No student records registered yet.
        </td>
      </tr>
    `;
    return;
  }

  // Take the last 4 students in reverse order (newest first)
  const recentList = [...students].reverse().slice(0, 4);

  recentList.forEach(student => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="roll-badge">${escapeHTML(student.rollNumber)}</span></td>
      <td><strong>${escapeHTML(student.name)}</strong></td>
      <td><span class="dept-badge">${escapeHTML(student.department)}</span></td>
      <td>${escapeHTML(student.email)}</td>
      <td>${escapeHTML(student.phone)}</td>
    `;
    recentStudentsTableBody.appendChild(row);
  });
}

/**
 * Renders the main student records table.
 * @param {Array} list - Array of student objects to display
 */
function renderStudentsTable(list) {
  studentsTableBody.innerHTML = '';

  // Update record count text
  recordCountText.textContent = `Showing ${list.length} of ${students.length} students`;

  if (list.length === 0) {
    noDataState.style.display = 'block';
    return;
  }

  noDataState.style.display = 'none';

  list.forEach(student => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="roll-badge">${escapeHTML(student.rollNumber)}</span></td>
      <td><strong>${escapeHTML(student.name)}</strong></td>
      <td><span class="dept-badge">${escapeHTML(student.department)}</span></td>
      <td><a href="mailto:${escapeHTML(student.email)}" style="color: var(--primary-600);">${escapeHTML(student.email)}</a></td>
      <td>${escapeHTML(student.phone)}</td>
      <td class="text-center">
        <div class="action-btns">
          <button class="btn-action btn-edit" title="Edit Student" onclick="handleEditStudent('${escapeAttr(student.rollNumber)}')">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn-action btn-delete" title="Delete Student" onclick="openDeleteModal('${escapeAttr(student.rollNumber)}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    studentsTableBody.appendChild(row);
  });
}

// --------------------------------------------------------------------------
// 7. Search and Department Filter Handlers
// --------------------------------------------------------------------------
function setupSearchAndFilterEvents() {
  // Real-time search as user types
  searchInput.addEventListener('input', () => {
    if (searchInput.value.trim().length > 0) {
      clearSearchBtn.style.display = 'block';
    } else {
      clearSearchBtn.style.display = 'none';
    }
    applySearchAndFilters();
  });

  // Clear search input
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    searchInput.focus();
    applySearchAndFilters();
  });

  // Department dropdown change
  deptFilter.addEventListener('change', applySearchAndFilters);

  // Reset all filters button
  resetFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    deptFilter.value = '';
    clearSearchBtn.style.display = 'none';
    applySearchAndFilters();
    showToast('Filters have been reset', 'info');
  });
}

/**
 * Filters the students array by search keyword and selected department.
 */
function applySearchAndFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedDept = deptFilter.value;

  const filtered = students.filter(student => {
    // Check search query against name, roll number, or email
    const matchesQuery = !query || 
      student.name.toLowerCase().includes(query) ||
      student.rollNumber.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query);

    // Check department match
    const matchesDept = !selectedDept || student.department === selectedDept;

    return matchesQuery && matchesDept;
  });

  renderStudentsTable(filtered);
}

// --------------------------------------------------------------------------
// 8. Form Validation & Submission (Add / Edit)
// --------------------------------------------------------------------------
function setupFormEvents() {
  // Clear error messages dynamically when user changes inputs
  [inputName, inputRoll, selectDept, inputEmail, inputPhone].forEach(input => {
    input.addEventListener('input', () => clearFieldValidation(input));
    input.addEventListener('change', () => clearFieldValidation(input));
  });

  // Form submission
  studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit();
  });

  // Cancel / Reset button
  cancelBtn.addEventListener('click', () => {
    resetStudentForm();
    switchSection('students');
  });
}

/**
 * Validates form fields and handles both Create and Update operations.
 */
function handleFormSubmit() {
  const isEditing = Boolean(editOriginalRoll.value);
  const originalRoll = editOriginalRoll.value;

  const nameVal = inputName.value.trim();
  const rollVal = inputRoll.value.trim();
  const deptVal = selectDept.value;
  const emailVal = inputEmail.value.trim();
  const phoneVal = inputPhone.value.trim();

  // Validate all fields
  let isValid = true;

  // 1. Full Name Validation
  if (!nameVal) {
    showFieldError(inputName, nameError, 'Full name is required.');
    isValid = false;
  } else if (nameVal.length < 2) {
    showFieldError(inputName, nameError, 'Name must be at least 2 characters.');
    isValid = false;
  }

  // 2. Roll Number Validation
  if (!rollVal) {
    showFieldError(inputRoll, rollError, 'Roll number is required.');
    isValid = false;
  } else {
    // Check for duplicate roll number
    const isDuplicate = students.some(s => {
      if (isEditing && s.rollNumber.toLowerCase() === originalRoll.toLowerCase()) {
        // Skip current student when in edit mode
        return false;
      }
      return s.rollNumber.toLowerCase() === rollVal.toLowerCase();
    });

    if (isDuplicate) {
      showFieldError(inputRoll, rollError, 'This Roll Number is already registered.');
      isValid = false;
    }
  }

  // 3. Department Validation
  if (!deptVal) {
    showFieldError(selectDept, deptError, 'Please select a department.');
    isValid = false;
  }

  // 4. Email Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailVal) {
    showFieldError(inputEmail, emailError, 'Email address is required.');
    isValid = false;
  } else if (!emailRegex.test(emailVal)) {
    showFieldError(inputEmail, emailError, 'Please enter a valid email address.');
    isValid = false;
  }

  // 5. Phone Validation (at least 10 digits)
  const phoneDigits = phoneVal.replace(/\D/g, '');
  if (!phoneVal) {
    showFieldError(inputPhone, phoneError, 'Phone number is required.');
    isValid = false;
  } else if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    showFieldError(inputPhone, phoneError, 'Please enter a valid 10-15 digit phone number.');
    isValid = false;
  }

  // Stop if validation fails
  if (!isValid) {
    return;
  }

  // If validation passes, construct student record
  const studentData = {
    rollNumber: rollVal,
    name: nameVal,
    department: deptVal,
    email: emailVal,
    phone: phoneVal
  };

  if (isEditing) {
    // UPDATE EXISTING STUDENT
    const index = students.findIndex(
      s => s.rollNumber.toLowerCase() === originalRoll.toLowerCase()
    );

    if (index !== -1) {
      students[index] = studentData;
      saveStudentsToStorage();
      renderAllViews();
      showToast(`Student ${studentData.name} updated successfully!`, 'success');
      resetStudentForm();
      switchSection('students');
    } else {
      showToast('Error: Original student record not found.', 'error');
    }
  } else {
    // ADD NEW STUDENT
    students.push(studentData);
    saveStudentsToStorage();
    renderAllViews();
    showToast(`Student ${studentData.name} registered successfully!`, 'success');
    resetStudentForm();
    switchSection('students');
  }
}

/**
 * Marks field with red error border and displays error text.
 */
function showFieldError(inputElement, errorElement, message) {
  inputElement.classList.add('is-invalid');
  errorElement.textContent = message;
}

/**
 * Clears error state for a single input field.
 */
function clearFieldValidation(inputElement) {
  inputElement.classList.remove('is-invalid');
  const errorElement = inputElement.parentElement.querySelector('.error-msg');
  if (errorElement) {
    errorElement.textContent = '';
  }
}

/**
 * Resets all form fields and returns to "Add" mode.
 */
function resetStudentForm() {
  studentForm.reset();
  editOriginalRoll.value = '';

  // Reset form labels
  formTitle.textContent = 'Add New Student';
  formSubtitle.textContent = 'Fill in the student details below to create a new registration record';
  submitBtnText.textContent = 'Save Student';

  // Clear all error messages
  [inputName, inputRoll, selectDept, inputEmail, inputPhone].forEach(input => {
    clearFieldValidation(input);
  });
}

/**
 * Pre-populates the form with selected student details for editing.
 * @param {string} roll - Roll number of student to edit
 */
window.handleEditStudent = function(roll) {
  const student = students.find(s => s.rollNumber === roll);
  if (!student) {
    showToast('Student record not found.', 'error');
    return;
  }

  // Populate form fields
  inputName.value = student.name;
  inputRoll.value = student.rollNumber;
  selectDept.value = student.department;
  inputEmail.value = student.email;
  inputPhone.value = student.phone;
  editOriginalRoll.value = student.rollNumber;

  // Change form heading & button to Edit state
  formTitle.textContent = 'Edit Student Details';
  formSubtitle.textContent = `Modifying details for ${student.name} (${student.rollNumber})`;
  submitBtnText.textContent = 'Update Student';

  // Switch to the form section
  switchSection('add-student');
};

// --------------------------------------------------------------------------
// 9. Delete Confirmation Modal & Operations
// --------------------------------------------------------------------------
function setupModalEvents() {
  // Cancel delete button closes modal
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);

  // Close modal when clicking outside of modal card
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
      closeDeleteModal();
    }
  });

  // Confirm delete button
  confirmDeleteBtn.addEventListener('click', () => {
    if (rollToDelete) {
      performDeleteStudent(rollToDelete);
      closeDeleteModal();
    }
  });
}

/**
 * Opens confirmation dialog before deleting student.
 * @param {string} roll - Roll number to delete
 */
window.openDeleteModal = function(roll) {
  const student = students.find(s => s.rollNumber === roll);
  if (!student) return;

  rollToDelete = roll;
  deleteStudentName.textContent = student.name;
  deleteStudentRoll.textContent = student.rollNumber;
  deleteModal.style.display = 'flex';
};

function closeDeleteModal() {
  deleteModal.style.display = 'none';
  rollToDelete = null;
}

/**
 * Permanently removes a student from array and localStorage.
 * @param {string} roll - Roll number to remove
 */
function performDeleteStudent(roll) {
  const initialCount = students.length;
  students = students.filter(s => s.rollNumber !== roll);

  if (students.length < initialCount) {
    saveStudentsToStorage();
    renderAllViews();
    showToast('Student record removed successfully.', 'success');
  } else {
    showToast('Failed to delete student.', 'error');
  }
}

// --------------------------------------------------------------------------
// 10. Toast Notification System
// --------------------------------------------------------------------------
/**
 * Displays modern floating toast alert.
 * @param {string} message - Message text
 * @param {string} type - 'success' | 'error' | 'info'
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  // Pick icon depending on type
  let iconClass = 'fa-circle-info';
  if (type === 'success') iconClass = 'fa-circle-check';
  if (type === 'error') iconClass = 'fa-circle-xmark';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass}"></i>
    <span class="toast-message">${escapeHTML(message)}</span>
  `;

  toastContainer.appendChild(toast);

  // Automatically fade out and remove after 3.5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

// --------------------------------------------------------------------------
// 11. Security & Sanitization Helpers
// --------------------------------------------------------------------------
/**
 * Escapes HTML characters to prevent XSS injection.
 */
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escapes characters for embedding inside HTML attributes.
 */
function escapeAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;');
}
