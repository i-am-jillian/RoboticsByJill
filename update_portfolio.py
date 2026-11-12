#!/usr/bin/env python3
"""Apply the RoboticsByJill portfolio refresh to index.html and scene.js.
Run from the repo root: python3 update_portfolio.py
Creates .bak copies before changes and safely accepts an already-current site.
"""
from pathlib import Path
import re

root=Path.cwd()
html=root/'index.html'; scene=root/'scene.js'
if not html.exists() or not scene.exists():
    raise SystemExit('Run this script inside RoboticsByJill, alongside index.html and scene.js.')
h=html.read_text(encoding='utf-8'); j=scene.read_text(encoding='utf-8')
if '/* ROBOTICSBYJILL REFRESH */' in h:
    expected_html = all(text in h for text in (
        'Jill Guerrero', 'RipeSense', 'HomeMate',
        'RAG Chunking Strategy Evaluation',
    ))
    expected_scene = 'const words=' in j and "'Lead'" in j
    if expected_html and expected_scene:
        print('Portfolio is already up to date; no files changed.')
        raise SystemExit(0)
    raise SystemExit(
        'Refresh marker found, but the portfolio does not match the current '
        'expected content. No files changed.'
    )

h,n=re.subn(r'(</svg></span>)\s*Jill(</a>)',r'\1 <span class="brand-name">Jill Guerrero <span class="brand-divider">|</span> <span class="brand-sub">Robotics By Jill</span></span>\2',h,count=1)
if n!=1: raise SystemExit('Cannot locate header brand. No files changed.')
h=h.replace('Explore projects ↘','Explore projects')
h=h.replace('Robotics Engineer, Robotics Software Engineer, ML Engineer, Software Developer, Autonomous Systems Engineer, Perception Engineer, AI Engineer, Designer, Student, Researcher','Robotics Engineer, Automation Engineer, Perception Engineer, Software Developer, ML Engineer, Roboticist, AI Engineer, Student, Researcher, Lead')
# Fix the preexisting stray closing span after the A/An prefix.
h,n=re.subn(r'<span id="article">A</span>\s*<strong id="role">Robotics Engineer</strong>\s*<i class="caret"></i>\s*</span>', '<span class="role-line"><span id="article">A</span> <strong id="role">Robotics Engineer</strong><i class="caret"></i></span>',h,count=1)
if n!=1: print('Note: role wrapper was different; leaving that section unchanged.')

