// ==================== INIT ====================
window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('preloader').classList.add('loaded'), 1500);
});

const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');
document.addEventListener('mousemove', (e) => {
    if (cursor) { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; }
    if (cursorFollower) { setTimeout(() => { cursorFollower.style.left = e.clientX + 'px'; cursorFollower.style.top = e.clientY + 'px'; }, 50); }
});
document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cursorFollower && (cursorFollower.style.transform = 'scale(1.5)'));
    el.addEventListener('mouseleave', () => cursorFollower && (cursorFollower.style.transform = 'scale(1)'));
});

AOS.init({ duration: 800, easing: 'ease-in-out', once: true });

// ==================== SLIDERS ====================
if (document.querySelector('.hero-slider')) { new Swiper('.hero-slider', { loop: true, autoplay: { delay: 5000, disableOnInteraction: false }, pagination: { el: '.hero .swiper-pagination', clickable: true }, effect: 'fade', fadeEffect: { crossFade: true }, speed: 1000 }); }
if (document.querySelector('.deals-banner-slider')) { new Swiper('.deals-banner-slider', { loop: true, autoplay: { delay: 3000, disableOnInteraction: false }, slidesPerView: 1, spaceBetween: 15, breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } } }); }
if (document.querySelector('.full-deals-slider')) { new Swiper('.full-deals-slider', { loop: true, autoplay: { delay: 4000, disableOnInteraction: false }, pagination: { el: '.full-deals-slider .swiper-pagination', clickable: true }, slidesPerView: 1, spaceBetween: 25, breakpoints: { 640: { slidesPerView: 1.2 }, 1024: { slidesPerView: 2.2 } } }); }

// ==================== NAVBAR ====================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', window.scrollY > 100); });

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
        const filter = this.getAttribute('data-filter');
        if (filter) {
            e.preventDefault();
            document.querySelectorAll('.filter-btn').forEach(b => { b.classList.remove('active'); if (b.getAttribute('data-filter') === filter) b.classList.add('active'); });
            document.querySelectorAll('.course-card').forEach(c => {
                const match = filter === 'all' || c.getAttribute('data-category') === filter;
                c.style.display = match ? 'block' : 'none';
                if (match) { c.style.opacity = '0'; setTimeout(() => { c.style.opacity = '1'; c.style.transition = 'all 0.4s ease'; }, 50); }
            });
            document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
            return;
        }
        const t = document.querySelector(this.getAttribute('href'));
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
});

// Active nav link
const sections = document.querySelectorAll('section');
const navLinksAll = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => { if (scrollY >= s.offsetTop - 200) current = s.getAttribute('id'); });
    navLinksAll.forEach(l => { l.classList.remove('active'); if (l.getAttribute('href') === `#${current}`) l.classList.add('active'); });
});

// ==================== SEARCH BAR ====================
function searchCourses() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultsEl = document.getElementById('searchResults');
    if (!query || !resultsEl) { if(resultsEl) resultsEl.innerHTML = ''; return; }
    const results = Object.entries(courseData).filter(([id, c]) => c.title.toLowerCase().includes(query) || c.category.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query));
    if (results.length === 0) { resultsEl.innerHTML = '<p style="color:#636e72;padding:10px">No courses found. Try different keywords.</p>'; return; }
    resultsEl.innerHTML = results.slice(0, 5).map(([id, c]) => `<div onclick="document.getElementById('searchInput').value='';document.getElementById('searchResults').innerHTML='';document.querySelector('[data-id=${id}]')?.scrollIntoView({behavior:'smooth',block:'center'});document.querySelector('[data-id=${id}]')?.style.setProperty('box-shadow','0 0 0 3px #6c5ce7');setTimeout(()=>document.querySelector('[data-id=${id}]')?.style.removeProperty('box-shadow'),2000)" style="display:flex;align-items:center;gap:12px;padding:12px;background:white;border:1px solid #e9ecef;border-radius:12px;margin-bottom:8px;cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor='#6c5ce7';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='#e9ecef';this.style.transform=''"><img src="${c.img}" style="width:50px;height:40px;object-fit:cover;border-radius:8px"><div style="flex:1"><h4 style="font-size:0.9rem;font-weight:600;margin:0">${c.title}</h4><p style="font-size:0.75rem;color:#636e72;margin:2px 0 0">${c.category} • ${c.duration}</p></div><span style="font-weight:700;color:#6c5ce7;white-space:nowrap">₹${c.price}</span></div>`).join('');
}
document.getElementById('searchInput')?.addEventListener('keyup', (e) => { if (e.key === 'Enter') searchCourses(); else { const q = e.target.value.trim().toLowerCase(); if (q.length >= 2) searchCourses(); else document.getElementById('searchResults').innerHTML = ''; } });

// ==================== COURSE FILTER ====================
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        document.querySelectorAll('.course-card').forEach(card => {
            const match = filter === 'all' || card.getAttribute('data-category') === filter;
            card.style.display = match ? 'block' : 'none';
            if (match) { card.style.opacity = '0'; card.style.transform = 'scale(0.95)'; setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; card.style.transition = 'all 0.4s ease'; }, 50); }
        });
    });
});

