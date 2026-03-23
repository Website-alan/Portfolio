import * as THREE from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- 1. Setup Scene, Camera, Renderer ---
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 4;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true, // transparent background
  antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 2. Create Premium 3D Object ---
// We use a Torus Knot but render it as points for an abstract, glowing, high-tech feel
const geometry = new THREE.TorusKnotGeometry(1.5, 0.6, 300, 40);

// Add a slight variance to points to make it look like a particle cloud
const positions = geometry.attributes.position.array;
for(let i = 0; i < positions.length; i++) {
  positions[i] += (Math.random() - 0.5) * 0.05;
}

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.015,
  color: '#c77dff',
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(geometry, particlesMaterial);
// Offset it to the right for desktop, so it balances the text on the left
particlesMesh.position.x = sizes.width > 768 ? 1.5 : 0;
scene.add(particlesMesh);

// --- 3. Interaction Variables ---
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// Raycaster for 3D interactions
const raycaster = new THREE.Raycaster();
const mouseRay = new THREE.Vector2();

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX - windowHalfX);
  mouseY = (event.clientY - windowHalfY);
  
  // Normalize for raycaster
  mouseRay.x = (event.clientX / sizes.width) * 2 - 1;
  mouseRay.y = -(event.clientY / sizes.height) * 2 + 1;
});

let scrollY = window.scrollY;
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
});

