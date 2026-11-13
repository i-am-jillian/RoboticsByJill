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
  'Languages': ['Python', 'C', 'C++', 'Java', 'JavaScript', 'MATLAB', 'HTML / CSS'],
  'Robotics': ['ROS 2', 'Nav2', 'SLAM Toolbox', 'FAST-LIO', 'BEV Localization', 'Sensor Fusion', 'GNSS/RTK', 'AprilTags', 'Gazebo', 'RViz', 'Foxglove', 'Isaac Sim'],
  'Software & AI': ['React', 'YOLO', 'OpenCV', 'NumPy', 'Pygame', 'PyTorch', 'MediaPipe', 'AI Agents', 'Pandas'],
  'Development & design': ['Git', 'GitHub', 'Linux', 'Docker', 'Figma', 'Agile', 'A/B Testing', 'Usability Testing', 'PostgreSQL', 'AWS'],
  'Hardware & embedded systems': ['Sensors', 'ESP32 / Arduino', 'NVIDIA Jetson', 'Raspberry Pi', 'Electronic Circuits', 'FreeRTOS', 'Fusion 360', 'OpenSCAD', 'PLC', 'CAN Bus', 'EtherCAT']
};
// Edit levels here: Advanced, Proficient, Intermediate, Beginner, Want to learn (or Fluent for spoken languages).
const skillLevels = {
  'Pandas': 'Intermediate',
  'PostgreSQL': 'Want to learn',
  'AWS': 'Want to learn',
  'Isaac Sim': 'Want to learn',
  'PLC': 'Want to learn',
  'CAN Bus': 'Want to learn',
  'EtherCAT': 'Want to learn',
  'Python': 'Advanced',
  'C': 'Proficient',
  'C++': 'Advanced',
  'Java': 'Beginner',
  'JavaScript': 'Intermediate',
  'MATLAB': 'Intermediate',
  'HTML / CSS': 'Intermediate',
  'ROS 2': 'Proficient',
  'Nav2': 'Proficient',
  'SLAM Toolbox': 'Proficient',
  'FAST-LIO': 'Proficient',
  'BEV Localization': 'Intermediate',
  'Sensor Fusion': 'Proficient',
  'GNSS/RTK': 'Proficient',
  'AprilTags': 'Proficient',
  'Gazebo': 'Intermediate',
  'RViz': 'Proficient',
  'Foxglove': 'Intermediate',
  'React': 'Intermediate',
  'YOLO': 'Intermediate',
  'OpenCV': 'Proficient',
  'NumPy': 'Intermediate',
  'Pygame': 'Beginner',
  'PyTorch': 'Beginner',
  'MediaPipe': 'Proficient',
  'AI Agents': 'Intermediate',
  'Git': 'Advanced',
  'GitHub': 'Advanced',
  'Linux': 'Advanced',
  'Docker': 'Intermediate',
  'Figma': 'Proficient',
  'Agile': 'Proficient',
  'A/B Testing': 'Proficient',
  'Usability Testing': 'Proficient',
  'Sensors': 'Proficient',
  'ESP32 / Arduino': 'Proficient',
  'NVIDIA Jetson': 'Proficient',
  'Raspberry Pi': 'Proficient',
  'Electronic Circuits': 'Intermediate',
  'FreeRTOS': 'Beginner',
  'Fusion 360': 'Intermediate',
  'OpenSCAD': 'Beginner',
  'Spanish': 'Fluent',
  'English': 'Fluent',
};
const levelOrder = { Advanced: 0, Fluent: 0, Proficient: 1, Intermediate: 2, Beginner: 3, 'Want to learn': 4 };
const skillContainer = document.querySelector('#technology-skills');
for (const [group, technologies] of Object.entries(skillGroups)) {
  const details = document.createElement('details');
  details.className = 'skillgroup';
  details.open = true;
  const summary = document.createElement('summary');
  summary.textContent = group;
  details.append(summary);
  function appendSkillRows(container, names) {
    for (const technology of [...names].sort((a, b) => (levelOrder[skillLevels[a]] ?? 3) - (levelOrder[skillLevels[b]] ?? 3))) {
      const row = document.createElement('div'); row.className = 'skillrow';
      const name = document.createElement('b'); name.textContent = technology;
      if (technology === 'Sensors') name.title = 'LiDAR, IMU, cameras (including ZED 2), and wheel encoders';
      const level = document.createElement('small'); level.textContent = skillLevels[technology] || 'Beginner';
      row.append(name, level); container.append(row);
    }
  }
  if (group === 'Languages') {
    const programming = document.createElement('details');
    programming.className = 'programming-languages';
    programming.open = true;
    const programmingSummary = document.createElement('summary');
    programmingSummary.textContent = 'Programming';
    programming.append(programmingSummary);
    appendSkillRows(programming, technologies);
    details.append(programming);
    const languages = document.createElement('details');
    languages.className = 'spoken-languages';
    const languageSummary = document.createElement('summary');
    languageSummary.textContent = 'Spoken languages';
    languages.append(languageSummary);
    appendSkillRows(languages, ['Spanish', 'English']);
    details.append(languages);
  } else {
    appendSkillRows(details, technologies);
  }
  skillContainer.append(details);
}