// Category card click filters
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
        const cat = card.getAttribute('data-category');
        document.querySelectorAll('.filter-btn').forEach(b => { b.classList.remove('active'); if (b.getAttribute('data-filter') === cat) b.classList.add('active'); });
        document.querySelectorAll('.course-card').forEach(c => {
            const match = c.getAttribute('data-category') === cat;
            c.style.display = match ? 'block' : 'none';
            if (match) { c.style.opacity = '0'; setTimeout(() => { c.style.opacity = '1'; c.style.transition = 'all 0.4s ease'; }, 50); }
        });
        document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
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
    cartCountEl.textContent = cart.reduce((sum, i) => sum + i.qty, 0);
    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<div class="cart-empty"><i class="fas fa-shopping-basket"></i><p>Your cart is empty</p></div>';
        cartFooter.style.display = 'none';
    } else {
        cartItemsEl.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.img}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">?${(item.price * item.qty).toLocaleString('en-IN')}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="cart-item-remove" onclick="removeFromCart('${item.id}')"><i class="fas fa-trash-alt"></i></button>
                    <div class="cart-qty">
                        <button onclick="changeQty('${item.id}', -1)">-</button>
                        <span>${item.qty}</span>
                        <button onclick="changeQty('${item.id}', 1)">+</button>
                    </div>
                </div>
            </div>
        `).join('');
        const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
        cartTotalEl.textContent = `?${total.toLocaleString('en-IN')}`;
        cartFooter.style.display = 'block';
    }
}

function addToCart(id, name, price, img) {
    const existing = cart.find(i => i.id === id);
    if (existing) { existing.qty++; } else { cart.push({ id, name, price: parseInt(price), img, qty: 1 }); }
    saveCart();
    showToast(`${name} added to cart!`);
    // fly to cart animation
    flyToCart(img);
}

function flyToCart(imgSrc) {
    const flyEl = document.createElement('div');
    flyEl.className = 'fly-to-cart';
    flyEl.innerHTML = `<img src="${imgSrc}" alt="">`;
    document.body.appendChild(flyEl);
    const cartRect = cartBtn ? cartBtn.getBoundingClientRect() : { left: window.innerWidth - 50, top: 50 };
    flyEl.style.left = '50%';
    flyEl.style.top = '50%';
    flyEl.style.transform = 'translate(-50%, -50%) scale(1)';
    setTimeout(() => {
        flyEl.style.left = cartRect.left + 'px';
        flyEl.style.top = cartRect.top + 'px';
        flyEl.style.transform = 'translate(0, 0) scale(0.2)';
        flyEl.style.opacity = '0';
    }, 50);
    setTimeout(() => flyEl.remove(), 900);
    if (cartBtn) {
        cartBtn.style.animation = 'cartBounce 0.5s ease';
        setTimeout(() => cartBtn.style.animation = '', 500);
    }
}

function removeFromCart(id) {
    const item = document.querySelector(`.cart-item[data-id="${id}"]`);
    if (item) { item.style.animation = 'slideOut 0.3s ease forwards'; }
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
        const { id, name, price, img } = btn.dataset;
        addToCart(id, name, price, img);
    });
});

// ==================== COURSE PREVIEW ====================
const courseData = {
    h1: { title:'Complete Ethical Hacking & Penetration Testing', category:'Hacking', img:'eduimages/Complete Ethical Hacking & Penetration Testing.jpeg', desc:'Master ethical hacking from scratch. Learn penetration testing, network security, vulnerability assessment, and become a certified ethical hacker. This comprehensive course covers real-world hacking techniques used by security professionals.', level:'Advanced', duration:'48 hours', students:'12,500', rating:'4.9', reviews:'3,200', price:199, oldPrice:499, includes:['48 hours of HD video content','35+ hands-on lab exercises','Certificate of completion','Lifetime access','15 real-world hacking projects','Downloadable resources & tools','Mobile & TV access','Community forum access'] },
    h2: { title:'Web Application Hacking & Security', category:'Hacking', img:'eduimages/Web Application Hacking & Security.jpeg', desc:'Learn to hack web applications ethically. Master OWASP Top 10, SQL injection, XSS, CSRF, and secure coding practices. Build a career in web application security.', level:'Intermediate', duration:'35 hours', students:'8,200', rating:'4.8', reviews:'2,100', price:249, oldPrice:599, includes:['35 hours of HD video','25+ web hacking labs','Bug bounty methodology','Certificate of completion','Lifetime access','Real website practice','Downloadable notes'] },
    p1: { title:'Python Complete Course: Beginner to Advanced', category:'Programming', img:'eduimages/Python Complete Course Beginner to Advanced.jpeg', desc:'Master Python programming from zero to hero. Learn data structures, OOP, web scraping, automation, data science basics, and build 10+ real projects. The most comprehensive Python course online.', level:'All Levels', duration:'42 hours', students:'45,000', rating:'4.9', reviews:'5,100', price:199, oldPrice:499, includes:['42 hours of HD video','200+ coding exercises','10+ real projects','Certificate of completion','Lifetime access','Downloadable source code','Covers Python 3.12+','Mobile & TV access'] },
    p2: { title:'Complete JavaScript Mastery 2024', category:'Programming', img:'eduimages/Complete JavaScript Mastery 2024.jpeg', desc:'Become a JavaScript expert. Learn ES6+, DOM manipulation, async programming, APIs, and modern frameworks. Build 15+ projects including games and web apps.', level:'Advanced', duration:'45 hours', students:'32,000', rating:'4.9', reviews:'2,500', price:249, oldPrice:599, includes:['45 hours of HD video','300+ coding challenges','15+ projects','Certificate of completion','Lifetime access','ES6+ & modern JS','Node.js included'] },
    p3: { title:'React & Next.js Developer Guide', category:'Programming', img:'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=300&fit=crop', desc:'Master React and Next.js. Learn hooks, state management, routing, SSR, API routes, and deploy production-ready applications. Build 8+ real projects.', level:'Intermediate', duration:'50 hours', students:'28,000', rating:'4.8', reviews:'4,100', price:199, oldPrice:499, includes:['50 hours of HD video','React 18 & Next.js 14','8 portfolio projects','Certificate of completion','Lifetime access','Deployment guide','TypeScript included'] },
    t1: { title:'Stock Market Mastery: Zero to Pro', category:'Trading', img:'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=300&fit=crop', desc:'Complete stock market trading course. Learn technical analysis, fundamental analysis, chart patterns, risk management, and build profitable trading strategies.', level:'All Levels', duration:'38 hours', students:'18,500', rating:'4.7', reviews:'2,800', price:0, oldPrice:0, includes:['38 hours of HD video','Live trading sessions','Chart analysis techniques','Risk management system','Certificate of completion','Lifetime access','Trading psychology guide','Downloadable templates'] },
    t2: { title:'Crypto Trading Pro: Bitcoin & Altcoins', category:'Trading', img:'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600&h=300&fit=crop', desc:'Master cryptocurrency trading. Learn DeFi, NFTs, technical analysis for crypto, wallet security, and build strategies for Bitcoin, Ethereum, and altcoins.', level:'Intermediate', duration:'30 hours', students:'22,000', rating:'4.8', reviews:'3,500', price:249, oldPrice:599, includes:['30 hours of HD video','DeFi & Web3 covered','Portfolio management','Certificate of completion','Lifetime access','Wallet security guide','Exchange tutorials'] },
    t3: { title:'Forex Trading: Complete Beginners Guide', category:'Trading', img:'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=600&h=300&fit=crop', desc:'Learn forex trading from scratch. Master currency pairs, leverage, technical analysis, and build consistent income from the forex market.', level:'Beginner', duration:'25 hours', students:'15,000', rating:'4.6', reviews:'1,900', price:199, oldPrice:499, includes:['25 hours of HD video','Demo account practice','Live market analysis','Certificate of completion','Lifetime access','Risk management','Economic calendar guide'] },
    b1: { title:'The Hacking Bible: Complete Guide', category:'Hacking Book', img:'eduimages/The Hacking Bible Complete Guide.jpeg', desc:'The ultimate hacking reference book. Covers everything from basic concepts to advanced penetration testing techniques. A must-have for every security professional.', level:'Advanced', duration:'PDF Book', students:'5,200', rating:'4.8', reviews:'890', price:0, oldPrice:0, includes:['PDF format (450+ pages)','Practical examples','Step-by-step guides','Bonus cheat sheets','Free updates for life','Instant download'] },
    b2: { title:'Trading Psychology: Master Your Mind', category:'Trading Book', img:'eduimages/Trading Psychology Master Your Mind.jpeg', desc:'Master the psychology of trading. Learn to control emotions, build discipline, and develop the mindset of successful traders. Based on research and real trader experiences.', level:'All Levels', duration:'PDF Book', students:'3,800', rating:'4.7', reviews:'650', price:0, oldPrice:0, includes:['PDF format (280+ pages)','Case studies','Self-assessment tools','Bonus worksheets','Instant download'] },
    b3: { title:'Python Crash Course: Complete Guide', category:'Programming Book', img:'eduimages/Python Crash Course Complete Guide.jpeg', desc:'Learn Python programming through this comprehensive guide. Perfect for beginners. Covers fundamentals, OOP, data structures, and practical projects.', level:'Beginner', duration:'PDF Book', students:'12,000', rating:'4.9', reviews:'2,100', price:0, oldPrice:0, includes:['PDF format (380+ pages)','Code examples','Practice exercises','Project ideas','Instant download','Free updates'] },
    d1: { title:'UI/UX Design Complete Course', category:'Design', img:'eduimages/UIUX Design Complete Course.jpeg', desc:'Master UI/UX design from wireframes to high-fidelity prototypes. Learn Figma, Adobe XD, user research, and design thinking. Build a professional portfolio.', level:'Beginner', duration:'38 hours', students:'20,000', rating:'4.8', reviews:'1,800', price:199, oldPrice:499, includes:['38 hours of HD video','Figma & Adobe XD','10 design projects','Certificate of completion','Lifetime access','Portfolio templates','Design system guide'] },
    m1: { title:'Digital Marketing Masterclass', category:'Marketing', img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop', desc:'Complete digital marketing course. Learn SEO, social media marketing, Google Ads, email marketing, analytics, and build effective marketing campaigns.', level:'All Levels', duration:'35 hours', students:'25,000', rating:'4.7', reviews:'3,200', price:199, oldPrice:499, includes:['35 hours of HD video','Google Ads certification prep','SEO tools training','Certificate of completion','Lifetime access','Marketing templates','Analytics dashboard'] },
    m2: { title:'Social Media Marketing Mastery', category:'Marketing', img:'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=300&fit=crop', desc:'Dominate social media marketing. Learn content creation, paid advertising, community building, and influencer marketing across all platforms.', level:'Beginner', duration:'28 hours', students:'18,000', rating:'4.6', reviews:'1,500', price:249, oldPrice:599, includes:['28 hours of HD video','Platform-specific strategies','Content calendar templates','Certificate of completion','Lifetime access','Ad campaign guides'] },
    h3: { title:'Advanced Ethical Hacking: Keylogger Mastery', category:'Hacking', img:'eduimages/Advanced Ethical Hacking Keylogger Mastery.jpeg', desc:'Master advanced keylogger development and deployment techniques. Learn to build custom keyloggers, understand keystroke capture mechanisms, and explore ethical hacking methodologies for penetration testing.', level:'Advanced', duration:'18 hours', students:'6,800', rating:'4.8', reviews:'1,200', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/nqp829z49i2rco9/Advanced_Ethical_Hacking_Keylogger_Tutorial.rar/file', includes:['18 hours of HD video','Keylogger development labs','Windows & Linux keyloggers','Evasion techniques','Certificate of completion','Lifetime access','Source code included','Stealth deployment guide'] },
    h4: { title:'Reverse Engineering: The Hacks Behind Cracking', category:'Hacking', img:'eduimages/Reverse Engineering The Hacks Behind Cracking.jpeg', desc:'Deep dive into reverse engineering and software cracking. Learn disassembly, debugging, binary analysis, and protection bypass techniques used by security professionals and malware analysts.', level:'Advanced', duration:'22 hours', students:'5,400', rating:'4.9', reviews:'980', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/es1e9lx0c9vk80k/Dedsec_Reverse_Engineering_Course_%25E2%2580%2593_The_Hacks_Behind_Cracking_2.rar/file', includes:['22 hours of HD video','x86 & x64 disassembly','OllyDbg & IDA Pro labs','Crackme challenges','Certificate of completion','Lifetime access','Malware analysis basics','Binary exploitation intro'] },
    h5: { title:'Complete Hacking Course: Beginner to Pro', category:'Hacking', img:'eduimages/Complete Hacking Course Beginner to Pro.jpeg', desc:'The most comprehensive hacking course for beginners. Learn network scanning, vulnerability assessment, web app hacking, social engineering, and wireless security from scratch.', level:'Beginner', duration:'40 hours', students:'15,200', rating:'4.7', reviews:'2,800', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/wcp053dntrt3dql/hacking_course_vansh.rar/file', includes:['40 hours of HD video','50+ hands-on labs','Kali Linux setup guide','Network hacking techniques','Certificate of completion','Lifetime access','WiFi hacking module','Social engineering toolkit'] },
    h6: { title:'Masters in Ethical Hacking: Course 2', category:'Hacking', img:'eduimages/Masters in Ethical Hacking Course 2.jpeg', desc:'Advanced ethical hacking course covering penetration testing, exploit development, privilege escalation, and post-exploitation techniques. Build real-world hacking skills for cybersecurity careers.', level:'Advanced', duration:'36 hours', students:'9,100', rating:'4.8', reviews:'1,650', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/qnnw2a5syl8meua/Masters-In-Ethical-Hacking-Course-2-Gib-.rar/file', includes:['36 hours of HD video','Advanced exploitation labs','Privilege escalation techniques','Active Directory attacks','Certificate of completion','Lifetime access','Report writing guide','15 real-world pentest scenarios'] },
    t4: { title:'Complete Stock Market Course', category:'Trading', img:'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&h=300&fit=crop', desc:'Master the stock market from fundamentals to advanced trading strategies. Learn chart analysis, technical indicators, portfolio management, and build consistent income from trading.', level:'All Levels', duration:'32 hours', students:'22,500', rating:'4.7', reviews:'3,400', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/43igah1dqfqqc26/Complete_Stock_Market_course_%255BHACKSNATION.COM%255D.zip/file', includes:['32 hours of HD video','Live market analysis','Technical & fundamental analysis','Portfolio management','Certificate of completion','Lifetime access','Swing & intraday strategies','Downloadable spreadsheets'] },
    t5: { title:'Mindfluential Trading: Psychology & Strategy', category:'Trading Book', img:'eduimages/Mindfluential Trading Psychology & Strategy.jpeg', desc:'Master the mental game of trading. This comprehensive guide covers trading psychology, emotional discipline, mindset techniques, and proven strategies used by professional traders.', level:'All Levels', duration:'PDF Book', students:'4,200', rating:'4.8', reviews:'780', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/4fo3qqyonf9fg9o/3._Mindfluential_Trading.pdf/file', includes:['PDF format (320+ pages)','Real trader case studies','Emotional control techniques','Trading plan templates','Bonus worksheets','Instant download','Free lifetime updates'] },
    m3: { title:'Digital Marketing Video Course', category:'Marketing', img:'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&h=300&fit=crop', desc:'Complete digital marketing video course. Learn SEO, Google Ads, Facebook Ads, email marketing, content marketing, and analytics from industry experts. Build and scale your online business.', level:'Beginner', duration:'30 hours', students:'19,500', rating:'4.7', reviews:'2,600', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/30m1islmnjjce5w/Digital_Marketing_Video_Course.zip/file', includes:['30 hours of HD video','Google Ads walkthrough','Facebook & Instagram Ads','SEO mastery module','Certificate of completion','Lifetime access','Email marketing automation','Social media calendar templates'] },
    h7: { title:'Dedsec Facebook & Instagram Hacking Course', category:'Hacking', img:'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&h=300&fit=crop', desc:'Learn Facebook and Instagram security testing, account enumeration, social engineering attacks, and defense techniques for social media platforms.', level:'Intermediate', duration:'20 hours', students:'7,500', rating:'4.7', reviews:'1,100', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/y8vqdghh5scv6pp/Dedsec_Facebook_%2526_Instagram_Hacking_Course_%25281%2529.rar/file', includes:['20 hours of HD video','Social media reconnaissance','Account security testing','Phishing techniques','Certificate of completion','Lifetime access'] },
    h8: { title:'Dedsec Antivirus Evasion Course', category:'Hacking', img:'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=300&fit=crop', desc:'Master antivirus evasion techniques. Learn to bypass AV detection, build undetectable payloads, and understand how security products work.', level:'Advanced', duration:'18 hours', students:'5,200', rating:'4.8', reviews:'890', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/mc4oytl376jb39l/Dedsec__Antivirus_Evasion_Course_By_.rar/file', includes:['18 hours of HD video','AV bypass methods','Payload obfuscation','Runtime detection evasion','Certificate of completion','Lifetime access'] },
    h9: { title:'Dedsec Complete WiFi Hacking Course 2', category:'Hacking', img:'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=300&fit=crop', desc:'Advanced WiFi hacking techniques. Learn WPA3 attacks, evil twin attacks, captive portal bypass, and enterprise wireless network penetration testing.', level:'Advanced', duration:'22 hours', students:'8,300', rating:'4.8', reviews:'1,400', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/9tsqfcffhtgaas1/Dedsec__Complete_Course_Of_WiFi_Hacking__2.rar/file', includes:['22 hours of HD video','WPA3 attack methods','Evil twin setup','Enterprise WiFi attacks','Certificate of completion','Lifetime access'] },
    h10: { title:'Dedsec ERC Course (Ethereum Request for Comments)', category:'Hacking', img:'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=300&fit=crop', desc:'Learn blockchain security, smart contract auditing, DeFi protocol testing, and Ethereum ecosystem security. Master Web3 security testing.', level:'Advanced', duration:'24 hours', students:'4,100', rating:'4.9', reviews:'720', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/l0vu73djj8iva8p/Dedsec__ERC_COURSE.rar/file', includes:['24 hours of HD video','Smart contract auditing','DeFi security testing','Blockchain forensics','Certificate of completion','Lifetime access'] },
    h11: { title:'Dedsec Complete WiFi Hacking Course 1', category:'Hacking', img:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=300&fit=crop', desc:'Complete WiFi hacking course for beginners. Learn wireless network scanning, WPA/WPA2 cracking, rogue access points, and WiFi security hardening.', level:'Beginner', duration:'18 hours', students:'12,000', rating:'4.7', reviews:'2,200', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/qiyte98a54yyn2k/Dedsec_Complete_Course_Of_WiFi_Hacking__1.rar/file', includes:['18 hours of HD video','WiFi scanning tools','WPA2 cracking labs','Rogue AP setup','Certificate of completion','Lifetime access'] },
    h12: { title:'Dedsec Reverse Engineering Course 1', category:'Hacking', img:'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=300&fit=crop', desc:'Introduction to reverse engineering and software cracking. Learn x86 assembly, debuggers, disassemblers, and binary analysis fundamentals.', level:'Intermediate', duration:'25 hours', students:'6,800', rating:'4.8', reviews:'1,150', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/eja52xtyfl19hap/Dedsec_Reverse_Engineering_Course_%25E2%2580%2593_The_Hacks_Behind_Cracking_1.rar/file', includes:['25 hours of HD video','x86 assembly basics','OllyDbg tutorials','Binary analysis labs','Certificate of completion','Lifetime access'] },
    h13: { title:'Advanced Hacking Android Devices', category:'Hacking', img:'https://images.unsplash.com/photo-1612178991541-b48cc8e92a4e?w=600&h=300&fit=crop', desc:'Master Android security testing. Learn APK analysis, Android malware development, rooting techniques, and mobile application penetration testing.', level:'Advanced', duration:'28 hours', students:'9,200', rating:'4.7', reviews:'1,600', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/uuu90wegg0qptg6/Advance-Hacking-Android-devices.zip/file', includes:['28 hours of HD video','APK reverse engineering','Android malware labs','Frida & Magisk tools','Certificate of completion','Lifetime access'] },
    h14: { title:'Advanced Web Hacking', category:'Hacking', img:'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=300&fit=crop', desc:'Advanced web application hacking techniques. Master OWASP Top 10, API hacking, GraphQL attacks, SSRF, deserialization, and modern web vulnerabilities.', level:'Advanced', duration:'30 hours', students:'11,500', rating:'4.9', reviews:'2,100', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/12fjxutz1fi96z8/Advanced_Web_Hacking.pdf/file', includes:['30 hours of HD video','Advanced SQL injection','API security testing','GraphQL attack methods','Certificate of completion','Lifetime access'] },
    h15: { title:'Advanced Ethical Hacking Keylogger Tutorial', category:'Hacking', img:'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=300&fit=crop', desc:'Learn advanced keylogger development, stealth deployment, and anti-detection techniques. Build custom keyloggers for penetration testing.', level:'Advanced', duration:'15 hours', students:'5,800', rating:'4.7', reviews:'950', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/hq2d09xz9k05o42/Advanced-Ethical-Hacking-Keylogger-Tutorial.rar/file', includes:['15 hours of HD video','Keylogger coding walkthrough','Evasion techniques','Stealth deployment','Certificate of completion','Lifetime access'] },
    h16: { title:'BlackHat Cracking Course', category:'Hacking', img:'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=300&fit=crop', desc:'Learn advanced cracking techniques used by black hat hackers. Understand software protection, license key generation, and binary patching for educational purposes.', level:'Advanced', duration:'35 hours', students:'8,900', rating:'4.8', reviews:'1,800', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/vnjkur1ggkbsw73/BlackHat-Cracking-Course-For-TN.zip/file', includes:['35 hours of HD video','Software protection analysis','License key algorithms','Binary patching labs','Certificate of completion','Lifetime access'] },
    h17: { title:'Introduction to Ethical Hacking', category:'Hacking', img:'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=300&fit=crop', desc:'Perfect starting point for ethical hacking. Learn the fundamentals, set up your lab, and begin your journey into cybersecurity and penetration testing.', level:'Beginner', duration:'20 hours', students:'18,500', rating:'4.6', reviews:'3,400', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/8nqrdd4sxfepoyr/Introduction-Ethical-Hacking.zip/file', includes:['20 hours of HD video','Lab setup guide','Basic scanning tools','Network fundamentals','Certificate of completion','Lifetime access'] },
    h18: { title:'Setting Up a Hacking Lab', category:'Hacking', img:'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=300&fit=crop', desc:'Build your own professional hacking lab from scratch. Learn VMware, VirtualBox, Kali Linux setup, vulnerable machines, and lab networking.', level:'Beginner', duration:'12 hours', students:'14,200', rating:'4.7', reviews:'2,500', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/nx4b4m03my42eoh/Setting-up-a-Hacking-Lab.zip/file', includes:['12 hours of HD video','VMware & VirtualBox setup','Kali Linux configuration','Vulnerable VMs list','Certificate of completion','Lifetime access'] },
    h19: { title:'Advanced API Security OAuth 2.0 and Beyond', category:'Hacking', img:'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=300&fit=crop', desc:'Master API security testing including OAuth 2.0, JWT attacks, API enumeration, rate limiting bypass, and modern API vulnerability assessment.', level:'Advanced', duration:'22 hours', students:'6,300', rating:'4.9', reviews:'1,050', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/ymbqr3xwn6wzj5m/Advanced.API.Security.OAuth.2.0.and.Beyond.2nd.Edition.pdf/file', includes:['22 hours of HD video','OAuth 2.0 deep dive','JWT attack methods','API enumeration tools','Certificate of completion','Lifetime access'] },
    h20: { title:'Android Security Attacks and Defenses', category:'Hacking', img:'https://images.unsplash.com/photo-1612178991541-b48cc8e92a4e?w=600&h=300&fit=crop', desc:'Comprehensive Android security course. Learn about Android architecture vulnerabilities, app security testing, and building secure mobile applications.', level:'Intermediate', duration:'24 hours', students:'7,800', rating:'4.7', reviews:'1,300', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/i4569vljxjuo9ro/Android_Security_Attacks_and_Defenses%255B1%255D.pdf/file', includes:['24 hours of HD video','Android architecture security','App permission analysis','Secure coding practices','Certificate of completion','Lifetime access'] },
    h21: { title:'Malware Development for Ethical Hacking', category:'Hacking', img:'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&h=300&fit=crop', desc:'Learn malware development for ethical hacking purposes. Understand malware types, evasion techniques, C2 frameworks, and defensive countermeasures.', level:'Advanced', duration:'26 hours', students:'5,600', rating:'4.8', reviews:'980', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/g21vlw695xe404x/Malw_Dev_Eth_Hack.pdf/file', includes:['26 hours of HD video','Malware types & behavior','C2 framework setup','Evasion techniques','Certificate of completion','Lifetime access'] },
    h22: { title:'Linux Basics for Hackers', category:'Hacking', img:'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&h=300&fit=crop', desc:'Master Linux fundamentals essential for hacking. Learn command line, file systems, networking, bash scripting, and Linux security tools.', level:'Beginner', duration:'16 hours', students:'22,000', rating:'4.6', reviews:'4,100', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/aek2tqfgiq50u27/Linux-Basics.zip/file', includes:['16 hours of HD video','Linux command line','Bash scripting basics','Networking in Linux','Certificate of completion','Lifetime access'] },
    h23: { title:'Practical API Hacking', category:'Hacking', img:'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=300&fit=crop', desc:'Hands-on API hacking course. Learn to test REST and GraphQL APIs, find vulnerabilities, and secure your own APIs from common attacks.', level:'Intermediate', duration:'20 hours', students:'7,200', rating:'4.8', reviews:'1,200', price:299, oldPrice:699, downloadUrl:'https://www.mediafire.com/file/1fqmsrt05852bu5/Practical-API-Hacking-TCM.zip/file', includes:['20 hours of HD video','REST API testing','GraphQL attack labs','Postman & Burp Suite','Certificate of completion','Lifetime access'] },
    t6: { title:'Complete Stock Market Course (Alternate)', category:'Trading', img:'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=300&fit=crop', desc:'Complete stock market course covering technical analysis, fundamental analysis, chart patterns, and building profitable trading strategies.', level:'All Levels', duration:'30 hours', students:'16,500', rating:'4.6', reviews:'2,800', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/nq3n92e5obbwxi3/Complete-Stock-Market-course.zip/file', includes:['30 hours of HD video','Chart reading techniques','Technical indicators','Trading psychology','Certificate of completion','Lifetime access'] },
    t7: { title:'Stock Market Zero to Pro Course', category:'Trading', img:'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&h=300&fit=crop', desc:'Journey from stock market beginner to professional trader. Learn swing trading, intraday strategies, options trading, and portfolio management.', level:'All Levels', duration:'35 hours', students:'19,800', rating:'4.7', reviews:'3,200', price:299, oldPrice:699, downloadUrl:'https://www.mediafire.com/file/d5fkmwawdvqpxt3/Stock-Market-Zero-to-Pro-course.zip/file', includes:['35 hours of HD video','Swing trading strategies','Intraday techniques','Options basics','Certificate of completion','Lifetime access'] },
    m4: { title:'Digital Marketing Complete Course', category:'Marketing', img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop', desc:'Complete digital marketing course. Learn SEO, PPC, social media marketing, content marketing, email campaigns, and analytics to grow any business online.', level:'Beginner', duration:'32 hours', students:'21,000', rating:'4.7', reviews:'3,500', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/mjojvqykphkh2wk/Digital-Marketing-Course.zip/file', includes:['32 hours of HD video','SEO fundamentals','PPC campaign setup','Social media strategy','Certificate of completion','Lifetime access'] },
    m5: { title:'Google AdWords Course', category:'Marketing', img:'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&h=300&fit=crop', desc:'Master Google Ads (AdWords) from scratch. Learn search ads, display ads, shopping ads, YouTube ads, and conversion optimization.', level:'Beginner', duration:'22 hours', students:'13,500', rating:'4.6', reviews:'2,100', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/m1ht8xp272ascls/google-adword-course.zip/file', includes:['22 hours of HD video','Search ad campaigns','Display network mastery','YouTube advertising','Certificate of completion','Lifetime access'] },
    m6: { title:'SEO Full Advanced Course', category:'Marketing', img:'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=600&h=300&fit=crop', desc:'Advanced SEO course covering technical SEO, link building, keyword research, local SEO, and algorithm updates. Rank #1 on Google.', level:'Advanced', duration:'28 hours', students:'15,800', rating:'4.8', reviews:'2,700', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/bfuhrth0uchi1nj/SEO-Full-Advance-Corse.rar/file', includes:['28 hours of HD video','Technical SEO audit','Advanced link building','Local SEO strategy','Certificate of completion','Lifetime access'] },
    b4: { title:'Complete Guide to Burp Suite (Hacking Book)', category:'Hacking Book', img:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=300&fit=crop', desc:'The complete guide to Burp Suite for web application security testing. Learn to intercept, scan, and exploit web vulnerabilities professionally.', level:'Intermediate', duration:'PDF Book', students:'8,500', rating:'4.8', reviews:'1,400', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/mcgv24qq3ft4vw9/A_Complete_Guide_to_Burp_Suite.pdf/file', includes:['PDF format (350+ pages)','Burp Suite Pro features','Hands-on examples','Quick reference guides','Instant download','Free lifetime updates'] },
    b5: { title:'Learning Pentesting for Android Devices (Hacking Book)', category:'Hacking Book', img:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=300&fit=crop', desc:'Learn Android penetration testing through this comprehensive guide. Master APK analysis, Android exploitation, and mobile security assessment.', level:'Intermediate', duration:'PDF Book', students:'6,200', rating:'4.7', reviews:'980', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/7o6iofzbpf9cw46/Learning_Pentesting_for_Android_Devices.pdf/file', includes:['PDF format (400+ pages)','APK analysis guide','Android exploitation','Frida scripting','Instant download','Free lifetime updates'] },
    b6: { title:'Mastering Linux Security and Hardening (Hacking Book)', category:'Hacking Book', img:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=300&fit=crop', desc:'Master Linux security hardening. Learn firewall configuration, intrusion detection, access control, and security best practices for Linux systems.', level:'Intermediate', duration:'PDF Book', students:'7,800', rating:'4.8', reviews:'1,300', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/1776vskq4ed12qt/Mastering.Linux.Security.and.Hardening.3rd.Edition.pdf/file', includes:['PDF format (420+ pages)','Firewall configuration','IDS setup guide','Security auditing','Instant download','Free lifetime updates'] },
    b7: { title:'Hacking: The Art of Exploitation 2nd Edition (Hacking Book)', category:'Hacking Book', img:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=300&fit=crop', desc:'The classic hacking textbook. Learn programming, exploitation techniques, networking, and cryptography from the ground up.', level:'Advanced', duration:'PDF Book', students:'15,000', rating:'4.9', reviews:'3,200', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/km6p0z0vpt0zlg7/Hacking.The.Art.of.Exploitation.2nd.Edition.pdf/file', includes:['PDF format (480+ pages)','C programming for hackers','Exploitation techniques','Network attacks','Instant download','Free lifetime updates'] },
    b8: { title:'Windows Ransomware Detection and Protection (Hacking Book)', category:'Hacking Book', img:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=300&fit=crop', desc:'Learn to detect, prevent, and recover from ransomware attacks. Understand ransomware families, analysis techniques, and enterprise protection strategies.', level:'Intermediate', duration:'PDF Book', students:'5,400', rating:'4.7', reviews:'870', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/xpf11t2v45ct2ax/Windows.Ransomware.Detection.and.Protection.pdf/file', includes:['PDF format (380+ pages)','Ransomware analysis','Detection tools guide','Recovery procedures','Instant download','Free lifetime updates'] },
    b9: { title:'2023 Advanced Apple Debugging & Reverse Engineering (Hacking Book)', category:'Hacking Book', img:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=300&fit=crop', desc:'Master Apple platform reverse engineering. Learn iOS/macOS debugging, binary analysis, dyld internals, and Swift runtime exploration.', level:'Advanced', duration:'PDF Book', students:'4,200', rating:'4.9', reviews:'680', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/9i5lp6rczv6jpcg/2023_Advanced_Apple_Debugging_%2526_Reverse_Engineering_4ed_by_Tyree.pdf/file', includes:['PDF format (500+ pages)','iOS debugging techniques','macOS binary analysis','Swift internals','Instant download','Free lifetime updates'] },
    b10: { title:'WooCommerce WordPress Tutorial (Programming Book)', category:'Programming Book', img:'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=300&fit=crop', desc:'Complete WooCommerce tutorial in Hindi. Build your own e-commerce website with WordPress, WooCommerce setup, product management, and payment integration.', level:'Beginner', duration:'PDF Book', students:'11,000', rating:'4.6', reviews:'1,900', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/qaxkifsybturrs3/Woocommerce-in-Wordpress-Tutorial-in-Hindi-Create-ECommerce-Website.rar/file', includes:['PDF format (250+ pages)','WooCommerce setup guide','Product management','Payment gateway setup','Instant download','Free lifetime updates'] },
    d2: { title:'UI/UX Design Fundamentals', category:'Design', img:'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=300&fit=crop', desc:'Learn UI/UX design fundamentals. Master wireframing, prototyping, user research, and design thinking to create beautiful user experiences.', level:'Beginner', duration:'30 hours', students:'16,000', rating:'4.7', reviews:'2,400', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/placeholder_d2', includes:['30 hours of HD video','Figma & Sketch basics','User research methods','Prototyping techniques','Certificate of completion','Lifetime access'] },
    h24: { title:'888RAT 1.1.1 Remote Access Tool', category:'Software & Tools', img:'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&h=300&fit=crop', desc:'888RAT is a powerful remote access tool for system administration and security testing. Features include remote desktop, file management, keylogger, and camera access.', level:'Advanced', duration:'Tool', students:'3,200', rating:'4.5', reviews:'580', price:399, oldPrice:999, downloadUrl:'https://www.mediafire.com/file/adddhsuj00bl4yx/888RAT_1.1.1_RAT_Cracked.7z/file', includes:['Cracked version included','Remote desktop access','File management','Keylogger module','Camera & mic access','Lifetime updates'] },
    h25: { title:'AhMyth Win32 Hacking RAT', category:'Software & Tools', img:'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=300&fit=crop', desc:'AhMyth is an open-source RAT for Win32 systems. Learn remote administration, surveillance techniques, and ethical penetration testing with this tool.', level:'Intermediate', duration:'Tool', students:'4,500', rating:'4.6', reviews:'780', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/m59ylitvtw85i7y/AhMyth_Win32_Hacking_Rat.zip/file', includes:['Win32 version','Remote shell','Screen capture','File explorer','Voice recording','Setup guide'] },
    h26: { title:'AhMyth Win64 Hacking RAT', category:'Software & Tools', img:'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=300&fit=crop', desc:'AhMyth Win64 version with enhanced features for 64-bit systems. Advanced remote administration capabilities for security professionals.', level:'Intermediate', duration:'Tool', students:'4,100', rating:'4.6', reviews:'720', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/dog2ifd1eo66n4b/AhMyth_Win64_Hacking_Rat2.zip/file', includes:['Win64 version','Enhanced performance','64-bit support','Remote administration','Setup guide','Lifetime updates'] },
    h27: { title:'AndroRAT - Android Remote Administration Tool', category:'Software & Tools', img:'https://images.unsplash.com/photo-1612178991541-b48cc8e92a4e?w=600&h=300&fit=crop', desc:'AndroRAT is an Android-based RAT for remote device management. Learn mobile device administration and Android security testing.', level:'Intermediate', duration:'Tool', students:'5,800', rating:'4.7', reviews:'950', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/oeludagegihhcye/AndroRAT_-_AndroBinder.zip/file', includes:['Android RAT tool','Binder integration','SMS access','Contact extraction','GPS tracking','Setup tutorial'] },
    h28: { title:'Cerberus RAT 1.0 Beta', category:'Software & Tools', img:'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&h=300&fit=crop', desc:'Cerberus RAT is a advanced remote access tool with modern features. Includes remote desktop, credential harvesting, and persistence mechanisms.', level:'Advanced', duration:'Tool', students:'2,900', rating:'4.5', reviews:'510', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/98j330zzb9pebvd/Cerberus_RAT_1.0_Beta.rar/file', includes:['Beta version included','Remote desktop','Credential harvesting','Persistence module','Keylogger','Setup guide'] },
    h29: { title:'DroidJack Complete Setup Hacking RAT', category:'Software & Tools', img:'https://images.unsplash.com/photo-1612178991541-b48cc8e92a4e?w=600&h=300&fit=crop', desc:'DroidJack is a powerful Android RAT with complete setup guide. Master mobile device administration and Android penetration testing.', level:'Advanced', duration:'Tool', students:'6,200', rating:'4.7', reviews:'1,050', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/tyvxvad18uyy6ig/Droid_Jack_Complete_Setup_Hacking_Rat.zip/file', includes:['Complete setup included','Android remote control','SMS & call logs','Camera access','Location tracking','Video tutorials'] },
    h30: { title:'NanoCore RAT 1.2.2.0 Cracked', category:'Software & Tools', img:'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&h=300&fit=crop', desc:'NanoCore is a premium RAT with advanced features. Cracked version includes full functionality for security testing and penetration testing.', level:'Advanced', duration:'Tool', students:'7,500', rating:'4.8', reviews:'1,300', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/10erodudviikc16/NanoCore_RAT_1.2.2.0_Cracked.7z/file', includes:['Fully cracked version','Plugin system','Remote desktop','File manager','Registry editor','Lifetime updates'] },
    h31: { title:'spy4 Hacking RAT', category:'Software & Tools', img:'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=300&fit=crop', desc:'spy4 is a lightweight RAT for security testing. Features include screen monitoring, file access, and remote command execution.', level:'Intermediate', duration:'Tool', students:'3,800', rating:'4.5', reviews:'650', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/jjwt4yqsyba3utc/spy4_Hacking_Rat.zip/file', includes:['Lightweight RAT','Screen monitoring','File access','Remote commands','Keylogger','Setup guide'] },
    h32: { title:'SpyNote v8.6 G RAT Cracked', category:'Software & Tools', img:'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&h=300&fit=crop', desc:'SpyNote v8.6 is a premium Android RAT with advanced surveillance features. Cracked version with full functionality for security professionals.', level:'Advanced', duration:'Tool', students:'5,400', rating:'4.7', reviews:'920', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/6twkhjkoe0jee6q/SpyNote_v.8.6_G_RAT_Cracked.rar/file', includes:['v8.6 latest version','Android surveillance','Remote camera','Microphone access','SMS interception','Setup tutorial'] },
    h33: { title:'SpyNote v5.0 Cracked', category:'Software & Tools', img:'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&h=300&fit=crop', desc:'SpyNote v5.0 is a stable version of the popular Android RAT. Cracked with all features unlocked for penetration testing.', level:'Intermediate', duration:'Tool', students:'4,200', rating:'4.6', reviews:'740', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/n48c45lwa7dnnqc/SpyNote_v5.0_Cracked.7z/file', includes:['v5.0 stable version','Android RAT','Screen capture','File management','Call recording','Setup guide'] },
    h34: { title:'Advance Practical Phishing Course', category:'Hacking', img:'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=300&fit=crop', desc:'Master advanced phishing techniques. Learn email phishing, spear phishing, credential harvesting, and social engineering attacks for penetration testing.', level:'Advanced', duration:'20 hours', students:'8,500', rating:'4.8', reviews:'1,500', price:299, oldPrice:699, downloadUrl:'https://www.mediafire.com/file/3zu4iloqbrl6tvf/Advance-Practical-Phishing-course.zip/file', includes:['20 hours of HD video','Phishing page creation','Email phishing templates','Credential harvesting','Certificate of completion','Lifetime access'] },
    h35: { title:'Hacking Using Android From Scratch', category:'Hacking', img:'https://images.unsplash.com/photo-1612178991541-b48cc8e92a4e?w=600&h=300&fit=crop', desc:'Learn to use Android devices for ethical hacking. Master Kali NetHunter, Termux, Android security testing, and mobile penetration testing.', level:'Beginner', duration:'25 hours', students:'11,200', rating:'4.7', reviews:'2,100', price:299, oldPrice:699, downloadUrl:'https://www.mediafire.com/file/c5t1lldk3grxnlc/Hacking_Using_Android_From_Scratch_%255BVideo%255D_%2540RedSkullTM.zip/file', includes:['25 hours of HD video','Kali NetHunter setup','Termux hacking','Android exploitation','Certificate of completion','Lifetime access'] },
    h36: { title:'Payment Gateway Bypass Course', category:'Hacking', img:'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=300&fit=crop', desc:'Understand payment gateway security. Learn about payment processing vulnerabilities, security testing, and how to protect e-commerce platforms.', level:'Advanced', duration:'15 hours', students:'6,800', rating:'4.8', reviews:'1,200', price:299, oldPrice:699, downloadUrl:'https://www.mediafire.com/file/lwfgqphape9xgc8/PAYMENT-GATEWAY-BYPASS-COURSE.rar/file', includes:['15 hours of HD video','Payment flow analysis','Security testing methods','E-commerce protection','Certificate of completion','Lifetime access'] },
    h37: { title:'SS7 Attack & Hacking Course', category:'Hacking', img:'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=300&fit=crop', desc:'Learn SS7 protocol vulnerabilities. Understand telecom hacking, SIM swapping, location tracking, and mobile network security testing.', level:'Advanced', duration:'18 hours', students:'5,200', rating:'4.9', reviews:'890', price:299, oldPrice:699, downloadUrl:'https://www.mediafire.com/file/pui6u8ll0d6kose/Ss7-Attack-Hacking.zip/file', includes:['18 hours of HD video','SS7 protocol deep dive','Location tracking','SMS interception','Certificate of completion','Lifetime access'] },
    h38: { title:'Windows Hacking Complete Course', category:'Hacking', img:'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&h=300&fit=crop', desc:'Complete Windows hacking course. Learn Windows internals, privilege escalation, persistence techniques, and Windows security testing.', level:'Intermediate', duration:'28 hours', students:'9,800', rating:'4.7', reviews:'1,800', price:299, oldPrice:699, downloadUrl:'https://www.mediafire.com/file/dc0rgstbosbguj5/Windows-Hacking-Complete.rar/file', includes:['28 hours of HD video','Windows internals','Privilege escalation','Persistence methods','Certificate of completion','Lifetime access'] },
    p4: { title:'Complete Java Coding Course', category:'Programming', img:'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=300&fit=crop', desc:'Master Java programming from scratch. Learn OOP, data structures, algorithms, GUI development, and build real-world Java applications.', level:'Beginner', duration:'40 hours', students:'28,000', rating:'4.8', reviews:'4,500', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/iboqgp7bp7ln98a/Complete-java-coding_-Course.rar/file', includes:['40 hours of HD video','Java fundamentals','OOP concepts','Data structures','Certificate of completion','Lifetime access','Project-based learning'] },
    h39: { title:'InPayload Android Payload Generator', category:'Software & Tools', img:'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&h=300&fit=crop', desc:'InPayload is an Android payload generation tool. Learn to create custom payloads for Android penetration testing and security assessment.', level:'Advanced', duration:'Tool', students:'4,500', rating:'4.6', reviews:'780', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/lwfgqphape9xgc8/InPayload_byAndroTricks.zip/file', includes:['Payload generator','Custom payload creation','Android exploitation',' evasion techniques','Setup guide','Video tutorials'] },
    h40: { title:'Malcat Malware Analysis Tool', category:'Software & Tools', img:'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=300&fit=crop', desc:'Malcat is a powerful malware analysis tool for Windows and Ubuntu. Analyze suspicious files, understand malware behavior, and build analysis skills.', level:'Advanced', duration:'Tool', students:'3,800', rating:'4.7', reviews:'650', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/25cfhh8hmt9toxx/Malcat_v0.9.6_Win_%2526_Ubuntu.7z/file', includes:['v0.9.6 latest','Windows & Ubuntu','File analysis','Behavior monitoring','Hex editor','Setup guide'] },
    h41: { title:'Ransomware Tool Pack', category:'Software & Tools', img:'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&h=300&fit=crop', desc:'Collection of ransomware analysis tools. Learn to understand ransomware behavior, encryption methods, and develop defense strategies.', level:'Advanced', duration:'Tool', students:'2,800', rating:'4.5', reviews:'480', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/dy1z1904qy5c3zz/Ransomware_tool_pack.zip/file', includes:['Multiple analysis tools','Ransomware samples','Decryption utilities','Analysis guides','Behavior monitoring','Setup tutorial'] },
    m7: { title:'ChatGPT Prompt Engineering BootCamp', category:'Marketing', img:'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop', desc:'Master ChatGPT prompt engineering. Learn to create effective prompts for content creation, marketing, business automation, and AI-powered workflows.', level:'Beginner', duration:'15 hours', students:'35,000', rating:'4.8', reviews:'6,200', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/pzr51fblzzjhdl6/A-To-Z-ChatGPT-Prompt-Engineering-BootCamp.zip/file', includes:['15 hours of HD video','100+ prompt templates','Business use cases','Content creation prompts','Certificate of completion','Lifetime access'] },
    m8: { title:'Adsterra Earning Method', category:'Marketing', img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop', desc:'Learn to earn money with Adsterra advertising network. Master ad placement, traffic generation, and monetization strategies for websites and blogs.', level:'Beginner', duration:'10 hours', students:'8,500', rating:'4.5', reviews:'1,400', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/bzlygnlzfv1k10v/Adsterra_earning_Method.zip/file', includes:['10 hours of HD video','Adsterra setup guide','Traffic generation','Monetization strategies','Certificate of completion','Lifetime access'] },
    m9: { title:'NonDrop Watchtime Method', category:'Marketing', img:'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=300&fit=crop', desc:'Learn the NonDrop watchtime method for YouTube. Get genuine watch hours, grow your channel, and monetize your YouTube content effectively.', level:'Beginner', duration:'8 hours', students:'12,000', rating:'4.6', reviews:'2,100', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/f2tcuo72u4ozy3w/NonDrop_Watchtime_Method.zip/file', includes:['8 hours of HD video','Watchtime strategies','Channel growth tips','Monetization guide','Certificate of completion','Lifetime access'] },
    m10: { title:'Website Traffic Software', category:'Marketing', img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop', desc:'Drive targeted traffic to your website. Learn SEO, social media marketing, paid advertising, and traffic generation tools for business growth.', level:'Beginner', duration:'12 hours', students:'9,200', rating:'4.5', reviews:'1,600', price:249, oldPrice:599, downloadUrl:'https://www.mediafire.com/file/628e7eb0n4ydly3/Website_Traffic_Software_Use.zip/file', includes:['12 hours of HD video','SEO techniques','Social media traffic','Paid advertising','Certificate of completion','Lifetime access'] },
    t8: { title:'Trend Trader PRO Suite 2023', category:'Software & Tools', img:'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=300&fit=crop', desc:'Professional trading suite with advanced indicators, automated signals, and portfolio management tools. Master trend trading with pro-level software.', level:'Advanced', duration:'Tool', students:'5,500', rating:'4.7', reviews:'950', price:0, oldPrice:0, downloadUrl:'https://www.mediafire.com/file/tbkik8wu26tlsi5/Trend_Trader_PRO_Suite_2023.rar/file', includes:['2023 latest version','Advanced indicators','Automated signals','Portfolio tracker','Video tutorials','Lifetime updates'] },
    g1: { title:'Complete Course Bundle Collection', category:'Programming', img:'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&h=300&fit=crop', desc:'Massive collection of programming, hacking, and digital marketing courses. Contains multiple complete courses in one comprehensive bundle for serious learners.', level:'All Levels', duration:'Bundle', students:'15,000', rating:'4.7', reviews:'2,800', price:199, oldPrice:499, downloadUrl:'https://www.mediafire.com/file/3c9gcp5aelc2jx7/zip_courses.rar/file', includes:['Multiple courses included','Programming tutorials','Hacking courses','Marketing guides','Certificate of completion','Lifetime access'] }
};

const previewModal = document.getElementById('previewModal');
const previewClose = document.getElementById('previewClose');
const previewContent = document.getElementById('previewContent');

// Preview buttons
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
                    <span><i class="fas fa-star" style="color:var(--secondary)"></i> ${data.rating} (${data.reviews} reviews)</span>
                </div>
                <div class="preview-includes">
                    <h4><i class="fas fa-check-circle"></i> What's Included</h4>
                    <ul>${data.includes.map(item => `<li><i class="fas fa-check"></i> ${item}</li>`).join('')}</ul>
                </div>
                <div class="preview-footer">
                    <div class="preview-price">
                        <span class="old">?${data.oldPrice.toLocaleString('en-IN')}</span>
                        <span class="new">?${data.price.toLocaleString('en-IN')}</span>
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

previewClose.addEventListener('click', closePreview);
previewModal.addEventListener('click', (e) => { if (e.target === previewModal) closePreview(); });

// Open/Close cart
cartBtn.addEventListener('click', () => { cartSidebar.classList.add('active'); cartOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; });
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
function closeCart() { cartSidebar.classList.remove('active'); cartOverlay.classList.remove('active'); document.body.style.overflow = ''; }

updateCartUI();

// ==================== CHECKOUT ====================
const checkoutModal = document.getElementById('checkoutModal');
const checkoutClose = document.getElementById('checkoutClose');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutForm = document.getElementById('checkoutForm');
const continueShopping = document.getElementById('continueShopping');

// UPI Modal elements
const upiModal = document.getElementById('upiModal');
const upiClose = document.getElementById('upiClose');
const confirmPaymentBtn = document.getElementById('confirmPayment');

let currentStep = 1;
let orderData = {};
let paymentTimerInterval = null;

function showStep(step) {
    document.querySelectorAll('.checkout-step-content').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    document.querySelector(`.step[data-step="${step}"]`).classList.add('active');
    currentStep = step;
}

// Payment option selection
document.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
    });
});

// Step 1: Details
checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    orderData.name = document.getElementById('custName').value;
    orderData.email = document.getElementById('custEmail').value;
    orderData.phone = document.getElementById('custPhone').value;
    const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    document.getElementById('summarySubtotal').textContent = `?${total.toLocaleString('en-IN')}`;
    document.getElementById('summaryTotal').textContent = `?${total.toLocaleString('en-IN')}`;
    showStep(2);
});

// Step 2: Pay Now -> Open UPI Modal
document.getElementById('payBtn').addEventListener('click', () => {
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    orderData.paymentMethod = paymentMethod;
    
    // Generate order ID
    orderData.orderId = 'EDU-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
    orderData.items = [...cart];
    orderData.total = total;
    
    // Close checkout, open UPI modal
    checkoutModal.classList.remove('active');
    setTimeout(() => openUpiModal(total), 300);
});

// ==================== UPI PAYMENT ====================
function openUpiModal(amount) {
    document.getElementById('upiAmount').textContent = `?${amount.toLocaleString('en-IN')}`;
    generateQRCode(amount);
    upiModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    startPaymentTimer();
}

function closeUpiModal() {
    upiModal.classList.remove('active');
    document.body.style.overflow = '';
    if (paymentTimerInterval) clearInterval(paymentTimerInterval);
}

// QR Code Generator (pure canvas - no external lib)
function generateQRCode(amount) {
    const qrBox = document.getElementById('qrCode');
    const qrText = `upi://pay?pa=edubazar@upi&pn=EduBazar&am=${amount}&cu=INR&tn=Payment for courses`;
    
    // Generate QR using simple canvas pattern
    const size = 190;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    // Generate a deterministic pattern from the text
    const modules = 25;
    const moduleSize = size / modules;
    ctx.fillStyle = '#1E1B4B';
    
    // Create a hash from the text for the pattern
    let hash = 0;
    for (let i = 0; i < qrText.length; i++) {
        hash = ((hash << 5) - hash) + qrText.charCodeAt(i);
        hash |= 0;
    }
    
    // Draw finder patterns (3 corners)
    function drawFinder(x, y) {
        // Outer
        ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
        ctx.fillStyle = '#1E1B4B';
        ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
    }
    
    drawFinder(0, 0);
    drawFinder(modules - 7, 0);
    drawFinder(0, modules - 7);
    
    // Fill data area with pseudo-random pattern
    let seed = Math.abs(hash);
    for (let row = 0; row < modules; row++) {
        for (let col = 0; col < modules; col++) {
            // Skip finder patterns
            if ((row < 8 && col < 8) || (row < 8 && col > modules - 9) || (row > modules - 9 && col < 8)) continue;
            
            seed = (seed * 1103515245 + 12345) & 0x7fffffff;
            if (seed % 3 !== 0) {
                ctx.fillStyle = '#1E1B4B';
                ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
            }
        }
    }
    
    // Add EduBazar logo in center
    const centerSize = 5 * moduleSize;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect((size - centerSize) / 2 - 4, (size - centerSize) / 2 - 4, centerSize + 8, centerSize + 8);
    ctx.fillStyle = '#4F46E5';
    ctx.fillRect((size - centerSize) / 2, (size - centerSize) / 2, centerSize, centerSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Poppins';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EB', size / 2, size / 2);
    
    qrBox.innerHTML = '';
    qrBox.appendChild(canvas);
    
    // Update payment link
    document.getElementById('paymentLink').href = qrText;
}

