// ============================================
// MTN AFA PORTAL — iOS 26 LIQUID GLASS SCRIPTS
// Shared JavaScript for all frontend pages
// ============================================

(function() {
    'use strict';

    function initHeaderScroll() {
        const nav = document.getElementById('topNav') || document.querySelector('.glass-nav');
        if (!nav) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }, { passive: true });

        if (window.scrollY > 10) {
            nav.classList.add('scrolled');
        }
    }

    window.showToast = function(message, type) {
        let toast = document.getElementById('glassToast');
        
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'glassToast';
            toast.style.cssText = `
                position: fixed;
                bottom: 24px;
                right: 24px;
                padding: 16px 24px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                z-index: 1001;
                transform: translateX(150%) scale(0.9);
                transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                backdrop-filter: blur(40px) saturate(180%);
                -webkit-backdrop-filter: blur(40px) saturate(180%);
                box-shadow: 0 16px 48px rgba(0,0,0,0.3);
                max-width: 400px;
                border: 1px solid rgba(255,255,255,0.18);
                font-family: 'Inter', -apple-system, sans-serif;
            `;
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.background = type === 'error' 
            ? 'rgba(255, 59, 48, 0.9)' 
            : 'rgba(52, 199, 89, 0.9)';
        toast.style.color = 'white';

        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0) scale(1)';
        });

        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(() => {
            toast.style.transform = 'translateX(150%) scale(0.9)';
        }, 3000);
    };

    window.showLoading = function(show) {
        let overlay = document.getElementById('glassLoading');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'glassLoading';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(10, 15, 26, 0.92);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                z-index: 999;
                display: none;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                gap: 20px;
                opacity: 0;
                transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            `;
            overlay.innerHTML = `
                <div style="
                    width: 48px;
                    height: 48px;
                    border: 3px solid rgba(255,215,0,0.2);
                    border-top-color: #FFD700;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
                "></div>
                <div style="color: rgba(255,255,255,0.45); font-size: 14px; font-family: 'Inter', sans-serif;">Processing...</div>
            `;
            
            if (!document.getElementById('glassSpinStyle')) {
                const style = document.createElement('style');
                style.id = 'glassSpinStyle';
                style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
                document.head.appendChild(style);
            }
            
            document.body.appendChild(overlay);
        }

        if (show) {
            overlay.style.display = 'flex';
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
            });
        } else {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }
    };

    function initSmoothAnchors() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    function initRippleEffect() {
        document.querySelectorAll('.btn-primary, .btn-dark, .btn-success, .btn-danger, .btn-ghost, .glass-pill').forEach(btn => {
            btn.style.position = 'relative';
            btn.style.overflow = 'hidden';
            
            btn.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });

        if (!document.getElementById('glassRippleStyle')) {
            const style = document.createElement('style');
            style.id = 'glassRippleStyle';
            style.textContent = '@keyframes ripple { to { transform: scale(2); opacity: 0; } }';
            document.head.appendChild(style);
        }
    }

    function initCardAnimations() {
        const cards = document.querySelectorAll('.glass, .glass-strong, .form-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 50);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        cards.forEach((card, i) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            observer.observe(card);
        });
    }

    function initFormAnimations() {
        document.querySelectorAll('.glass-input, .glass-input-light, .form-input-light').forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement?.classList.add('focused');
            });
            input.addEventListener('blur', function() {
                this.parentElement?.classList.remove('focused');
            });
        });
    }

    function initBackgroundMesh() {
        const body = document.body;
        if (!body.style.background || body.style.background === '') {
            body.style.background = 'linear-gradient(160deg, #0a0f1a 0%, #0d1b2a 40%, #0a1520 100%)';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

    function initAll() {
        initHeaderScroll();
        initSmoothAnchors();
        initRippleEffect();
        initCardAnimations();
        initFormAnimations();
        initBackgroundMesh();
    }
})();
