const menuButton = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');
const compactNav = matchMedia('(max-width:1050px)');
function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  siteNav.classList.toggle('is-open', open);
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
siteNav.addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('header')) setMenu(false);
});
compactNav.addEventListener('change', () => setMenu(false));

// Keep one experience entry highlighted at the reading position.
const experienceEntries = [...document.querySelectorAll('.experience-entry')];
let scrollPending = false;
function highlightExperience() {
  scrollPending = false;
  const readingLine = innerHeight * .45;
  let active = null, distance = Infinity;
  for (const entry of experienceEntries) {
    const box = entry.getBoundingClientRect();
    if (box.bottom <= 0 || box.top >= innerHeight) continue;
    const delta = Math.abs((box.top + box.bottom) / 2 - readingLine);
    if (delta < distance) { active = entry; distance = delta; }
  }
  experienceEntries.forEach(entry => entry.classList.toggle('is-active', entry === active));
}
function scheduleHighlight() {
  if (!scrollPending) { scrollPending = true; requestAnimationFrame(highlightExperience); }
}
addEventListener('scroll', scheduleHighlight, { passive: true });
addEventListener('resize', scheduleHighlight);
highlightExperience();

// Levels are editable independently from the project descriptions.
const skillGroups = {
  'Languages & web': ['Python', 'C++', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'PHP', 'React', 'Next.js', 'FastAPI', 'REST APIs', 'React Router', 'Socket.IO', 'Auth0'],
  'Robotics & perception': ['ROS 2', 'Nav2', 'FAST-LIO', 'BEV Localization', 'Sensor Fusion', 'GNSS/RTK', 'LiDAR', 'IMU', 'Cameras', 'ZED 2', 'RealSense', 'AprilTags', 'Terrain Analysis', 'Gazebo', 'Foxglove', 'Docker'],
  'Machine learning & AI': ['Machine Learning', 'Computer Vision', 'Image Classification', 'MobileNetV3', 'ONNX', 'YOLO', 'OpenCV', 'NumPy', 'Pygame', 'Pose Estimation', 'PyTorch', 'Gemini', 'AI Agents', 'RAG', 'Retrieval', 'LLMs', 'Evaluation'],
  'Hardware & design': ['FreeRTOS', 'ESP32', 'Arduino', 'Embedded Systems', 'Servo Control', 'I²C', 'Power Electronics', 'Sensor Integration', 'NFC', '3D Printing', 'Microscopy', 'UI/UX', 'HCI']
};
const proficientSkills = new Set(['Python', 'C++', 'ROS 2', 'OpenCV', 'ESP32', 'Arduino', 'LiDAR', 'Cameras', 'GNSS/RTK']);
const intermediateSkills = new Set(['Python', 'C++', 'JavaScript', 'HTML', 'CSS', 'React', 'ROS 2', 'Sensor Fusion', 'Computer Vision', 'Machine Learning', '3D Printing']);
const skillContainer = document.querySelector('#technology-skills');
for (const [group, technologies] of Object.entries(skillGroups)) {
  const details = document.createElement('details');
  details.className = 'skillgroup';
  details.open = true;
  const summary = document.createElement('summary');
  summary.textContent = group;
  details.append(summary);
  for (const technology of technologies) {
    const row = document.createElement('div'); row.className = 'skillrow';
    const name = document.createElement('b'); name.textContent = technology;
    const level = document.createElement('small'); level.textContent = proficientSkills.has(technology) ? 'Proficient' : intermediateSkills.has(technology) ? 'Intermediate' : 'Beginner';
    row.append(name, level); details.append(row);
  }
  skillContainer.append(details);
}