// UPI Tab Switching
document.querySelectorAll('.upi-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.upi-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.upi-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const tabId = tab.dataset.tab;
        document.getElementById('tab' + tabId.charAt(0).toUpperCase() + tabId.slice(1)).classList.add('active');
    });
});

// Copy UPI ID
function copyUpiId() {
    const field = document.getElementById('upiIdField');
    field.select();
    navigator.clipboard.writeText(field.value);
    showToast('UPI ID copied: edubazar@upi');
}

// Payment Timer
function startPaymentTimer() {
    let time = 900; // 15 minutes
    const timerEl = document.getElementById('paymentTimer');
    if (paymentTimerInterval) clearInterval(paymentTimerInterval);
    paymentTimerInterval = setInterval(() => {
        const mins = Math.floor(time / 60);
        const secs = time % 60;
        timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        if (time <= 0) {
            clearInterval(paymentTimerInterval);
            timerEl.textContent = 'EXPIRED';
            timerEl.style.color = '#EF4444';
            showToast('Payment session expired. Please try again.', 'error');
            closeUpiModal();
        }
        time--;
    }, 1000);
}

// Confirm Payment
confirmPaymentBtn.addEventListener('click', () => {
    // Generate order
    orderData.date = new Date().toISOString();
    orderData.status = 'completed';
    orderData.downloadLinks = orderData.items.map(i => {
        const cd = courseData[i.id];
        return {
            name: i.name,
            link: (cd && cd.downloadUrl) ? cd.downloadUrl : `https://edubazar.shop/download/${orderData.orderId}/${i.id}`
        };
    });

    let orders = JSON.parse(localStorage.getItem('edubazar_orders')) || [];
    orders.push(orderData);
    localStorage.setItem('edubazar_orders', JSON.stringify(orders));

    // Clear cart
    cart = [];
    saveCart();

    closeUpiModal();

    // Show success in checkout
    setTimeout(() => {
        document.getElementById('orderIdDisplay').textContent = orderData.orderId;
        document.getElementById('emailDisplay').textContent = orderData.email;
        checkoutModal.classList.add('active');
        showStep(3);
        showToast(`Order placed! ID: ${orderData.orderId}`);
        setTimeout(() => showToast(`Confirmation email sent to ${orderData.email}`), 1500);
    }, 300);
});