// --- 4. Animation Loop ---
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Gentle autonomous rotation
  particlesMesh.rotation.y = elapsedTime * 0.1;
  particlesMesh.rotation.x = elapsedTime * 0.05;

  // React to mouse movement
  targetX = mouseX * 0.001;
  targetY = mouseY * 0.001;

  particlesMesh.rotation.y += 0.5 * (targetX - particlesMesh.rotation.y);
  particlesMesh.rotation.x += 0.5 * (targetY - particlesMesh.rotation.x);

  // React to scroll: Move mesh up as user scrolls down, and give it extra rotation
  particlesMesh.position.y = -scrollY * 0.0015;
  particlesMesh.rotation.z = scrollY * 0.002;

  // Raycaster node scattering interaction
  raycaster.setFromCamera(mouseRay, camera);
  const intersects = raycaster.intersectObject(particlesMesh);
  
  if(intersects.length > 0) {
    // Bulge up and turn cyan on hover
    particlesMesh.scale.x += (1.1 - particlesMesh.scale.x) * 0.1;
    particlesMesh.scale.y += (1.1 - particlesMesh.scale.y) * 0.1;
    particlesMaterial.color.lerp(new THREE.Color('#0cebeb'), 0.1);
  } else {
    // Return to normal scale and purple color
    particlesMesh.scale.x += (1.0 - particlesMesh.scale.x) * 0.1;
    particlesMesh.scale.y += (1.0 - particlesMesh.scale.y) * 0.1;
    particlesMaterial.color.lerp(new THREE.Color('#c77dff'), 0.1);
  }

  // Image Parallax scroll feature
  const heroPhoto = document.querySelector('.hero-background-photo');
  if (heroPhoto) {
    // Calculate the maximum distance it can travel left (e.g., stopping when it hits the left edge)
    const maxLeftMove = sizes.width * 0.55;
    let currentMoveX = scrollY * 0.9;
    
    // Cap the movement so it permanently stays on the left edge and NEVER goes offscreen
    if (currentMoveX > maxLeftMove) {
        currentMoveX = maxLeftMove;
    }

    // Transforms the image to slide smoothly from right to left, then hold its position
    heroPhoto.style.transform = `translateX(${-currentMoveX}px) translateY(${scrollY * 0.05}px)`;
    
    // Constant visibility: NEVER fade out
    heroPhoto.style.opacity = 0.25;
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

// --- 5. Handle Resize ---
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update object position based on screen width
  particlesMesh.position.x = sizes.width > 768 ? 1.5 : 0;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// --- 6. GSAP UI Animations ---
// Reveal animations on load
const tl = gsap.timeline();

tl.from('.navbar', {
  y: '-100%',
  opacity: 0,
  duration: 1,
  ease: 'power3.out'
})
.from('.hero-content h2', {
  y: 30,
  opacity: 0,
  duration: 0.8,
  ease: 'power3.out'
}, '-=0.5')
.from('.hero-content h1', {
  y: 30,
  opacity: 0,
  duration: 0.8,
  ease: 'power3.out'
}, '-=0.6')
.from('.hero-content p', {
  y: 30,
  opacity: 0,
  duration: 0.8,
  ease: 'power3.out'
}, '-=0.6')
.from('.cta-group', {
  y: 30,
  opacity: 0,
  duration: 0.8,
  ease: 'power3.out'
}, '-=0.6')
.from(particlesMesh.position, {
  z: -5,
  duration: 1.5,
  ease: 'power3.out'
}, '-=1.5')
.from(particlesMaterial, {
  opacity: 0,
  duration: 1.5,
  ease: 'power3.out'
}, '-=1.5');

// --- 7. Hero Typewriter Animation ---
const heroType1 = document.getElementById('hero-type-1');
const heroType2 = document.getElementById('hero-type-2');
const heroType3 = document.getElementById('hero-type-3');

if (heroType1 && heroType2 && heroType3) {
  const text1 = "Software Developer";
  const text2 = "& ";
  const dynamicWords = ["Designer", "Digital Marketer"];
  
  let typeIndex1 = 0;
  let typeIndex2 = 0;
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  
  const speed = 70; // ms per keystroke

  function typeStatic() {
    if (typeIndex1 < text1.length) {
      heroType1.textContent += text1.charAt(typeIndex1);
      typeIndex1++;
      setTimeout(typeStatic, speed);
    } else if (typeIndex2 < text2.length) {
      heroType2.textContent += text2.charAt(typeIndex2);
      typeIndex2++;
      setTimeout(typeStatic, speed);
    } else {
      // Static text is done, trigger infinite dynamic loop immediately
      setTimeout(typeDynamic, 200);
    }
  }

  function typeDynamic() {
    const currentWord = dynamicWords[wordIndex];
    
    if (isDeleting) {
      // Remove a character
      heroType3.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      // Add a character
      heroType3.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    // Deleting should be slightly faster than typing
    let typeSpeed = isDeleting ? 40 : speed;

    if (!isDeleting && charIndex === currentWord.length) {
      // Word is fully typed out. Pause for 2.5 seconds before starting deletion.
      typeSpeed = 2500;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // Word is fully deleted. Swap to next word.
      isDeleting = false;
      wordIndex = (wordIndex + 1) % dynamicWords.length;
      typeSpeed = 400; // Small pause before typing the next word
    }

    setTimeout(typeDynamic, typeSpeed);
  }

  // Start typing slightly after the GSAP reveal completes
  setTimeout(typeStatic, 1000);
}

// --- 8. Custom Magnetic Cursor ---
const cursor = document.querySelector('.custom-cursor');
const follower = document.querySelector('.custom-cursor-follower');
let posX = 0, posY = 0;
let mouseCX = 0, mouseCY = 0;

gsap.to({}, 0.016, { // 60fps loop for follower
  repeat: -1,
  onRepeat: function() {
    posX += (mouseCX - posX) / 9;
    posY += (mouseCY - posY) / 9;
    
    gsap.set(follower, {
      css: {
        left: posX,
        top: posY
      }
    });
    gsap.set(cursor, {
      css: {
        left: mouseCX,
        top: mouseCY
      }
    });
  }
});

// We only want to track mouse in screen space for the cursor
document.addEventListener('mousemove', (e) => {
  mouseCX = e.clientX;
  mouseCY = e.clientY;
});

// Magnetic hover effect
const hoverElements = document.querySelectorAll('a, .btn, .project-card, .logo');
hoverElements.forEach(el => {
  el.addEventListener('mouseenter', () => follower.classList.add('active'));
  el.addEventListener('mouseleave', () => follower.classList.remove('active'));
});

// --- 8. 3D Tilt on Project Cards ---
const cards = document.querySelectorAll('.project-card, .expertise-card');

cards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -8; // Max tilt 8deg
    const rotateY = ((x - centerX) / centerX) * 8;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    card.style.transition = `transform 0.5s ease`;
  });
  
  card.addEventListener('mouseenter', () => {
    card.style.transition = `none`;
  });
});

// --- 9. ScrollTrigger Reveal Animations ---
gsap.utils.toArray('.section-title').forEach(title => {
  gsap.from(title, {
    scrollTrigger: {
      trigger: title,
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    },
    y: 30,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  });
});

gsap.utils.toArray('.glass-panel:not(.project-card, .ai-chat-window)').forEach(panel => {
  gsap.from(panel, {
    scrollTrigger: {
      trigger: panel,
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    },
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  });
});

// Timeline Scroll Node Animation
const timeline = document.querySelector('.timeline');
const progressLine = document.querySelector('.timeline-progress-line');

if (timeline && progressLine) {
  gsap.to(progressLine, {
    height: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: timeline,
      start: 'top center',
      end: 'bottom center',
      scrub: 0.5,
    }
  });
}

// --- 10. Alan-AI Interactive Assistant ---
const aiOrb = document.getElementById('aiOrb');
const aiChatWindow = document.getElementById('aiChatWindow');
const closeChat = document.getElementById('closeChat');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

