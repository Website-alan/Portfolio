import * as THREE from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Make GSAP and ScrollTrigger globally accessible for debugging and cross-module use
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;

// --- 1. Setup Scene, Camera, Renderer ---
const canvas = document.querySelector('canvas.webgl');
if (canvas) {
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
  const geometry = new THREE.TorusKnotGeometry(1.5, 0.6, 300, 40);

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
  particlesMesh.position.x = sizes.width > 768 ? 1.5 : 0;
  scene.add(particlesMesh);

  // --- 3. Interaction Variables ---
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  const raycaster = new THREE.Raycaster();
  const mouseRay = new THREE.Vector2();

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
    
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

    particlesMesh.rotation.y = elapsedTime * 0.1;
    particlesMesh.rotation.x = elapsedTime * 0.05;

    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;

    particlesMesh.rotation.y += 0.5 * (targetX - particlesMesh.rotation.y);
    particlesMesh.rotation.x += 0.5 * (targetY - particlesMesh.rotation.x);

    particlesMesh.position.y = -scrollY * 0.0015;
    particlesMesh.rotation.z = scrollY * 0.002;

    raycaster.setFromCamera(mouseRay, camera);
    const intersects = raycaster.intersectObject(particlesMesh);
    
    if(intersects.length > 0) {
      particlesMesh.scale.x += (1.1 - particlesMesh.scale.x) * 0.1;
      particlesMesh.scale.y += (1.1 - particlesMesh.scale.y) * 0.1;
      particlesMaterial.color.lerp(new THREE.Color('#0cebeb'), 0.1);
    } else {
      particlesMesh.scale.x += (1.0 - particlesMesh.scale.x) * 0.1;
      particlesMesh.scale.y += (1.0 - particlesMesh.scale.y) * 0.1;
      particlesMaterial.color.lerp(new THREE.Color('#c77dff'), 0.1);
    }

    // Side Visuals Fade Logic
    const sideVisuals = document.querySelector('.side-visuals');
    if (sideVisuals) {
       // Handled by ScrollTrigger below in initScrollAnimations
    }
 
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };

  tick();

  // --- 5. Handle Resize ---
  window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    particlesMesh.position.x = sizes.width > 768 ? 1.5 : 0;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // Reveal animation for mesh
  gsap.from(particlesMesh.position, {
    z: -5,
    duration: 1.5,
    ease: 'power3.out',
    delay: 0.5
  });
  gsap.from(particlesMaterial, {
    opacity: 0,
    duration: 1.5,
    ease: 'power3.out',
    delay: 0.5
  });
}

// --- 6. GSAP UI Animations ---
const tl = gsap.timeline();

if (document.querySelector('.navbar')) {
  tl.from('.navbar', {
    y: '-100%',
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  });
}

if (document.querySelector('.hero-content')) {
  tl.from('.hero-content h2', {
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
  }, '-=0.6');
}

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
  
  const speed = 70;

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
      setTimeout(typeDynamic, 200);
    }
  }

  function typeDynamic() {
    const currentWord = dynamicWords[wordIndex];
    if (isDeleting) {
      heroType3.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      heroType3.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    let typeSpeed = isDeleting ? 40 : speed;
    if (!isDeleting && charIndex === currentWord.length) {
      typeSpeed = 2500;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % dynamicWords.length;
      typeSpeed = 400;
    }
    setTimeout(typeDynamic, typeSpeed);
  }

  setTimeout(typeStatic, 1000);
}

// --- 8. Custom Magnetic Cursor ---
const cursor = document.querySelector('.custom-cursor');
const follower = document.querySelector('.custom-cursor-follower');

