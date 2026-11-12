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
  'Programming': ['Python', 'C', 'C++', 'Java', 'JavaScript', 'MATLAB', 'HTML / CSS'],
  'Robotics': ['ROS 2', 'Nav2', 'SLAM Toolbox', 'FAST-LIO', 'BEV Localization', 'Sensor Fusion', 'GNSS/RTK', 'AprilTags', 'Gazebo', 'RViz', 'Foxglove'],
  'Software & AI': ['React', 'YOLO', 'OpenCV', 'NumPy', 'Pygame', 'PyTorch', 'MediaPipe', 'OpenAI Agents SDK', 'AI Agents', 'Prompting'],
  'Development & design': ['Git', 'GitHub', 'Linux', 'Docker', 'Figma', 'Agile', 'A/B Testing', 'Usability Testing'],
  'Hardware & embedded systems': ['Sensors', 'ESP32 / Arduino', 'NVIDIA Jetson', 'Raspberry Pi', 'Electronic Circuits', 'FreeRTOS', 'Fusion 360', 'OpenSCAD'],
  'Spoken languages': ['Spanish', 'English']
};
const proficientSkills = new Set(['Python', 'C++', 'ROS 2', 'OpenCV', 'ESP32 / Arduino', 'Sensors', 'GNSS/RTK', 'Spanish', 'English']);
const intermediateSkills = new Set(['JavaScript', 'HTML / CSS', 'React']);
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
    if (technology === 'Sensors') name.title = 'LiDAR, IMU, cameras (including ZED 2), and wheel encoders';
    const level = document.createElement('small'); level.textContent = proficientSkills.has(technology) ? 'Proficient' : intermediateSkills.has(technology) ? 'Intermediate' : 'Beginner';
    row.append(name, level); details.append(row);
  }
  skillContainer.append(details);
}

// Keep anchor destinations below the persistent header at every screen size.
const pageHeader = document.querySelector('header');
new ResizeObserver(() => {
  document.documentElement.style.setProperty('--header-height', pageHeader.offsetHeight + 'px');
}).observe(pageHeader);
document.querySelectorAll('.experience-entry details').forEach(details => details.addEventListener('toggle', scheduleHighlight));