css=r'''
/* ROBOTICSBYJILL REFRESH */
header .brand{font-size:clamp(13px,1.45vw,19px);letter-spacing:-.035em;white-space:nowrap}
.brand-name{display:inline-flex;align-items:center;gap:7px;flex-wrap:wrap}
.brand-divider,.brand-sub{color:#ff6051}.brand-sub{font-weight:600}
.hero .intro,.hero .biocopy,.hero .cinematic{transform:translateY(-5vh)}
.hero .role{min-height:1.2em;margin-bottom:7px}
.hero .intro>p{font-size:clamp(18px,1.75vw,25px);line-height:1.48;max-width:43ch}
.hero .intro>.action{margin-top:22px}
.biocopy .bio{grid-template-columns:1.08fr 1fr;gap:clamp(20px,4vw,65px)}
.biocopy .bio>p{font-size:clamp(17px,1.35vw,22px);line-height:1.5;letter-spacing:-.015em}
.biocopy .bio dt{color:#ff6155;font:700 clamp(14px,1.12vw,17px)/1.4 'IBM Plex Mono',monospace;letter-spacing:.025em;transition:color .25s,text-shadow .25s}
.biocopy .bio dt:hover{color:#ffc0b9;text-shadow:0 0 5px #ff534b,0 0 15px #ff3434,0 0 29px #ff3434a0}
.biocopy .bio dd{font-size:clamp(16px,1.28vw,20px);line-height:1.55;margin:4px 0 18px}
.biocopy .bio dd li{margin-bottom:8px}
#projects .filters{display:flex;align-items:center;gap:8px;margin-bottom:24px;flex-wrap:wrap}
#projects .filters button{font-size:13px;border:1px solid #533b3b;border-radius:20px;padding:8px 17px;transition:box-shadow .2s,border-color .2s}
#projects .filters button:hover{border-color:#ff6051;box-shadow:0 0 12px #ff423a55}
#projects .filters button[aria-pressed=true]{background:#ff6051;border-color:#ff6051;color:#161010}
#projects .cards{grid-template-columns:repeat(3,minmax(0,1fr));align-items:stretch}
#projects article{overflow:hidden;padding:0;display:flex;flex-direction:column;min-width:0}
#projects .project-visual{aspect-ratio:16/9;background:linear-gradient(135deg,#21191d,#0f1015);overflow:hidden;position:relative}
#projects .project-visual img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .5s}
#projects article:hover .project-visual img{transform:scale(1.045)}
#projects .project-body{padding:22px;display:flex;flex:1;flex-direction:column;gap:11px}
#projects .project-body h3{font-size:clamp(23px,2vw,28px);margin:0}
#projects .project-body p{font-size:15px;line-height:1.6}
#projects .project-tags{display:flex;gap:7px;flex-wrap:wrap;margin-top:auto;padding-top:8px}
#projects .project-tags span{font:600 11px/1.3 'IBM Plex Mono',monospace;color:#ffb2a9;border:1px solid #ff60517d;background:#ff47300d;border-radius:20px;padding:5px 9px;box-shadow:0 0 9px #ff514323}
#projects .project-tags span:hover{color:#fff;box-shadow:0 0 13px #ff443c9e}
#projects .project-link{display:inline-block;font:600 12px/1.6 'IBM Plex Mono',monospace;color:#ff8c7c;margin-top:5px}
#projects .project-link:hover{color:#ffd0c8}
@media(max-width:1050px){#projects .cards{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:760px){header .brand{white-space:normal}.hero .intro,.hero .biocopy,.hero .cinematic{transform:translateY(-2vh)}.hero .intro>p{font-size:18px}.biocopy .bio{grid-template-columns:1fr}.biocopy .bio>p{font-size:17px}}
@media(max-width:580px){#projects .cards{grid-template-columns:1fr}.brand-sub{font-size:12px}.biocopy .bio dd{font-size:16px}}
'''
if '</style>' not in h: raise SystemExit('Missing </style> in index.html. No files changed.')
h=h.replace('</style>',css+'\n</style>',1)
start=h.find('    const tracks = ['); end=h.find('\n</script>',start)
if start<0 or end<start:raise SystemExit('Cannot locate original project cards script. No files changed.')
new_script=r'''
    const tracks=['All','Robotics','Software'];
    const projects=[
      {category:'Robotics',title:'RipeSense',summary:'Multi-sensor fruit ripeness analysis combining spectral readings, RealSense vision, gas sensing and machine-learning fusion. Designed for robotic harvesting and automated sorting.',tags:['Python','ROS 2','Sensor Fusion','MobileNetV3','ONNX','Gazebo','RealSense'],image:'https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/005/813/650/datas/gallery.jpg'},
      {category:'Robotics',title:'SpaceBulls Autonomous Rover',summary:'Leading autonomy and perception development for a rover integrating stereo depth, LiDAR, IMU, GNSS/RTK, object detection and ROS 2 visualization and simulation.',tags:['ROS 2','ZED 2','LiDAR','RTK','YOLO','Docker','Gazebo','Foxglove'],art:'ROVER',status:'In progress'},
      {category:'Robotics',title:'Jackal Autonomy & Localization',summary:'Research on outdoor localization and navigation with a Clearpath Jackal, combining LiDAR-inertial mapping, GNSS/RTK, camera sensing and bird’s-eye-view localization.',tags:['ROS 2','FAST-LIO','Nav2','BEV','LiDAR','RTK','Fusion 360'],art:'JACKAL',status:'Research'},
      {category:'Robotics',title:'SPARK — Tangible Coding Robot',summary:'Hands-on robotics education kit where children assemble 3D-printed NFC instruction blocks and scan them to program an Arduino robot, supported by a learning website.',tags:['Arduino','C++','NFC','3D Printing','HTML','CSS','JavaScript'],image:'https://raw.githubusercontent.com/i-am-jillian/SPARK/main/assets/111.png',link:'https://github.com/i-am-jillian/SPARK'},
      {category:'Robotics',title:'FreeRTOS Robotic Arm',summary:'Building a four-degree-of-freedom embedded robotic arm with servo control, proximity and color sensing, OLED feedback and emergency controls.',tags:['FreeRTOS','Embedded C','Servos','I²C','Ultrasonic','Color Sensor'],art:'ARM',status:'In progress'},
      {category:'Robotics',title:'Soil Texture Classification',summary:'Trained a machine-learning model using a public dataset to classify soil texture as coarse, medium or fine from digital microscope imagery.',tags:['Machine Learning','Computer Vision','Image Classification','Microscopy'],art:'SOIL'},
      {category:'Software',title:'PlayFit AI',summary:'Computer-vision game controller that transforms webcam-based body pose estimates into real-time movement commands, turning gameplay into physical activity.',tags:['Python','OpenCV','NumPy','Pygame','Pose Estimation'],art:'PLAYFIT'},
      {category:'Software',title:'SafeBites',summary:'Full-stack ingredient safety platform that scans food labels and uses OCR plus collaborating AI agents to score ingredients and recommend alternatives.',tags:['Next.js','TypeScript','FastAPI','Python','Gemini','AI Agents','Auth0'],art:'SAFEBITES'},
      {category:'Software',title:'HomeMate',summary:'Sprint-built housing platform featuring property listings, profiles, authentication, saved homes, notifications, direct messaging and listing management.',tags:['React','JavaScript','PHP','HTML','CSS','REST APIs'],art:'HOMEMATE'},
      {category:'Software',title:'RAG Chunking Strategy Evaluation',summary:'Comparison of text chunking strategies and their impact on retrieval-augmented generation output quality, using IFS coaching as a domain-specific benchmark.',tags:['RAG','Retrieval','LLMs','Evaluation'],art:'RAG',link:'https://github.com/i-am-jillian/Evaluating-Retrieval-Chunking-Strategies-in-RAG-for-IFS-Coaching'}
    ];
    // Covers without project photos are original illustration graphics, not hardware photos.
    const motifs={ROVER:'⌁  ◈  ⇢',JACKAL:'⌖  ◎  ↗',ARM:'◉  ╱  ◇',SOIL:'▦  ◌  ◇',PLAYFIT:'◯  ↗  ◯',SAFEBITES:'◈  ✳  ◈',HOMEMATE:'⌂  ▣  ⌂',RAG:'▤  ⇄  ◇'};
    function cover(title,type){
      const esc=x=>x.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><defs><radialGradient id="g"><stop stop-color="#4a242b"/><stop offset="1" stop-color="#0c1017"/></radialGradient><pattern id="p" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="#ff6253" stroke-opacity=".09"/></pattern></defs><rect width="800" height="450" fill="url(#g)"/><rect width="800" height="450" fill="url(#p)"/><circle cx="605" cy="180" r="147" fill="none" stroke="#ff6659" stroke-opacity=".2" stroke-width="2"/><circle cx="605" cy="180" r="107" fill="none" stroke="#ff6659" stroke-opacity=".27"/><path d="M340 270H780M605 15V430" stroke="#ff6659" stroke-opacity=".15"/><text x="605" y="205" font-size="65" text-anchor="middle" fill="#ff8c7e" font-family="Arial">'+esc(motifs[type]||'◇')+'</text><rect x="48" y="55" width="70" height="4" rx="2" fill="#ff6253"/><text x="48" y="342" font-family="Arial" font-size="38" font-weight="bold" fill="#fff">'+esc(title.length>26?title.slice(0,24)+'…':title)+'</text><text x="49" y="382" font-family="monospace" font-size="16" fill="#ff9a8c">PROJECT VISUAL • CONCEPT ART</text></svg>';
      return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
    }
    const cards=document.querySelector('.cards');
    function filter(t){
      cards.replaceChildren();
      projects.filter(p=>t==='All'||p.category===t).forEach(p=>{
        const card=document.createElement('article');
        const visual=document.createElement('div');visual.className='project-visual';
        const img=document.createElement('img');img.src=p.image||cover(p.title,p.art);img.alt=p.image?p.title+' project photo':p.title+' illustrative project graphic';img.loading='lazy';
        visual.append(img);card.append(visual);
        const body=document.createElement('div');body.className='project-body';
        const type=document.createElement('small');type.className='meta';type.textContent=p.category+(p.status?' / '+p.status:'');
        const title=document.createElement('h3');title.textContent=p.title;
        const desc=document.createElement('p');desc.textContent=p.summary;
        const tags=document.createElement('div');tags.className='project-tags';
        p.tags.forEach(tag=>{const chip=document.createElement('span');chip.textContent=tag;tags.append(chip)});
        body.append(type,title,desc,tags);
        if(p.link){const link=document.createElement('a');link.href=p.link;link.target='_blank';link.rel='noopener noreferrer';link.className='project-link';link.textContent='View project ↗';body.append(link)}
        card.append(body);cards.append(card);
      });
      document.querySelectorAll('.filters button').forEach(b=>b.setAttribute('aria-pressed',String(b.textContent===t)));
    }
    tracks.forEach(t=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>filter(t);document.querySelector('.filters').append(b)});
    filter('All');
    const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('seen');observer.unobserve(e.target)}}));
    document.querySelectorAll('.timeline,.chips').forEach(el=>observer.observe(el));
'''
h=h[:start]+new_script+h[end:]
if "'Student','Researcher'" not in j: raise SystemExit('Cannot locate scene.js role list. No files changed.')
j=j.replace("'Student','Researcher'","'Student','Researcher','Lead'",1)
if 'words.length' not in j: raise SystemExit('Role cycling is not configured for full array. No files changed.')
if not (html.with_suffix('.html.bak')).exists(): html.with_suffix('.html.bak').write_text(html.read_text(encoding='utf-8'),encoding='utf-8')
if not (scene.with_suffix('.js.bak')).exists(): scene.with_suffix('.js.bak').write_text(scene.read_text(encoding='utf-8'),encoding='utf-8')
html.write_text(h,encoding='utf-8'); scene.write_text(j,encoding='utf-8')
print('Updated index.html and scene.js; created backups (*.bak).')
print('Review your site locally, then commit and push when satisfied.')
