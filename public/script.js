// Initialize Lucide icons
lucide.createIcons();

// Slider functionality
const slides = [
  {
    title: "Innovative Solutions",
    description: "Transforming businesses through cutting-edge technology",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1470&q=80",
  },
  {
    title: "Global Reach",
    description: "Connecting businesses across continents",
    image:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1470&q=80",
  },
  {
    title: "Expert Team",
    description: "Dedicated professionals delivering excellence",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1470&q=80",
  },
];

let currentSlide = 0;

// Features data
const features = [
  { icon: "rocket", title: "Fast Development" },
  { icon: "shield", title: "Secure Solutions" },
  { icon: "globe", title: "Global Reach" },
  { icon: "code-2", title: "Clean Code" },
  { icon: "users", title: "Team Collaboration" },
  { icon: "layout", title: "Responsive Design" },
  { icon: "settings", title: "Easy Integration" },
  { icon: "zap", title: "High Performance" },
];

// Stats data
const stats = [
  { number: "500+", label: "Clients Worldwide" },
  { number: "1000+", label: "Projects Completed" },
  { number: "50+", label: "Team Members" },
  { number: "99%", label: "Client Satisfaction" },
];

// Update slide content
function updateSlide() {
  const slideImage = document.getElementById("slide-image");
  const slideTitle = document.getElementById("slide-title");
  const slideDescription = document.getElementById("slide-description");

  slideImage.style.opacity = "0";
  setTimeout(() => {
    slideImage.src = slides[currentSlide].image;
    slideTitle.textContent = slides[currentSlide].title;
    slideDescription.textContent = slides[currentSlide].description;
    slideImage.style.opacity = "1";
  }, 300);
}

// Initialize features grid
function initializeFeatures() {
  const featuresGrid = document.getElementById("features-grid");
  features.forEach((feature) => {
    const featureCard = document.createElement("div");
    featureCard.className =
      "p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow feature-card";
    featureCard.innerHTML = `
      <div class="text-blue-600 mb-4">
        <i data-lucide="${feature.icon}" class="w-6 h-6"></i>
      </div>
      <h3 class="text-xl font-semibold mb-2">${feature.title}</h3>
      <p class="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    `;
    featuresGrid.appendChild(featureCard);
  });
  lucide.createIcons();
}

// Initialize stats grid
function initializeStats() {
  const statsGrid = document.getElementById("stats-grid");
  stats.forEach((stat) => {
    const statCard = document.createElement("div");
    statCard.className = "text-center text-white";
    statCard.innerHTML = `
      <div class="text-4xl font-bold mb-2 stat-number">${stat.number}</div>
      <div class="text-blue-100">${stat.label}</div>
    `;
    statsGrid.appendChild(statCard);
  });
}

// Initialize testimonials
function initializeTestimonials() {
  const testimonialsGrid = document.getElementById("testimonials-grid");
  for (let i = 0; i < 3; i++) {
    const testimonialCard = document.createElement("div");
    testimonialCard.className = "p-8 bg-gray-50 rounded-xl testimonial-card";
    testimonialCard.innerHTML = `
      <div class="flex mb-4">
        ${Array(5)
          .fill('<i data-lucide="star" class="w-5 h-5 text-yellow-400"></i>')
          .join("")}
      </div>
      <p class="text-gray-600 mb-6">"Exceptional service and outstanding results. Highly recommended!"</p>
      <div class="flex items-center">
        <img
          src="https://i.pravatar.cc/150?img=${i + 1}"
          alt="Client"
          class="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <div class="font-semibold">John Doe</div>
          <div class="text-gray-500 text-sm">CEO, Tech Corp</div>
        </div>
      </div>
    `;
    testimonialsGrid.appendChild(testimonialCard);
  }
  lucide.createIcons();
}

// Event Listeners
document.getElementById("prev-slide").addEventListener("click", () => {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateSlide();
});

document.getElementById("next-slide").addEventListener("click", () => {
  currentSlide = (currentSlide + 1) % slides.length;
  updateSlide();
});

document.getElementById("subscribe-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const emailInput = document.getElementById("email-input");
  alert("Thank you for subscribing!");
  emailInput.value = "";
});

// Initialize everything when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  updateSlide();
  initializeFeatures();
  initializeStats();
  initializeTestimonials();

  // Auto-advance slides every 5 seconds
  setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlide();
  }, 5000);
});
