import { Sparkles, Megaphone, BrainCircuit, BookOpen } from "lucide-react";

export const COURSES = [
  {
    id: "demo",
    icon: Sparkles,
    tag: "DEMO",
    title: "Demo Course",
    desc: "A short walkthrough course to preview how Nexrnn's learning experience works.",
    duration: "1 Week",
    level: "Beginner to Advanced",
    mode: "Online",
    projects: 0,
    certificate: true,
    mentorship: false,
    price: 10,
    originalPrice: 100,
    discount: "90% OFF",
    lessons: 6,
    rating: 4.9,
    reviews: 210,
    whatYoullLearn: ["See how the course platform works", "Preview the learning experience"],
    whoShouldTake: ["Anyone curious about Nexrnn courses"],
    faqs: [],
  },
  {
    id: "digital-marketing",
    icon: Megaphone,
    tag: "DIGITAL MARKETING",
    title: "Digital Marketing",
    desc: "A practical, campaign-focused course covering everything from SEO to paid ads to analytics.",
    duration: "3 Months",
    level: "Beginner to Advanced",
    mode: "Online / Offline (Lucknow)",
    projects: 4,
    certificate: true,
    mentorship: true,
    price: 4999,
    originalPrice: 9999,
    discount: "50% OFF",
    lessons: 32,
    rating: 4.8,
    reviews: 319,
    whatYoullLearn: [
      "Plan and run real Google Ads and Meta Ads campaigns",
      "Optimize a Google Business Profile for local visibility",
      "Build and execute a content and social media strategy",
      "Read analytics data and turn it into decisions",
      "Generate and qualify leads for a business",
    ],
    whoShouldTake: [
      "Students exploring a digital marketing career",
      "Business owners who want to market in-house",
      "Freelancers looking to add marketing services",
    ],
    faqs: [
      { q: "Do I need prior experience?", a: "No — the course starts from fundamentals and builds up to campaign management." },
      { q: "Is this hands-on?", a: "Yes — you will plan and run real ad campaigns as part of the course." },
      { q: "Is the course online or offline?", a: "Both — you can join online or attend in person in Lucknow." },
      { q: "Will I get a certificate?", a: "Yes, a certificate of completion is issued once you finish the course." },
      { q: "Is mentorship included?", a: "Yes, mentorship is included with this course." },
    ],
  },
  {
    id: "artificial-intelligence",
    icon: BrainCircuit,
    tag: "ARTIFICIAL INTELLIGENCE",
    title: "Artificial Intelligence",
    desc: "A practical AI course covering fundamentals, generative AI, prompt engineering and real applications.",
    duration: "2 Months",
    level: "Beginner to Intermediate",
    mode: "Online",
    projects: 3,
    certificate: true,
    mentorship: false,
    price: 3999,
    originalPrice: 7999,
    discount: "50% OFF",
    lessons: 24,
    rating: 5.0,
    reviews: 46,
    whatYoullLearn: [
      "Understand core AI & ML concepts",
      "Use generative AI tools effectively",
      "Write strong prompts",
      "Build real AI-powered mini projects",
    ],
    whoShouldTake: ["Students exploring AI as a career", "Professionals wanting to use AI tools at work"],
    faqs: [],
  },
  {
    id: "web-development",
    icon: BookOpen,
    tag: "WEB DEVELOPMENT",
    title: "Web Development",
    desc: "Build and deploy full websites from scratch — HTML, CSS, JavaScript and modern frameworks.",
    duration: "4 Months",
    level: "Beginner to Mastery",
    mode: "Online / Offline (Lucknow)",
    projects: 6,
    certificate: true,
    mentorship: true,
    price: 5999,
    originalPrice: 11999,
    discount: "50% OFF",
    lessons: 40,
    rating: 4.9,
    reviews: 128,
    whatYoullLearn: [
      "Build responsive websites with HTML, CSS & JavaScript",
      "Work with modern frameworks",
      "Deploy real projects live",
    ],
    whoShouldTake: ["Beginners wanting to become web developers", "Freelancers wanting to build client sites"],
    faqs: [],
  },
];

export const INITIAL_MY_COURSES = [
  { ...COURSES[1], progress: 100 },
  { ...COURSES[3], progress: 35 },
];

