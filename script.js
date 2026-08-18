// ==================== INIT ====================
window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('preloader').classList.add('loaded'), 1000);
});

AOS.init({ duration: 800, easing: 'ease-in-out', once: true });

// ==================== HEADER SCROLL ====================
const header = document.querySelector('.header');
if (header) {
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// ==================== MOBILE MENU ====================
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');
const mobileMenuToggleBtn = document.getElementById('mobileMenuToggle');
const mobileSubLinksEl = document.getElementById('mobileSubLinks');

function openMobileMenu() {
    if (!hamburger || !mobileNav || !mobileMenu) return;
    hamburger.classList.add('active');
    mobileNav.classList.add('active');
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    if (!hamburger || !mobileNav || !mobileMenu) return;
    hamburger.classList.remove('active');
    mobileNav.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
}

if (hamburger) {
    hamburger.addEventListener('click', () => {
        mobileMenu && mobileMenu.classList.contains('active') ? closeMobileMenu() : openMobileMenu();
    });
}
if (mobileNav) mobileNav.addEventListener('click', closeMobileMenu);
if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);

// Courses sub-menu toggle
if (mobileMenuToggleBtn && mobileSubLinksEl) {
    mobileMenuToggleBtn.addEventListener('click', () => {
        mobileMenuToggleBtn.classList.toggle('active');
        mobileSubLinksEl.classList.toggle('active');
    });
}

// Mobile search functionality
const mobileSearchInput = document.getElementById('mobileSearchInput');
if (mobileSearchInput) {
    mobileSearchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' && mobileSearchInput.value.trim()) {
            // Close menu and trigger search
            closeMobileMenu();
            const mainSearch = document.getElementById('searchInput');
            if (mainSearch) {
                mainSearch.value = mobileSearchInput.value;
                searchCourses();
                const section = document.getElementById('courses');
                if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
}

// ESC key closes mobile menu
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
});

// ==================== SEARCH ====================
function searchCourses() {
    const input = document.getElementById('searchInput');
    const resultsEl = document.getElementById('searchResults');
    if (!input || !resultsEl) return;
    const query = input.value.trim().toLowerCase();
    if (!query) { resultsEl.innerHTML = ''; resultsEl.classList.remove('active'); return; }
    const results = Object.entries(courseData).filter(([id, c]) =>
        c.title.toLowerCase().includes(query) || c.category.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query)
    );
    if (results.length === 0) { resultsEl.innerHTML = '<p style="padding:14px;color:#999;text-align:center">No courses found</p>'; resultsEl.classList.add('active'); return; }
    resultsEl.innerHTML = results.slice(0, 6).map(([id, c]) => {
        const card = document.querySelector(`[data-id="${id}"]`);
        return `<div onclick="document.getElementById('searchInput').value='';document.getElementById('searchResults').innerHTML='';document.getElementById('searchResults').classList.remove('active');if('${id}'){document.querySelector('[data-id=${id}]')?.scrollIntoView({behavior:'smooth',block:'center'});document.querySelector('[data-id=${id}]')?.style.setProperty('box-shadow','0 0 0 3px #2e6bc6');setTimeout(()=>document.querySelector('[data-id=${id}]')?.style.removeProperty('box-shadow'),2000)}" style="display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid #eee;cursor:pointer;transition:all 0.2s" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background=''"><img src="${c.img}" style="width:50px;height:40px;object-fit:cover;border-radius:6px"><div style="flex:1"><h4 style="font-size:13px;font-weight:600;margin:0">${c.title}</h4><p style="font-size:11px;color:#999;margin:2px 0 0">${c.category}</p></div><span style="font-weight:700;color:#2e6bc6;font-size:13px">₹${c.price}</span></div>`;
    }).join('');
    resultsEl.classList.add('active');
}
document.getElementById('searchInput')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') searchCourses();
    else { const q = e.target.value.trim().toLowerCase(); if (q.length >= 2) searchCourses(); else { document.getElementById('searchResults').innerHTML = ''; document.getElementById('searchResults').classList.remove('active'); } }
});
document.getElementById('searchInput')?.addEventListener('blur', () => {
    setTimeout(() => { const r = document.getElementById('searchResults'); if (r) { r.innerHTML = ''; r.classList.remove('active'); } }, 200);
});