if (cursor && follower) {
  let posX = 0, posY = 0;
  let mouseCX = 0, mouseCY = 0;

  gsap.to({}, 0.016, {
    repeat: -1,
    onRepeat: function() {
      posX += (mouseCX - posX) / 9;
      posY += (mouseCY - posY) / 9;
      
      gsap.set(follower, {
        css: { left: posX, top: posY }
      });
      gsap.set(cursor, {
        css: { left: mouseCX, top: mouseCY }
      });
    }
  });

  document.addEventListener('mousemove', (e) => {
    mouseCX = e.clientX;
    mouseCY = e.clientY;
  });

  const updateHoverElements = () => {
    const hoverElements = document.querySelectorAll('a, .btn, .project-card, .logo, .gallery-item, .logo-item');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => follower.classList.add('active'));
      el.addEventListener('mouseleave', () => follower.classList.remove('active'));
    });
  };
  updateHoverElements();
}

// --- 9. 3D Tilt on interactive elements ---
const cards = document.querySelectorAll('.project-card, .expertise-card, .gallery-item, .logo-item, .main-snapshot');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    card.style.setProperty('--glow-x', `${percentX}%`);
    card.style.setProperty('--glow-y', `${percentY}%`);
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    card.style.transition = `transform 0.5s ease`;
  });
  
  card.addEventListener('mouseenter', () => {
    card.style.transition = `none`;
  });
});

// --- 10. ScrollTrigger Reveal Animations ---
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

const initScrollAnimations = () => {
  gsap.utils.toArray('.glass-panel:not(.project-card, .ai-chat-window, .modal-container), .reveal-item').forEach(panel => {
    gsap.fromTo(panel, 
      { opacity: 0, y: 40 }, 
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: panel,
          start: 'top bottom-=50px', // Trigger as soon as it's almost in view
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  // Reveal Side Visuals from About Section Downwards
  const sideVisuals = document.querySelector('.side-visuals');
  if (sideVisuals) {
    gsap.to(sideVisuals, {
      opacity: 1,
      scrollTrigger: {
        trigger: '#about',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  const logoItems = document.querySelectorAll('.logo-item');
  if (logoItems.length > 0) {
    gsap.fromTo(logoItems, 
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '#logoGrid',
          start: 'top 90%',
        }
      }
    );
  }
  
  ScrollTrigger.refresh();
};

// Initialize animations on DOM ready or immediately if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollAnimations);
} else {
  initScrollAnimations();
}

// Also refresh on window load to handle images/assets affecting layout
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
});

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

// --- 11. Alan-AI Interactive Assistant ---
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

function appendMessage(text, sender) {
  if (!chatMessages) return;
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}-message`;
  msgDiv.innerHTML = text;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msgDiv;
}

function typeWriter(element, text, speed = 25) {
  element.innerHTML = "";
  let i = 0;
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
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

    appendMessage(query, 'user');
    chatInput.value = '';

    const typingIndicator = appendMessage('<span class="typing-indicator">Alan-AI is typing...</span>', 'ai');

    let matchedResponse = defaultResponse;
    const words = query.replace(/[^\w\s]/g, '').split(/\s+/);

    for (const category in alanKnowledge) {
      const { keys, response } = alanKnowledge[category];
      if (keys.some(key => words.includes(key) || query.includes(key))) {
        matchedResponse = response;
        break;
      }
    }

    setTimeout(() => {
      typingIndicator.innerHTML = "";
      typeWriter(typingIndicator, matchedResponse);
    }, 600 + Math.random() * 600);
  });
}

// --- 12. Certificate Modal Logic ---
const certModal = document.getElementById('certModal');
const viewCertBtn = document.getElementById('viewCertBtn');
const closeCert = document.getElementById('closeCert');
const certFrame = document.getElementById('certFrame');

if (certModal && viewCertBtn && closeCert && certFrame) {
  viewCertBtn.addEventListener('click', () => {
    certFrame.src = "assets/docs/Diploma Digital Marketing.pdf";
    certModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });

  closeCert.addEventListener('click', () => {
    certModal.style.display = 'none';
    certFrame.src = "";
    document.body.style.overflow = 'auto';
  });

  certModal.addEventListener('click', (e) => {
    if (e.target === certModal) {
      closeCert.click();
    }
  });
}

