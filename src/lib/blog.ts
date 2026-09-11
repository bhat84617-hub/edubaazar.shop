export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readMins: number;
  keywords: string[];
  body: { h: string; p: string[] }[];
  products: { slug: string; label: string }[];
};

export const POSTS: BlogPost[] = [
  {
    slug: "best-python-course-under-200-india",
    title: "Best Python Course Under ₹200 in India (2026 Guide)",
    description:
      "Compare affordable Python courses in India under ₹200. What to look for, syllabus checklist, and our top pick for beginners.",
    date: "2026-09-01",
    readMins: 5,
    keywords: ["python course under 200", "cheap python course India", "learn python online", "python for beginners"],
    body: [
      {
        h: "What a good Python course must include",
        p: [
          "A beginner Python course should cover variables, data types, loops, functions, OOP, file handling, and at least 2-3 real projects. Courses that stop at theory leave you unable to build anything.",
          "Look for 30+ hours of content, coding exercises, and lifetime access so you can revise before interviews.",
        ],
      },
      {
        h: "Why price is not the real cost",
        p: [
          "A ₹5,000 course you never finish costs more than a ₹199 course you complete. Completion rate matters more than brand name for your first language.",
          "UPI-based platforms like EduBazar.shop keep prices low by selling direct, with the same core syllabus: data structures, OOP, web scraping, and projects.",
        ],
      },
      {
        h: "Our pick for beginners",
        p: [
          "Python Complete Course: Beginner to Advanced covers 42 hours, 200+ exercises, and 10+ projects at ₹199 with a certificate. It is the highest-reviewed programming course on our store with 45,000 students.",
        ],
      },
    ],
    products: [
      { slug: "python-complete-course-beginner-to-advanced", label: "Python Complete Course — ₹199" },
      { slug: "python-crash-course-complete-guide", label: "Python Crash Course Book — ₹1" },
    ],
  },
  {
    slug: "best-ethical-hacking-course-india-beginners",
    title: "Best Ethical Hacking Course in India for Beginners (2026)",
    description:
      "How to choose an ethical hacking course as a beginner: labs, Kali Linux, certifications, and the safest learning path.",
    date: "2026-09-02",
    readMins: 6,
    keywords: ["ethical hacking course India", "learn ethical hacking online", "penetration testing course", "kali linux course"],
    body: [
      {
        h: "Start with labs, not theory",
        p: [
          "Hacking is a practical skill. Any course without hands-on labs on Kali Linux, Nmap, and Burp Suite will waste your time. Demand 25+ lab exercises minimum.",
          "Practice only on labs you own or vulnerable machines built for training, never on real systems without written permission.",
        ],
      },
      {
        h: "The beginner roadmap",
        p: [
          "Step 1: Complete Ethical Hacking & Penetration Testing for foundations and 35+ labs. Step 2: Web Application Hacking & Security for OWASP Top 10. Step 3: Kali Linux for Ethical Hackers for tooling depth.",
          "This path takes you from zero to job-ready basics in 3-4 months of consistent practice.",
        ],
      },
      {
        h: "What about advanced tools?",
        p: [
          "Remote access tools and malware analysis are advanced topics for authorized lab environments only. Master the basics first; our security lab courses carry clear authorized-use guidance.",
        ],
      },
    ],
    products: [
      { slug: "complete-ethical-hacking-penetration-testing", label: "Complete Ethical Hacking — ₹199" },
      { slug: "web-application-hacking-security", label: "Web Application Hacking — ₹249" },
      { slug: "kali-linux-for-ethical-hackers", label: "Kali Linux for Ethical Hackers — ₹199" },
    ],
  },
  {
    slug: "free-stock-market-course-india",
    title: "Best Free Stock Market Course in India (Learn Trading Free)",
    description:
      "Where to learn stock market trading free in India: what a free course should teach and when to consider a paid upgrade.",
    date: "2026-09-03",
    readMins: 4,
    keywords: ["free stock market course", "learn trading free India", "stock market for beginners", "technical analysis free"],
    body: [
      {
        h: "What a free trading course should teach",
        p: [
          "At minimum: how markets work, candlestick reading, support and resistance, risk management, and position sizing. Avoid any course promising guaranteed returns.",
          "Our free Stock Market Mastery: Zero to Pro covers 38 hours including technical analysis and chart patterns at no cost.",
        ],
      },
      {
        h: "When to go paid",
        p: [
          "Consider a paid course only after finishing a free one and paper-trading for a month. Paid makes sense for structured crypto or forex modules with live sessions.",
        ],
      },
    ],
    products: [
      { slug: "stock-market-mastery-zero-to-pro", label: "Stock Market Mastery — FREE" },
      { slug: "crypto-trading-pro-bitcoin-altcoins", label: "Crypto Trading Pro — ₹249" },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