// ==================== CATEGORY NAV FILTER ====================
document.querySelectorAll('.cat-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        document.querySelectorAll('.course-card').forEach(card => {
            const match = filter === 'all' || card.getAttribute('data-category') === filter;
            card.style.display = match ? 'block' : 'none';
            if (match) { card.style.opacity = '0'; setTimeout(() => { card.style.opacity = '1'; card.style.transition = 'opacity 0.4s ease'; }, 50); }
        });
        const section = document.getElementById('courses');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ==================== FILTER BUTTONS (inside courses section) ====================
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        document.querySelectorAll('.course-card').forEach(card => {
            const match = filter === 'all' || card.getAttribute('data-category') === filter;
            card.style.display = match ? 'block' : 'none';
            if (match) { card.style.opacity = '0'; setTimeout(() => { card.style.opacity = '1'; card.style.transition = 'opacity 0.4s ease'; }, 50); }
        });
        document.querySelectorAll('.cat-nav-btn').forEach(b => { b.classList.remove('active'); if (b.getAttribute('data-filter') === filter) b.classList.add('active'); });
    });
});

// ==================== TOAST NOTIFICATION ====================
function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ==================== CART SYSTEM ====================
let cart = JSON.parse(localStorage.getItem('edubazar_cart')) || [];
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItemsEl = document.getElementById('cartItems');
const cartFooter = document.getElementById('cartFooter');
const cartCountEl = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');

function saveCart() { localStorage.setItem('edubazar_cart', JSON.stringify(cart)); updateCartUI(); }

