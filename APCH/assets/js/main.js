// assets/js/main.js
document.addEventListener('DOMContentLoaded', function() {
    // ========== MOBILE NAVIGATION ==========
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.main-nav') && navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // ========== IMAGE SLIDER ==========
    let currentSlide = 0;
    const slides = document.querySelectorAll('.elder-slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (slides.length > 0) {
        function showSlide(index) {
            slides.forEach(slide => {
                slide.classList.remove('active');
                slide.setAttribute('aria-hidden', 'true');
            });
            
            if (index >= slides.length) currentSlide = 0;
            if (index < 0) currentSlide = slides.length - 1;
            
            slides[currentSlide].classList.add('active');
            slides[currentSlide].setAttribute('aria-hidden', 'false');
        }
        
        function nextSlide() {
            currentSlide++;
            showSlide(currentSlide);
        }
        
        function prevSlide() {
            currentSlide--;
            showSlide(currentSlide);
        }
        
        // Auto-advance slides
        let slideInterval = setInterval(nextSlide, 6000);
        
        const sliderContainer = document.querySelector('.elder-slider-container');
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
            sliderContainer.addEventListener('mouseleave', () => {
                slideInterval = setInterval(nextSlide, 6000);
            });
        }
        
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        });
        
        showSlide(currentSlide);
    }

    // ========== RESOURCE TOGGLE FUNCTION ==========
    window.toggleResourceDetails = function(resourceId) {
        const details = document.getElementById(`${resourceId}-details`);
        const toggleText = document.getElementById(`${resourceId}-toggle-text`);
        const toggleIcon = document.getElementById(`${resourceId}-toggle-icon`);
        const toggleBtn = document.querySelector(`[onclick="toggleResourceDetails('${resourceId}')"]`);
        
        if (!details) return;
        
        const isHidden = details.style.display === 'none' || details.style.display === '';
        
        if (isHidden) {
            details.style.display = 'block';
            details.setAttribute('aria-hidden', 'false');
            if (toggleText) toggleText.textContent = 'Show Less';
            if (toggleIcon) toggleIcon.style.transform = 'rotate(90deg)';
            if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
        } else {
            details.style.display = 'none';
            details.setAttribute('aria-hidden', 'true');
            if (toggleText) toggleText.textContent = 'Read More';
            if (toggleIcon) toggleIcon.style.transform = 'rotate(0deg)';
            if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
        }
    };

    // ========== SEARCH FUNCTIONALITY ==========
    const searchTrigger = document.getElementById('searchTrigger');
    const searchModal = document.getElementById('searchModal');
    const searchClose = document.getElementById('searchClose');
    const searchModalInput = document.getElementById('searchModalInput');
    const searchModalBtn = document.getElementById('searchModalBtn');
    const searchResults = document.getElementById('searchResults');
    const suggestionTags = document.querySelectorAll('.suggestion-tag');

    // Sample search data (in production, this would come from a JSON file or API)
    const searchData = [
        {
            id: 1,
            title: "Begin Your Journey with Christ",
            snippet: "Start your transformational journey with Christ in seven meaningful steps...",
            category: "Journey",
            url: "#journey-title",
            tags: ["journey", "christ", "faith", "beginner"]
        },
        {
            id: 2,
            title: "Wisdom from Our Elders",
            snippet: "Our church elders have been the foundation of wisdom, faith, and guidance...",
            category: "Elders",
            url: "#elders-title",
            tags: ["elders", "wisdom", "guidance", "community"]
        },
        {
            id: 3,
            title: "What Is the Coming of Christ?",
            snippet: "Understanding biblical prophecy about Christ's return and what it means...",
            category: "Resources",
            url: "#coming-christ-card",
            tags: ["prophecy", "christ return", "bible study"]
        },
        {
            id: 4,
            title: "Finding Healing and Hope",
            snippet: "A compassionate guide to overcoming self-harm through faith, community...",
            category: "Resources",
            url: "#healing-hope-card",
            tags: ["healing", "hope", "mental health", "support"]
        },
        {
            id: 5,
            title: "Biblical Perspective on Equality",
            snippet: "What the Bible teaches about human dignity, justice, and our call to love all people equally.",
            category: "Resources",
            url: "#equality-card",
            tags: ["equality", "justice", "bible", "love"]
        }
    ];

    if (searchTrigger) {
        searchTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            searchModal.classList.add('active');
            searchModal.setAttribute('aria-hidden', 'false');
            setTimeout(() => {
                if (searchModalInput) searchModalInput.focus();
            }, 300);
            clearResults();
        });
    }

    if (searchClose) {
        searchClose.addEventListener('click', closeSearchModal);
    }

    if (searchModal) {
        searchModal.addEventListener('click', function(e) {
            if (e.target === searchModal) {
                closeSearchModal();
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchModal && searchModal.classList.contains('active')) {
            closeSearchModal();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k' && searchTrigger) {
            e.preventDefault();
            searchTrigger.click();
        }
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && searchTrigger) {
            e.preventDefault();
            searchTrigger.click();
        }
    });

    if (searchModalBtn && searchModalInput) {
        searchModalBtn.addEventListener('click', () => performSearch(searchModalInput.value));
        searchModalInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
        
        // Live search with debounce
        let searchTimeout;
        searchModalInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            if (this.value.trim().length > 2) {
                searchTimeout = setTimeout(() => {
                    performSearch(this.value);
                }, 300);
            } else if (this.value.trim().length === 0) {
                clearResults();
            }
        });
    }

    suggestionTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const searchTerm = this.getAttribute('data-search');
            if (searchModalInput) {
                searchModalInput.value = searchTerm;
                performSearch(searchTerm);
            }
        });
    });

    function closeSearchModal() {
        if (searchModal) {
            searchModal.classList.remove('active');
            searchModal.setAttribute('aria-hidden', 'true');
            if (searchModalInput) searchModalInput.value = '';
            clearResults();
        }
    }

    function clearResults() {
        if (searchResults) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('loading');
        }
    }

    function performSearch(searchTerm) {
        if (!searchTerm || !searchResults) return;
        
        searchTerm = searchTerm.trim().toLowerCase();
        
        if (!searchTerm) {
            clearResults();
            return;
        }
        
        searchResults.innerHTML = '<div class="loading-spinner"></div>';
        searchResults.classList.add('loading');
        
        // Simulate API delay
        setTimeout(() => {
            const results = searchData.filter(item => {
                return item.title.toLowerCase().includes(searchTerm) ||
                       item.snippet.toLowerCase().includes(searchTerm) ||
                       item.category.toLowerCase().includes(searchTerm) ||
                       item.tags.some(tag => tag.includes(searchTerm));
            });
            
            displayResults(results, searchTerm);
        }, 300);
    }

    function displayResults(results, searchTerm) {
        if (!searchResults) return;
        
        searchResults.classList.remove('loading');
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <i class='bx bx-search-alt'></i>
                    <h4>No results found</h4>
                    <p>Try different keywords or check out our popular searches above.</p>
                </div>
            `;
            return;
        }
        
        let resultsHTML = '';
        
        results.forEach(item => {
            resultsHTML += `
                <div class="search-result-item" data-url="${item.url}">
                    <div class="result-category">${item.category}</div>
                    <h4 class="result-title">${highlightText(item.title, searchTerm)}</h4>
                    <p class="result-snippet">${highlightText(item.snippet.substring(0, 150) + '...', searchTerm)}</p>
                    <span class="result-link">View <i class='bx bx-chevron-right'></i></span>
                </div>
            `;
        });
        
        searchResults.innerHTML = resultsHTML;
        
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                closeSearchModal();
                
                if (url.startsWith('#')) {
                    const targetElement = document.querySelector(url);
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 100,
                            behavior: 'smooth'
                        });
                    }
                } else {
                    window.location.href = url;
                }
            });
        });
    }

    function highlightText(text, searchTerm) {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    // ========== NEWSLETTER FORM ==========
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            if (!emailInput.value || !emailInput.checkValidity()) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Disable form while submitting
            submitButton.disabled = true;
            submitButton.textContent = 'Subscribing...';
            
            try {
                // In production, replace with actual API endpoint
                const response = await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: emailInput.value })
                });
                
                if (response.ok) {
                    showNotification('Thank you for subscribing! Please check your email to confirm.', 'success');
                    emailInput.value = '';
                } else {
                    throw new Error('Subscription failed');
                }
            } catch (error) {
                showNotification('Something went wrong. Please try again later.', 'error');
                console.error('Newsletter subscription error:', error);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }

    // ========== NOTIFICATION SYSTEM ==========
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close" aria-label="Close notification">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Auto-remove after 5 seconds
        const timeout = setTimeout(() => {
            removeNotification(notification);
        }, 5000);
        
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                clearTimeout(timeout);
                removeNotification(notification);
            });
        }
    }

    function removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // ========== CIRCULAR FLOATING NAVIGATION ==========
    const floatingNavBtn = document.getElementById('floatingNavBtn');
    const floatingNavMenu = document.getElementById('floatingNavMenu');
    const progressBar = document.getElementById('progressBar');
    
    if (floatingNavBtn && floatingNavMenu) {
        floatingNavBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            floatingNavMenu.classList.toggle('active');
            this.classList.toggle('active');
            const isExpanded = floatingNavMenu.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);
        });
        
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.floating-nav') && !e.target.closest('.circular-nav-item')) {
                floatingNavMenu.classList.remove('active');
                floatingNavBtn.classList.remove('active');
                floatingNavBtn.setAttribute('aria-expanded', 'false');
            }
        });
        
        document.querySelectorAll('.circular-nav-item').forEach(item => {
            item.addEventListener('click', function() {
                setTimeout(() => {
                    floatingNavMenu.classList.remove('active');
                    floatingNavBtn.classList.remove('active');
                    floatingNavBtn.setAttribute('aria-expanded', 'false');
                }, 300);
            });
        });
    }
    
    // Progress bar
    function updateProgressBar() {
        if (progressBar) {
            const totalHeight = document.body.scrollHeight - window.innerHeight;
            const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
            progressBar.style.width = `${progress}%`;
        }
    }
    
    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateProgressBar);
    });
    
    updateProgressBar();

    // ========== SMOOTH SCROLLING ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========== ACCESSIBILITY ==========
    document.addEventListener('keyup', function(e) {
        if (e.key === 'Tab') {
            document.documentElement.classList.add('focus-visible');
        }
    });
    
    document.addEventListener('click', function() {
        document.documentElement.classList.remove('focus-visible');
    });
});