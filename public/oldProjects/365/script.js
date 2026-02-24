function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  function revealSections() {
    const sections = document.querySelectorAll('section');
    sections.forEach((section) => {
      if (isInViewport(section)) {
        section.classList.add('visible');
      }
    });
  }

   function scrollToSection(targetSection) {
    const section = document.querySelector(targetSection);
    const offset = 175;
    if (section) {
      const sectionPosition = section.offsetTop - offset;

      window.scrollTo({
        top: sectionPosition,
        behavior: 'smooth'
      });
    }
  }

  function attachSmoothScrolling() {
    const navLinks = document.querySelectorAll('.navContent');
    navLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();

        const targetSection = event.target.getAttribute('href');
        scrollToSection(targetSection);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', attachSmoothScrolling);
  document.addEventListener('scroll', revealSections);
  window.addEventListener('load', revealSections);