# Jill’s robotics portfolio

Unzip the archive, open a terminal in the folder containing index.html, and run

    python3 -m http.server 8000

Open http://localhost:8000 in a WebGL 2-capable browser. The local Three.js modules are included. The site requires no build step or external asset downloads.

Scroll down from the helmet to reveal Jill and pull back to her workbench. Scroll up to reverse the animation. The pointer adjusts her gaze and head pose. With system reduced motion enabled, the page presents the lab and both introductions in a static layout.

The portfolio sections and their editable sample content are in index.html. The mesh models, lights, pose, and camera are in lab.js. The scroll sequence, role typing, and original contact projection are in scene.js.

The studio uses red rim lighting and a hinged sensor assembly with a raised crest, central camera, twin range sensors, and vented jaw actuators. The floor, tabletop, and keyboard trace eight short shadow rays per shaded point against nearby box and ellipsoid proxies. The fingertip proxies follow the animated joints. contact-shadows.js contains the shadow shader. The laptop spill is a diffuse lighting term sampled across the screen.
