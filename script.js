/**
 * Sarthak Kalia — Corner Shop / Zine Street Editorial JavaScript
 * Features:
 * 1. Background Music Controller: Double Decker by Eyekash (Autoplay & Interaction Listener)
 * 2. Brand-Based Slider Track (The Earthly Life, Silicon Uni, Ruchi, driEV, WideAngle, Personal)
 * 3. In-Page Pop-up Video Reel Player Modal (No external browser redirection)
 * 4. Prev / Next Modal Controls & Keyboard Navigation
 * 5. Mobile Menu & Scroll Observers
 */

document.addEventListener('DOMContentLoaded', () => {


  // 2. Navbar Scroll & Ticker Offset Effect
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }
  }, { passive: true });

  // 3. Mobile Navigation Toggle
  const menuBtn = document.querySelector('.menu-btn');
  const mobileOverlay = document.querySelector('.mobile-nav-overlay');

  if (menuBtn && mobileOverlay) {
    const toggleMenu = () => {
      const isOpen = mobileOverlay.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menuBtn.textContent = isOpen ? '✕' : '☰';
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    menuBtn.addEventListener('click', toggleMenu);

    mobileOverlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (mobileOverlay.classList.contains('open')) {
          toggleMenu();
        }
      });
    });
  }

  // 4. Brand-Based Slider Switch (The Earthly Life, Silicon Uni, Ruchi, driEV, WideAngle, Personal)
  const sliderPill = document.getElementById('slider-pill');
  const sliderOptions = document.querySelectorAll('.slider-option');
  const btnShowAll = document.getElementById('btn-show-all');
  const projects = Array.from(document.querySelectorAll('.zine-card'));
  const brandHeaders = Array.from(document.querySelectorAll('.brand-section-header'));

  const updatePillPosition = (activeBtn) => {
    if (!activeBtn || !sliderPill) return;
    // Only update pill if we're not in a wrapped/mobile layout
    const track = document.getElementById('slider-track');
    if (track && window.getComputedStyle(track).flexWrap === 'wrap') {
      // In wrapped mode, hide pill and use background color instead
      sliderPill.style.opacity = '0';
      return;
    }
    const offsetLeft = activeBtn.offsetLeft;
    const width = activeBtn.offsetWidth;
    sliderPill.style.transform = `translateX(${offsetLeft - 4}px)`;
    sliderPill.style.width = `${width}px`;
    sliderPill.style.opacity = '1';
  };

  const filterCategory = (category, activeElement) => {
    sliderOptions.forEach(opt => opt.classList.remove('active'));
    btnShowAll?.classList.remove('active');

    if (activeElement && activeElement.classList.contains('slider-option')) {
      activeElement.classList.add('active');
      updatePillPosition(activeElement);
    } else if (category === 'all' && sliderPill) {
      sliderPill.style.opacity = '0';
      btnShowAll?.classList.add('active');
    }

    // Filter video cards
    projects.forEach(project => {
      const cardCategory = project.getAttribute('data-category');
      if (category === 'all' || cardCategory === category) {
        project.classList.remove('hidden');
      } else {
        project.classList.add('hidden');
      }
    });

    // Filter brand section headers
    brandHeaders.forEach(header => {
      const headerCategory = header.getAttribute('data-category');
      if (category === 'all' || headerCategory === category) {
        header.classList.remove('hidden');
      } else {
        header.classList.add('hidden');
      }
    });
  };

  sliderOptions.forEach(option => {
    option.addEventListener('click', () => {
      const category = option.getAttribute('data-category');
      filterCategory(category, option);
    });
  });

  btnShowAll?.addEventListener('click', () => {
    filterCategory('all', null);
  });

  // Initialize pill position on load for default active tab
  const initialActiveTab = document.querySelector('.slider-option.active');
  if (initialActiveTab) {
    const category = initialActiveTab.getAttribute('data-category');
    filterCategory(category, initialActiveTab);

    setTimeout(() => updatePillPosition(initialActiveTab), 100);
    window.addEventListener('resize', () => {
      const currentActive = document.querySelector('.slider-option.active');
      if (currentActive) updatePillPosition(currentActive);
    });
  }

  // 5. Pop-up Video Reel Player Modal Controller
  const modal = document.getElementById('reel-modal');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalClose = document.getElementById('modal-close');
  const modalTitle = document.getElementById('modal-title');
  const modalTag = document.getElementById('modal-tag');
  const modalCaption = document.getElementById('modal-caption');
  const modalVideoPlayer = document.getElementById('modal-video-player');
  const modalVideoSource = document.getElementById('modal-video-source');
  const modalIframe = document.getElementById('modal-iframe');
  const modalExternalLink = document.getElementById('modal-external-link');
  const modalPrev = document.getElementById('modal-prev');
  const modalNext = document.getElementById('modal-next');

  let currentProjectIndex = 0;

  const getVisibleProjects = () => {
    return projects.filter(p => !p.classList.contains('hidden'));
  };

  const switchToIframeEmbed = (shortcode) => {
    if (modalVideoPlayer) modalVideoPlayer.style.display = 'none';
    if (modalIframe) {
      modalIframe.style.display = 'block';
      modalIframe.src = `https://www.instagram.com/p/${shortcode}/embed/`;
    }
  };

  const openModal = (projectCard) => {
    const shortcode = projectCard.getAttribute('data-shortcode');
    const title = projectCard.getAttribute('data-title');
    const tag = projectCard.getAttribute('data-tag');
    const caption = projectCard.getAttribute('data-caption');
    const url = projectCard.getAttribute('data-url');

    currentProjectIndex = parseInt(projectCard.getAttribute('data-index') || '0', 10);

    if (modalTitle) modalTitle.textContent = title;
    if (modalTag) modalTag.textContent = tag;
    if (modalCaption) modalCaption.textContent = caption;
    if (modalExternalLink) modalExternalLink.href = url;

    // Direct Instagram embed loading for guaranteed seamless playback inside the pop-up modal
    switchToIframeEmbed(shortcode);

    modal?.classList.add('active');
    modal?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal?.classList.remove('active');
    modal?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (modalVideoPlayer) {
      modalVideoPlayer.pause();
      if (modalVideoSource) modalVideoSource.src = '';
    }
    if (modalIframe) {
      modalIframe.src = '';
    }
  };

  const navigateModal = (direction) => {
    const visibleList = getVisibleProjects();
    if (visibleList.length === 0) return;

    let currentIndexInVisible = visibleList.findIndex(
      p => parseInt(p.getAttribute('data-index') || '0', 10) === currentProjectIndex
    );

    if (currentIndexInVisible === -1) currentIndexInVisible = 0;

    let nextIndexInVisible = (currentIndexInVisible + direction + visibleList.length) % visibleList.length;
    openModal(visibleList[nextIndexInVisible]);
  };

  // Card click event listeners - Ensure e.preventDefault() to strictly prevent browser redirect
  projects.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Card scale click effect
      card.animate(
        [
          { transform: 'scale(0.985)' },
          { transform: 'scale(1)' }
        ],
        {
          duration: 220,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
        }
      );

      openModal(card);
    });
  });

  modalClose?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', closeModal);
  modalPrev?.addEventListener('click', () => navigateModal(-1));
  modalNext?.addEventListener('click', () => navigateModal(1));

  // Keyboard navigation support
  document.addEventListener('keydown', (e) => {
    if (!modal?.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      navigateModal(-1);
    } else if (e.key === 'ArrowRight') {
      navigateModal(1);
    }
  });

  // 6. Scroll Reveal Observer for Elements with `.fade-up`
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.02
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-up').forEach(el => revealObserver.observe(el));
});