function updateCartUI() {
    if (!cartCountEl) return;
    cartCountEl.textContent = cart.reduce((sum, i) => sum + i.qty, 0);
    if (cart.length === 0) {
        if (cartItemsEl) cartItemsEl.innerHTML = '<div class="cart-empty"><i class="fas fa-shopping-basket"></i><p>Your cart is empty</p></div>';
        if (cartFooter) cartFooter.style.display = 'none';
    } else {
        if (cartItemsEl) cartItemsEl.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.img}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="cart-item-remove" onclick="removeFromCart('${item.id}')"><i class="fas fa-trash-alt"></i></button>
                    <div class="cart-qty">
                        <button onclick="changeQty('${item.id}', -1)">−</button>
                        <span>${item.qty}</span>
                        <button onclick="changeQty('${item.id}', 1)">+</button>
                    </div>
                </div>
            </div>
        `).join('');
        const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
        if (cartTotalEl) cartTotalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
        if (cartFooter) cartFooter.style.display = 'block';
    }
}

function addToCart(id, name, price, img) {
    const existing = cart.find(i => i.id === id);
    if (existing) { existing.qty++; } else { cart.push({ id, name, price: parseInt(price), img, qty: 1 }); }
    saveCart();
    showToast(`${name} added to cart!`);
    flyToCart(img);
}

function flyToCart(imgSrc) {
    const flyEl = document.createElement('div');
    flyEl.className = 'fly-to-cart';
    flyEl.innerHTML = '<img src="' + imgSrc + '" alt="">';
    document.body.appendChild(flyEl);

    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;
    const lastClicked = document.querySelector('.btn-add-cart.last-clicked');
    if (lastClicked) {
        const card = lastClicked.closest('.course-card');
        if (card) {
            const imgEl = card.querySelector('.course-image img');
            if (imgEl) {
                const r = imgEl.getBoundingClientRect();
                startX = r.left + r.width / 2;
                startY = r.top + r.height / 2;
            }
        }
        lastClicked.classList.remove('last-clicked');
    }

    const cartRect = cartBtn ? cartBtn.getBoundingClientRect() : { left: window.innerWidth - 60, top: 10 };
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;

    flyEl.style.left = startX + 'px';
    flyEl.style.top = startY + 'px';
    flyEl.style.transform = 'translate(-50%, -50%) scale(1)';
    flyEl.style.opacity = '1';

    requestAnimationFrame(() => {
        setTimeout(() => {
            flyEl.style.left = endX + 'px';
            flyEl.style.top = endY + 'px';
            flyEl.style.transform = 'translate(-50%, -50%) scale(0.1)';
            flyEl.style.opacity = '0.5';
        }, 60);
        setTimeout(() => {
            flyEl.style.transform = 'translate(-50%, -50%) scale(0)';
            flyEl.style.opacity = '0';
        }, 600);
        setTimeout(() => flyEl.remove(), 900);
    });

    if (cartBtn) {
        cartBtn.classList.add('cart-bounce');
        setTimeout(() => cartBtn.classList.remove('cart-bounce'), 700);
    }
    if (cartCountEl) {
        cartCountEl.classList.add('count-pop');
        setTimeout(() => cartCountEl.classList.remove('count-pop'), 500);
    }
}

function removeFromCart(id) {
    const item = document.querySelector(`.cart-item[data-id="${id}"]`);
    if (item) item.style.animation = 'slideIn 0.3s ease reverse forwards';
    setTimeout(() => {
        cart = cart.filter(i => i.id !== id);
        saveCart();
        showToast('Item removed from cart');
    }, 300);
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) { removeFromCart(id); return; }
        saveCart();
    }
}

// Add to cart buttons
document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        btn.classList.add('last-clicked');
        const { id, name, price, img } = btn.dataset;
        addToCart(id, name, price, img);
        setTimeout(() => btn.classList.remove('last-clicked'), 1000);
    });
});

// ==================== COURSE PREVIEW ====================
const courseData = {
    h1: { title:'Complete Ethical Hacking & Penetration Testing', category:'Hacking', img:'eduimages/Complete Ethical Hacking & Penetration Testing.jpeg', desc:'Master ethical hacking from scratch. Learn penetration testing, network security, vulnerability assessment, and become a certified ethical hacker.', level:'Advanced', duration:'48 hours', students:'12,500', rating:'4.9', reviews:'3,200', price:199, oldPrice:499, includes:['48 hours of HD video content','35+ hands-on lab exercises','Certificate of completion','Lifetime access','15 real-world hacking projects','Downloadable resources'] },
    h2: { title:'Web Application Hacking & Security', category:'Hacking', img:'eduimages/Web Application Hacking & Security.jpeg', desc:'Learn to hack web applications ethically. Master OWASP Top 10, SQL injection, XSS, CSRF, and secure coding practices.', level:'Intermediate', duration:'35 hours', students:'8,200', rating:'4.8', reviews:'2,100', price:249, oldPrice:599, includes:['35 hours of HD video','25+ web hacking labs','Bug bounty methodology','Certificate of completion','Lifetime access'] },
    h3: { title:'Advanced Ethical Hacking: Keylogger Mastery', category:'Hacking', img:'eduimages/Advanced Ethical Hacking Keylogger Mastery.jpeg', desc:'Master advanced keylogger development and deployment techniques for penetration testing.', level:'Advanced', duration:'18 hours', students:'6,800', rating:'4.8', reviews:'1,200', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/nqp829z49i2rco9/Advanced_Ethical_Hacking_Keylogger_Tutorial.rar/file', includes:['18 hours of HD video','Keylogger development labs','Windows & Linux keyloggers','Evasion techniques','Certificate of completion'] },
    h4: { title:'Reverse Engineering: The Hacks Behind Cracking', category:'Hacking', img:'eduimages/Reverse Engineering The Hacks Behind Cracking.jpeg', desc:'Deep dive into reverse engineering and software cracking. Learn disassembly, debugging, and binary analysis.', level:'Advanced', duration:'22 hours', students:'5,400', rating:'4.9', reviews:'980', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/es1e9lx0c9vk80k/Dedsec_Reverse_Engineering_Course_%25E2%2580%2593_The_Hacks_Behind_Cracking_2.rar/file', includes:['22 hours of HD video','x86 & x64 disassembly','OllyDbg & IDA Pro labs','Crackme challenges','Certificate of completion'] },
    h5: { title:'Complete Hacking Course: Beginner to Pro', category:'Hacking', img:'eduimages/Complete Hacking Course Beginner to Pro.jpeg', desc:'The most comprehensive hacking course for beginners. Learn network scanning, vulnerability assessment, and more.', level:'Beginner', duration:'40 hours', students:'15,200', rating:'4.7', reviews:'2,800', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/wcp053dntrt3dql/hacking_course_vansh.rar/file', includes:['40 hours of HD video','50+ hands-on labs','Kali Linux setup guide','Network hacking techniques','Certificate of completion'] },
    h6: { title:'Masters in Ethical Hacking: Course 2', category:'Hacking', img:'eduimages/Masters in Ethical Hacking Course 2.jpeg', desc:'Advanced ethical hacking course covering penetration testing, exploit development, and privilege escalation.', level:'Advanced', duration:'36 hours', students:'9,100', rating:'4.8', reviews:'1,650', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/qnnw2a5syl8meua/Masters-In-Ethical-Hacking-Course-2-Gib-.rar/file', includes:['36 hours of HD video','Advanced exploitation labs','Privilege escalation techniques','Active Directory attacks','Certificate of completion'] },
    h7: { title:'Dedsec Facebook & Instagram Hacking', category:'Hacking', img:'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=250&fit=crop', desc:'Learn Facebook and Instagram security testing and social engineering attacks.', level:'Intermediate', duration:'20 hours', students:'7,500', rating:'4.7', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/y8vqdghh5scv6pp/Dedsec_Facebook_%2526_Instagram_Hacking_Course_%25281%2529.rar/file', includes:['20 hours of HD video','Social media reconnaissance','Account security testing','Phishing techniques'] },
    h8: { title:'Dedsec Antivirus Evasion Course', category:'Hacking', img:'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop', desc:'Master antivirus evasion techniques. Learn to bypass AV detection.', level:'Advanced', duration:'18 hours', students:'5,200', rating:'4.8', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/mc4oytl376jb39l/Dedsec__Antivirus_Evasion_Course_By_.rar/file', includes:['18 hours of HD video','AV bypass methods','Payload obfuscation','Runtime detection evasion'] },
    p1: { title:'Python Complete Course: Beginner to Advanced', category:'Programming', img:'eduimages/Python Complete Course Beginner to Advanced.jpeg', desc:'Master Python programming from zero to hero. Learn data structures, OOP, web scraping, and build 10+ real projects.', level:'All Levels', duration:'42 hours', students:'45,000', rating:'4.9', reviews:'5,100', price:199, oldPrice:499, includes:['42 hours of HD video','200+ coding exercises','10+ real projects','Certificate of completion','Lifetime access'] },
    p2: { title:'Complete JavaScript Mastery 2024', category:'Programming', img:'eduimages/Complete JavaScript Mastery 2024.jpeg', desc:'Become a JavaScript expert. Learn ES6+, DOM manipulation, async programming, and build 15+ projects.', level:'Advanced', duration:'45 hours', students:'32,000', rating:'4.9', reviews:'2,500', price:249, oldPrice:599, includes:['45 hours of HD video','300+ coding challenges','15+ projects','Certificate of completion','Lifetime access'] },
    p3: { title:'React & Next.js Developer Guide', category:'Programming', img:'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop', desc:'Master React and Next.js. Learn hooks, state management, routing, SSR, and build production-ready apps.', level:'Intermediate', duration:'50 hours', students:'28,000', rating:'4.8', price:199, oldPrice:499, includes:['50 hours of HD video','React 18 & Next.js 14','8 portfolio projects','Certificate of completion'] },
    t1: { title:'Stock Market Mastery: Zero to Pro', category:'Trading', img:'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop', desc:'Complete stock market trading course. Learn technical analysis, chart patterns, and risk management.', level:'All Levels', duration:'38 hours', students:'18,500', rating:'4.7', price:0, oldPrice:0, includes:['38 hours of HD video','Live trading sessions','Chart analysis techniques','Risk management system'] },
    t2: { title:'Crypto Trading Pro: Bitcoin & Altcoins', category:'Trading', img:'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=250&fit=crop', desc:'Master cryptocurrency trading. Learn DeFi, NFTs, technical analysis for crypto.', level:'Intermediate', duration:'30 hours', students:'22,000', rating:'4.8', price:249, oldPrice:599, includes:['30 hours of HD video','DeFi & Web3 covered','Portfolio management','Certificate of completion'] },
    t3: { title:'Forex Trading: Complete Beginners Guide', category:'Trading', img:'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=400&h=250&fit=crop', desc:'Learn forex trading from scratch. Master currency pairs, leverage, and technical analysis.', level:'Beginner', duration:'25 hours', students:'15,000', rating:'4.6', price:199, oldPrice:499, includes:['25 hours of HD video','Demo account practice','Live market analysis','Certificate of completion'] },
    t4: { title:'Complete Stock Market Course', category:'Trading', img:'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=250&fit=crop', desc:'Master the stock market from fundamentals to advanced trading strategies.', level:'All Levels', duration:'32 hours', students:'22,500', rating:'4.7', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/43igah1dqfqqc26/Complete_Stock_Market_course_%255BHACKSNATION.COM%255D.zip/file', includes:['32 hours of HD video','Live market analysis','Technical & fundamental analysis','Portfolio management'] },
    b1: { title:'The Hacking Bible: Complete Guide', category:'Hacking Book', img:'eduimages/The Hacking Bible Complete Guide.jpeg', desc:'The ultimate hacking reference book. Covers everything from basic concepts to advanced techniques.', level:'Advanced', duration:'PDF Book', students:'5,200', rating:'4.8', price:0, oldPrice:0, includes:['PDF format (450+ pages)','Practical examples','Step-by-step guides','Bonus cheat sheets'] },
    b2: { title:'Trading Psychology: Master Your Mind', category:'Trading Book', img:'eduimages/Trading Psychology Master Your Mind.jpeg', desc:'Master the psychology of trading. Learn to control emotions and build discipline.', level:'All Levels', duration:'PDF Book', students:'3,800', rating:'4.7', price:0, oldPrice:0, includes:['PDF format (280+ pages)','Case studies','Self-assessment tools','Bonus worksheets'] },
    b3: { title:'Python Crash Course: Complete Guide', category:'Programming Book', img:'eduimages/Python Crash Course Complete Guide.jpeg', desc:'Learn Python programming through this comprehensive guide. Perfect for beginners.', level:'Beginner', duration:'PDF Book', students:'12,000', rating:'4.9', price:0, oldPrice:0, includes:['PDF format (380+ pages)','Code examples','Practice exercises','Project ideas'] },
    d1: { title:'UI/UX Design Complete Course', category:'Design', img:'eduimages/UIUX Design Complete Course.jpeg', desc:'Master UI/UX design from wireframes to high-fidelity prototypes. Learn Figma and Adobe XD.', level:'Beginner', duration:'38 hours', students:'20,000', rating:'4.8', price:199, oldPrice:499, includes:['38 hours of HD video','Figma & Adobe XD','10 design projects','Certificate of completion'] },
    m1: { title:'Digital Marketing Masterclass', category:'Marketing', img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop', desc:'Complete digital marketing course. Learn SEO, social media marketing, Google Ads, and more.', level:'All Levels', duration:'35 hours', students:'25,000', rating:'4.7', price:199, oldPrice:499, includes:['35 hours of HD video','Google Ads certification prep','SEO tools training','Certificate of completion'] },
    h24: { title:'888RAT 1.1.1 Remote Access Tool', category:'Software & Tools', img:'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400&h=250&fit=crop', desc:'888RAT is a powerful remote access tool for system administration and security testing.', level:'Advanced', duration:'Tool', students:'3,200', rating:'4.5', price:399, oldPrice:999, downloadUrl:'https://www.mediafire.com/file/adddhsuj00bl4yx/888RAT_1.1.1_RAT_Cracked.7z/file', includes:['Cracked version included','Remote desktop access','File management','Keylogger module'] },
    h25: { title:'AhMyth Win32 Hacking RAT', category:'Software & Tools', img:'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop', desc:'AhMyth is an open-source RAT for Win32 systems. Learn remote administration.', level:'Intermediate', duration:'Tool', students:'4,500', rating:'4.6', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/m59ylitvtw85i7y/AhMyth_Win32_Hacking_Rat.zip/file', includes:['Win32 version','Remote shell','Screen capture','File explorer'] },
    h26: { title:'AhMyth Win64 Hacking RAT', category:'Software & Tools', img:'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop', desc:'AhMyth Win64 version with enhanced features for 64-bit systems.', level:'Intermediate', duration:'Tool', students:'4,100', rating:'4.6', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/dog2ifd1eo66n4b/AhMyth_Win64_Hacking_Rat2.zip/file', includes:['Win64 version','Enhanced performance','64-bit support','Remote administration'] },
    h27: { title:'AndroRAT - Android RAT', category:'Software & Tools', img:'https://images.unsplash.com/photo-1612178991541-b48cc8e92a4e?w=400&h=250&fit=crop', desc:'AndroRAT is an Android-based RAT for remote device management.', level:'Intermediate', duration:'Tool', students:'5,800', rating:'4.7', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/oeludagegihhcye/AndroRAT_-_AndroBinder.zip/file', includes:['Android RAT tool','Binder integration','SMS access','GPS tracking'] },
    h28: { title:'Cerberus RAT 1.0 Beta', category:'Software & Tools', img:'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400&h=250&fit=crop', desc:'Cerberus RAT is an advanced remote access tool with modern features.', level:'Advanced', duration:'Tool', students:'2,900', rating:'4.5', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/98j330zzb9pebvd/Cerberus_RAT_1.0_Beta.rar/file', includes:['Beta version included','Remote desktop','Credential harvesting','Persistence module'] },
    h29: { title:'DroidJack Complete Setup RAT', category:'Software & Tools', img:'https://images.unsplash.com/photo-1612178991541-b48cc8e92a4e?w=400&h=250&fit=crop', desc:'DroidJack is a powerful Android RAT with complete setup guide.', level:'Advanced', duration:'Tool', students:'6,200', rating:'4.7', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/tyvxvad18uyy6ig/Droid_Jack_Complete_Setup_Hacking_Rat.zip/file', includes:['Complete setup included','Android remote control','SMS & call logs','Camera access'] },
    h30: { title:'NanoCore RAT 1.2.2.0 Cracked', category:'Software & Tools', img:'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400&h=250&fit=crop', desc:'NanoCore is a premium RAT with advanced features. Cracked version included.', level:'Advanced', duration:'Tool', students:'7,500', rating:'4.8', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/10erodudviikc16/NanoCore_RAT_1.2.2.0_Cracked.7z/file', includes:['Fully cracked version','Plugin system','Remote desktop','File manager'] },
    h34: { title:'Advance Practical Phishing Course', category:'Hacking', img:'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=250&fit=crop', desc:'Master advanced phishing techniques. Learn email phishing, spear phishing, and credential harvesting.', level:'Advanced', duration:'20 hours', students:'8,500', rating:'4.8', price:299, oldPrice:699, downloadUrl:'https://www.mediafire.com/file/3zu4iloqbrl6tvf/Advance-Practical-Phishing-course.zip/file', includes:['20 hours of HD video','Phishing page creation','Email phishing templates','Credential harvesting'] },
    t5: { title:'Mindfluential Trading: Psychology & Strategy', category:'Trading Book', img:'eduimages/Mindfluential Trading Psychology & Strategy.jpeg', desc:'Master the mental game of trading. Comprehensive guide to trading psychology and strategies.', level:'All Levels', duration:'PDF Book', students:'4,200', rating:'4.8', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/4fo3qqyonf9fg9o/3._Mindfluential_Trading.pdf/file', includes:['PDF format (320+ pages)','Real trader case studies','Emotional control techniques','Trading plan templates'] }
};

const previewModal = document.getElementById('previewModal');
const previewClose = document.getElementById('previewClose');
const previewContent = document.getElementById('previewContent');

document.querySelectorAll('.btn-preview').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.course-card');
        const id = card.dataset.id;
        const data = courseData[id];
        if (!data) return;
        previewContent.innerHTML = `
            <div class="preview-header">
                <img src="${data.img}" alt="${data.title}">
                <span class="preview-badge">${data.category}</span>
            </div>
            <div class="preview-body">
                <h2>${data.title}</h2>
                <p class="preview-desc">${data.desc}</p>
                <div class="preview-meta">
                    <span><i class="fas fa-clock"></i> ${data.duration}</span>
                    <span><i class="fas fa-signal"></i> ${data.level}</span>
                    <span><i class="fas fa-users"></i> ${data.students} students</span>
                    <span><i class="fas fa-star" style="color:#f1c40f"></i> ${data.rating} (${data.reviews} reviews)</span>
                </div>
                <div class="preview-includes">
                    <h4><i class="fas fa-check-circle"></i> What's Included</h4>
                    <ul>${data.includes.map(item => `<li><i class="fas fa-check"></i> ${item}</li>`).join('')}</ul>
                </div>
                <div class="preview-footer">
                    <div class="preview-price">
                        <span class="old">₹${data.oldPrice.toLocaleString('en-IN')}</span>
                        <span class="new">₹${data.price.toLocaleString('en-IN')}</span>
                    </div>
                </div>
                <div class="preview-actions">
                    <button class="btn-add-now" onclick="addToCart('${id}','${data.title.replace(/'/g, "\\'")}',${data.price},'${data.img}');closePreview();">
                        <i class="fas fa-cart-plus"></i> Add to Cart - ₹${data.price.toLocaleString('en-IN')}
                    </button>
                </div>
            </div>`;
        previewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

function closePreview() {
    previewModal.classList.remove('active');
    document.body.style.overflow = '';
}
if (previewClose) previewClose.addEventListener('click', closePreview);
if (previewModal) previewModal.addEventListener('click', (e) => { if (e.target === previewModal) closePreview(); });

// Open/Close cart
if (cartBtn) cartBtn.addEventListener('click', () => { cartSidebar.classList.add('active'); cartOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; });
if (cartClose) cartClose.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
function closeCart() { cartSidebar.classList.remove('active'); cartOverlay.classList.remove('active'); document.body.style.overflow = ''; }

updateCartUI();

// ==================== CHECKOUT ====================
const checkoutModal = document.getElementById('checkoutModal');
const checkoutClose = document.getElementById('checkoutClose');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutForm = document.getElementById('checkoutForm');
const continueShopping = document.getElementById('continueShopping');

let currentStep = 1;
let orderData = {};

const RAZORPAY_KEY = 'rzp_live_TQSSn1yiPIkBqv';

function showStep(step) {
    document.querySelectorAll('.checkout-step-content').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.checkout-steps .step').forEach(s => s.classList.remove('active'));
    const stepEl = document.getElementById('step' + step);
    const stepBtn = document.querySelector('.step[data-step="' + step + '"]');
    if (stepEl) stepEl.classList.add('active');
    if (stepBtn) stepBtn.classList.add('active');
    currentStep = step;
}

document.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
    });
});

if (checkoutForm) checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    orderData.name = document.getElementById('custName').value;
    orderData.email = document.getElementById('custEmail').value;
    orderData.phone = document.getElementById('custPhone').value;
    const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    document.getElementById('summarySubtotal').textContent = '₹' + total.toLocaleString('en-IN');
    document.getElementById('summaryTotal').textContent = '₹' + total.toLocaleString('en-IN');
    showStep(2);
});

const payBtn = document.getElementById('payBtn');
if (payBtn) payBtn.addEventListener('click', () => {
    const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    if (total <= 0) {
        completeOrder('free');
        return;
    }
    openRazorpay(total);
});

// ==================== RAZORPAY PAYMENT ====================
function openRazorpay(amount) {
    const orderId = 'EDU-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
    checkoutModal.classList.remove('active');
    checkoutModal.style.display = 'none';
    document.body.style.overflow = '';

    const options = {
        key: RAZORPAY_KEY,
        amount: amount * 100,
        currency: 'INR',
        name: 'EduBazar',
        description: 'Course Purchase',
        image: 'edulogo1.png',
        handler: function (response) {
            completeOrder('paid', response.razorpay_payment_id, orderId);
        },
        prefill: {
            name: orderData.name || '',
            email: orderData.email || '',
            contact: orderData.phone || ''
        },
        notes: {
            order_id: orderId
        },
        theme: {
            color: '#e94560'
        },
        modal: {
            ondismiss: function () {
                showToast('Payment cancelled', 'error');
                checkoutModal.style.display = '';
                checkoutModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                showStep(2);
            }
        }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
        showToast('Payment failed: ' + response.error.description, 'error');
    });
    rzp.open();
}

function completeOrder(status, paymentId, orderId) {
    orderId = orderId || 'EDU-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();

    orderData.orderId = orderId;
    orderData.paymentMethod = 'razorpay';
    orderData.paymentId = paymentId || 'free';
    orderData.items = [...cart];
    orderData.total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    orderData.status = status;
    orderData.date = new Date().toISOString();

    orderData.downloads = orderData.items.map(i => {
        const cd = courseData[i.id];
        return {
            name: i.name,
            link: (cd && cd.downloadUrl) ? cd.downloadUrl : '#'
        };
    });

    // Save to localStorage
    let orders = JSON.parse(localStorage.getItem('edubazar_orders')) || [];
    orders.push(orderData);
    localStorage.setItem('edubazar_orders', JSON.stringify(orders));

    // Save to Supabase
    if (typeof _sb !== 'undefined') {
        _sb.from('orders').insert([{
            order_id: orderId,
            name: orderData.name,
            email: orderData.email,
            phone: orderData.phone,
            items: JSON.stringify(orderData.items),
            total: orderData.total,
            status: status,
            payment_method: 'razorpay',
            payment_id: paymentId || 'free',
            date: orderData.date
        }]).then(() => {}).catch(() => {});
    }

    cart = [];
    saveCart();
    checkoutModal.classList.remove('active');

    setTimeout(() => {
        document.getElementById('orderIdDisplay').textContent = orderId;
        document.getElementById('emailDisplay').textContent = orderData.email;
        checkoutModal.classList.add('active');
        showStep(3);
        showToast('Order placed successfully!');
        if (paymentId && paymentId !== 'free') {
            setTimeout(() => showToast('Payment ID: ' + paymentId), 1000);
        }
    }, 300);
}

// Open/Close cart
if (cartBtn) cartBtn.addEventListener('click', () => { cartSidebar.classList.add('active'); cartOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; });
if (cartClose) cartClose.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
function closeCart() { cartSidebar.classList.remove('active'); cartOverlay.classList.remove('active'); document.body.style.overflow = ''; }

updateCartUI();

if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    closeCart();
    setTimeout(() => {
        checkoutModal.classList.add('active');
        checkoutModal.style.zIndex = '10002';
        document.body.style.overflow = 'hidden';
        showStep(1);
    }, 400);
});
if (checkoutClose) checkoutClose.addEventListener('click', () => { checkoutModal.classList.remove('active'); document.body.style.overflow = ''; });
if (checkoutModal) checkoutModal.addEventListener('click', (e) => { if (e.target === checkoutModal) { checkoutModal.classList.remove('active'); document.body.style.overflow = ''; } });
if (continueShopping) continueShopping.addEventListener('click', () => { checkoutModal.classList.remove('active'); document.body.style.overflow = ''; });
// UPI modal removed

// ==================== BACK TO TOP ====================
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    window.addEventListener('scroll', () => { backToTop.classList.toggle('visible', window.scrollY > 500); });
    backToTop.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

// ==================== HERO SLIDER ====================
const heroSwiperEl = document.querySelector('.hero-swiper');
if (heroSwiperEl && typeof Swiper !== 'undefined') {
    new Swiper('.hero-swiper', {
        loop: true,
        autoplay: { delay: 5000, disableOnInteraction: false },
        effect: 'fade',
        fadeEffect: { crossFade: true },
        speed: 800,
        touchRatio: 1,
        simulateTouch: true,
        allowTouchMove: true,
        pagination: { el: '.hero-pagination', clickable: true },
        navigation: { nextEl: '.hero-next', prevEl: '.hero-prev' },
        breakpoints: {
            0: { slidesPerView: 1, spaceBetween: 0 },
            768: { slidesPerView: 1, spaceBetween: 0 }
        }
    });
}