// Keep anchor destinations below the persistent header at every screen size.
const pageHeader = document.querySelector('header');
new ResizeObserver(() => {
  document.documentElement.style.setProperty('--header-height', pageHeader.offsetHeight + 'px');
}).observe(pageHeader);
document.querySelectorAll('.experience-entry details').forEach(details => details.addEventListener('toggle', scheduleHighlight));

// Play the hero sequence, then stop at Meet Jill so visitors can read.
const exploreLink = document.querySelector('.intro .action');
let exploreFrame = 0;
function cancelExplore() { cancelAnimationFrame(exploreFrame); exploreFrame = 0; }
exploreLink.addEventListener('click', event => {
  event.preventDefault();
  cancelExplore();
  const destination = document.querySelector('#about');
  const reel = document.querySelector('.reel');
  const staticScene = matchMedia('(prefers-reduced-motion:reduce), (max-height:540px)').matches;
  const target = staticScene
    ? Math.max(0, scrollY + destination.getBoundingClientRect().top - pageHeader.offsetHeight - 16)
    : scrollY + reel.getBoundingClientRect().top + (reel.offsetHeight - innerHeight) * .91;
  const start = scrollY;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const duration = reduced ? 0 : 4200;
  const began = performance.now();
  function step(now) {
    const progress = duration ? Math.min(1, (now - began) / duration) : 1;
    const eased = progress * progress * (3 - 2 * progress);
    window.scrollTo({ top: start + (target - start) * eased, behavior: 'instant' });
    if (progress < 1) exploreFrame = requestAnimationFrame(step);
    else {
      exploreFrame = 0;
      destination.tabIndex = -1;
      destination.focus({ preventScroll: true });
      history.replaceState(null, '', '#about');
    }
  }
  exploreFrame = requestAnimationFrame(step);
});
addEventListener('wheel', cancelExplore, { passive: true });
addEventListener('touchstart', cancelExplore, { passive: true });
document.addEventListener('click', event => {
  if (!event.target.closest('.intro .action')) cancelExplore();
});
addEventListener('keydown', event => {
  if (['Escape', 'Tab', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) cancelExplore();
});

// Match card headings and expanded bodies without truncating any project text.
const projectGrid = document.querySelector('#projects .cards');
let sizingFrame;
function sizeProjectCards() {
  cancelAnimationFrame(sizingFrame);
  sizingFrame = requestAnimationFrame(() => {
    const cards = [...projectGrid.querySelectorAll('article:not([hidden])')];
    const measurements = cards.map(card => {
      const clone = card.cloneNode(true);
      clone.removeAttribute('hidden');
      clone.setAttribute('aria-hidden', 'true');
      clone.inert = true;
      clone.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;width:${card.getBoundingClientRect().width}px;`;
      clone.querySelector('details').open = true;
      clone.querySelector('.project-heading').style.minHeight = '0';
      clone.querySelector('.project-body').style.minHeight = '0';
      projectGrid.append(clone);
      const sizes = ['.project-heading', '.project-body'].map(selector => clone.querySelector(selector).getBoundingClientRect().height);
      clone.remove();
      return sizes;
    });
    cards.forEach(card => {
      ['.project-heading', '.project-body'].forEach((selector, index) => {
        card.querySelector(selector).style.minHeight = Math.ceil(Math.max(...measurements.map(size => size[index]))) + 'px';
      });
    });
  });
}
let projectWidth = 0;
new ResizeObserver(entries => {
  const width = entries[0].contentRect.width;
  if (width !== projectWidth) { projectWidth = width; sizeProjectCards(); }
}).observe(projectGrid);
document.querySelector('.filters').addEventListener('click', sizeProjectCards);
document.querySelector('.projects-more').addEventListener('click', sizeProjectCards);
document.fonts.ready.then(sizeProjectCards);