export const COMMUNITIES = [{ id: 1, name: "Nexrnn Digital Marketing — Community", posts: 99 }];

const digitalMarketingModules = [
  {
    id: "m1",
    title: "Module 1: Introduction to Digital Marketing",
    lessons: [
      { id: "l1", title: "What is Digital Marketing?", type: "video", duration: "12 MIN", done: true, freePreview: true },
      { id: "l2", title: "Setting up your first campaign", type: "video", duration: "18 MIN", done: true, freePreview: true },
      { id: "l3", title: "Reading notes & resources", type: "text", done: false, freePreview: false },
    ],
  },
  {
    id: "m2",
    title: "Module 2: SEO Fundamentals",
    lessons: [
      { id: "l4", title: "On-page SEO basics", type: "video", duration: "22 MIN", done: false, freePreview: false },
      { id: "l5", title: "Keyword research walkthrough", type: "video", duration: "16 MIN", done: false, freePreview: false },
    ],
  },
  {
    id: "m3",
    title: "Module 3: Paid Ads",
    lessons: [
      { id: "l6", title: "Google Ads & YouTube Ads", type: "video", duration: "28 MIN", done: false, freePreview: false },
      { id: "l7", title: "Facebook & Instagram Ads", type: "video", duration: "24 MIN", done: false, freePreview: false },
      { id: "l8", title: "Download your E-Certificate", type: "text", done: false, freePreview: false },
    ],
  },
];

// Kept for backwards compatibility with the course player (defaults to Digital Marketing)
export const MODULES = digitalMarketingModules;

export const CURRICULUM_BY_COURSE = {
  "digital-marketing": digitalMarketingModules,
  demo: [
    {
      id: "d-m1",
      title: "Module 1: Getting Started",
      lessons: [
        { id: "d-l1", title: "Welcome & platform tour", type: "video", duration: "5 MIN", done: false, freePreview: true },
        { id: "d-l2", title: "How courses are structured", type: "text", done: false, freePreview: true },
      ],
    },
  ],
  "artificial-intelligence": [
    {
      id: "ai-m1",
      title: "Module 1: AI Fundamentals",
      lessons: [
        { id: "ai-l1", title: "What is Artificial Intelligence?", type: "video", duration: "14 MIN", done: false, freePreview: true },
        { id: "ai-l2", title: "Generative AI overview", type: "video", duration: "20 MIN", done: false, freePreview: false },
      ],
    },
    {
      id: "ai-m2",
      title: "Module 2: Prompt Engineering",
      lessons: [
        { id: "ai-l3", title: "Writing effective prompts", type: "video", duration: "18 MIN", done: false, freePreview: false },
        { id: "ai-l4", title: "Real-world AI projects", type: "text", done: false, freePreview: false },
      ],
    },
  ],
  "web-development": [
    {
      id: "wd-m1",
      title: "Module 1: HTML & CSS Basics",
      lessons: [
        { id: "wd-l1", title: "Structuring a webpage", type: "video", duration: "15 MIN", done: false, freePreview: true },
        { id: "wd-l2", title: "Styling with CSS", type: "video", duration: "20 MIN", done: false, freePreview: false },
      ],
    },
    {
      id: "wd-m2",
      title: "Module 2: JavaScript & Frameworks",
      lessons: [
        { id: "wd-l3", title: "JavaScript fundamentals", type: "video", duration: "25 MIN", done: false, freePreview: false },
        { id: "wd-l4", title: "Deploying your first project", type: "text", done: false, freePreview: false },
      ],
    },
  ],
};

export const INITIAL_NOTIFICATIONS = [
  { id: 1, text: "posted in Nexrnn Digital Marketing — Community", detail: "Assignment: Keyword Research Sheet", time: "3 weeks ago", read: false },
  { id: 2, text: "posted in Nexrnn Digital Marketing — Community", detail: "New resource — Prompt pack for content ideas", time: "3 weeks ago", read: false },
  { id: 3, text: "posted in Nexrnn Artificial Intelligence — Community", detail: "Live session recording uploaded", time: "last month", read: false },
  { id: 4, text: "posted in Nexrnn Digital Marketing — Community", detail: "Reminder: submit your campaign report", time: "last month", read: false },
];