if(aiOrb && aiChatWindow) {
  aiOrb.addEventListener('click', () => {
    aiChatWindow.style.display = 'flex';
    aiOrb.style.display = 'none';
    chatInput.focus();
  });

  closeChat.addEventListener('click', () => {
    aiChatWindow.style.display = 'none';
    aiOrb.style.display = 'flex';
  });
}

// --- 11. Certificate Modal Logic ---
const certModal = document.getElementById('certModal');
const viewCertBtn = document.getElementById('viewCertBtn');
const closeCert = document.getElementById('closeCert');
const certFrame = document.getElementById('certFrame');

if (certModal && viewCertBtn && closeCert && certFrame) {
  viewCertBtn.addEventListener('click', () => {
    // Set the PDF source and show modal
    certFrame.src = "Diploma Digital Marketing.pdf";
    certModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  });

  closeCert.addEventListener('click', () => {
    certModal.style.display = 'none';
    certFrame.src = ""; // Clear src to stop any loading/processing
    document.body.style.overflow = 'auto'; // Restore scrolling
  });

  // Close on backdrop click
  certModal.addEventListener('click', (e) => {
    if (e.target === certModal) {
      closeCert.click();
    }
  });
}

// NLP Brain Dictionary
const alanKnowledge = {
  greetings: {
    keys: ["hello", "hi", "hey", "greetings", "morning", "afternoon"],
    response: "Hello! I am Alan-AI, a localized language model programmed to assist you. What would you like to know about Alan?"
  },
  python: {
    keys: ["python", "django", "backend", "api", "database"],
    response: "Alan is highly proficient in Python and Django. He relies on these technologies to engineer robust, scalable backend architectures capable of handling complex data relations effortlessly."
  },
  marketing: {
    keys: ["marketing", "seo", "digital", "campaign", "ads", "advertising", "market"],
    response: "Beyond code, Alan is a certified Digital Marketer. He integrates SEO strategies and campaign analytics directly into his application architectures to maximize product visibility and user conversion rates."
  },
  experience: {
    keys: ["experience", "work", "job", "skills", "capable", "can you", "what do you do", "hire", "resume", "cv"],
    response: "Alan operates at the intersection of Software Development, UI/UX Design, and Digital Marketing. He is fully capable of taking a product from early wireframes to a fully deployed and marketed MVP."
  },
  contact: {
    keys: ["contact", "email", "talk", "reach", "message", "call", "phone"],
    response: "You can reach Alan directly via email at alanbennyvellanjiyil@gmail.com, or through his glowing LinkedIn link in the 'Let's Connect' section below!"
  },
  projects: {
    keys: ["projects", "portfolio", "built", "benny stores", "financetrack", "benny", "finance", "track", "examples"],
    response: "Alan has engineered several major systems, including 'Benny Stores', a comprehensive credit and inventory management application, and 'FinanceTrack', an autonomous group expensing algorithm."
  },
  ai: {
    keys: ["ai", "assistant", "bot", "chat", "artificial intelligence", "llm", "architecture", "who are you", "what are you"],
    response: "I am a custom Natural Language Processing engine built natively into this browser to demonstrate Alan's command over programming and creative software design!"
  }
};

const defaultResponse = "That's an interesting question. Alan's skill set is vast, spanning full-stack development and strategic marketing. Feel free to contact him directly at alanbennyvellanjiyil@gmail.com to discuss that topic in detail!";

// Utility to add messages
function appendMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}-message`;
  msgDiv.innerHTML = text;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msgDiv;
}

// Typewriter effect
function typeWriter(element, text, speed = 25) {
  element.innerHTML = "";
  let i = 0;
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      chatMessages.scrollTop = chatMessages.scrollHeight;
      setTimeout(type, speed);
    }
  }
  type();
}

if(chatForm) {
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = chatInput.value.trim().toLowerCase();
    if(!query) return;

    // 1. User Message
    appendMessage(query, 'user');
    chatInput.value = '';

    // 2. Typing Indicator
    const typingIndicator = appendMessage('<span class="typing-indicator">Alan-AI is typing...</span>', 'ai');

    // 3. Process NLP
    let matchedResponse = defaultResponse;
    const words = query.replace(/[^\w\s]/g, '').split(/\s+/);

    for (const category in alanKnowledge) {
      const { keys, response } = alanKnowledge[category];
      // Check if any keyword exists in the user's sentence
      if (keys.some(key => words.includes(key) || query.includes(key))) {
        matchedResponse = response;
        break; // Match found
      }
    }

    // 4. Simulate Delay and respond
    setTimeout(() => {
      typingIndicator.innerHTML = "";
      typeWriter(typingIndicator, matchedResponse);
    }, 600 + Math.random() * 600); // 600-1200ms delay
  });
}