// Open checkout
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    closeCart();
    setTimeout(() => { checkoutModal.classList.add('active'); showStep(1); }, 300);
});

// Close checkout
checkoutClose.addEventListener('click', () => { checkoutModal.classList.remove('active'); });
checkoutModal.addEventListener('click', (e) => { if (e.target === checkoutModal) checkoutModal.classList.remove('active'); });
continueShopping.addEventListener('click', () => { checkoutModal.classList.remove('active'); });

// Close UPI modal
upiClose.addEventListener('click', closeUpiModal);
upiModal.addEventListener('click', (e) => { if (e.target === upiModal) closeUpiModal(); });

// ==================== PARALLAX ====================
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    document.querySelectorAll('.shape').forEach((shape, i) => { shape.style.transform = `translateY(${scrolled * (i + 1) * 0.1}px)`; });
});

// ==================== TILT EFFECT ====================
document.querySelectorAll('.course-card, .category-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        card.style.transform = `perspective(1000px) rotateX(${(y - centerY) / 20}deg) rotateY(${(centerX - x) / 20}deg) translateY(-10px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)'; });
});

// ==================== BACK TO TOP ====================
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => { backToTop.classList.toggle('visible', window.scrollY > 500); });
backToTop.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });

// ==================== MOBILE MENU ====================
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.querySelector('.nav-links');
if (hamburger && navLinksEl) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinksEl.classList.toggle('mobile-active');
    });
}

// ==================== SCROLL REVEAL ====================
const revealElements = document.querySelectorAll('.course-card, .category-card, .section-header, .testimonial-card');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revealObserver.observe(el);
});