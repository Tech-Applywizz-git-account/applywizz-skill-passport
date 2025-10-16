export const candidateData = {
  name: "Rohit Kumar",
  role: "Full-stack Engineer",
  company: "PixelMint",
  location: "Bangalore",
  avatar: "",
  matchScore: 87,
  badgeLevel: "Gold",
  availability: 15,
  expectedSalary: "₹18–22 LPA",
  noticePeriod: 15,
  experience: "3.2 years",
  quickTags: [
    { label: "React", type: "positive" },
    { label: "Node", type: "positive" },
    { label: "TypeScript", type: "positive" },
    { label: "AWS", type: "negative" },
  ],
  matchBreakdown: [
    { label: "Must-have Skills", score: 49, maxScore: 55, color: "bg-primary" },
    { label: "Nice-to-have Skills", score: 8, maxScore: 15, color: "bg-info" },
    { label: "Experience", score: 9, maxScore: 10, color: "bg-success" },
    { label: "Projects", score: 8, maxScore: 10, color: "bg-warning" },
    { label: "Assessments", score: 6, maxScore: 7, color: "bg-primary" },
    { label: "Availability", score: 3, maxScore: 3, color: "bg-success" },
    { label: "Verified Bonus", score: 4, maxScore: 5, color: "bg-info" },
  ],
  sections: [
    {
      id: "education",
      title: "Education",
      icon: "GraduationCap",
      summary: "B.Tech CSE (2019) — CGPA 8.2 — VIT University",
      chips: ["Verified ✅", "2015-2019"],
      hoverColor: "hover:bg-primary/5",
    },
    {
      id: "certifications",
      title: "Certifications",
      icon: "Certificate",
      summary: "Meta Front-End (2022), Coursera Node.js (2021)",
      chips: ["2 Certificates", "All Verified"],
      hoverColor: "hover:bg-info/5",
    },
    {
      id: "internships",
      title: "Internships",
      icon: "BriefcaseBusiness",
      summary: "Acme Labs — Frontend Intern — Jun–Aug 2020",
      chips: ["3 months", "Web Dev"],
      hoverColor: "hover:bg-warning/5",
    },
    {
      id: "work",
      title: "Work Experience",
      icon: "Building2",
      summary: "PixelMint — Full-stack Engineer — 2022–Present + 1 more role",
      chips: ["3.2 years", "Current"],
      hoverColor: "hover:bg-primary/5",
    },
    {
      id: "projects",
      title: "Projects / Portfolio",
      icon: "Globe",
      summary: "Retail POS SPA, Claims Portal SPA",
      chips: ["React", "Node", "MongoDB"],
      hoverColor: "hover:bg-success/5",
    },
    {
      id: "tech",
      title: "Tech Profiles & Skills",
      icon: "Settings2",
      summary: "GitHub, LeetCode, Portfolio — React (Expert), Node (Intermediate)",
      chips: ["10+ Skills", "3 Profiles"],
      hoverColor: "hover:bg-info/5",
    },
    {
      id: "assessments",
      title: "Assessments & Badges",
      icon: "Medal",
      summary: "React 83/100, DSA 72/100 — Badge: Gold",
      chips: ["2 Assessments", "Gold Badge"],
      hoverColor: "hover:bg-warning/5",
    },
    {
      id: "social",
      title: "Social & Resume",
      icon: "FileText",
      summary: "LinkedIn: /in/rohit-kumar — Resume: PDF • 2 pages",
      chips: ["LinkedIn", "Resume"],
      hoverColor: "hover:bg-primary/5",
    },
  ],
  sectionDetails: {
    education: {
      title: "Education",
      items: [
        {
          title: "Bachelor of Technology in Computer Science",
          subtitle: "VIT University • 2015-2019",
          verified: true,
          details: {
            CGPA: "8.2/10",
            Major: "Computer Science & Engineering",
            Location: "Vellore, Tamil Nadu",
          },
          files: [
            { name: "Degree Certificate.pdf", url: "#" },
            { name: "Transcript.pdf", url: "#" },
          ],
        },
      ],
    },
    certifications: {
      title: "Certifications",
      items: [
        {
          title: "Meta Front-End Developer Professional Certificate",
          subtitle: "Coursera • 2022",
          verified: true,
          details: {
            Domain: "Frontend Development",
            "Valid Till": "Lifetime",
          },
          links: [{ label: "View Credential", url: "#" }],
        },
        {
          title: "Node.js Backend Development",
          subtitle: "Coursera • 2021",
          verified: true,
          details: {
            Domain: "Backend Development",
            "Valid Till": "Lifetime",
          },
          links: [{ label: "View Credential", url: "#" }],
        },
      ],
    },
    internships: {
      title: "Internships",
      items: [
        {
          title: "Frontend Developer Intern",
          subtitle: "Acme Labs • Jun–Aug 2020",
          verified: true,
          description:
            "Worked on building responsive web applications using React and Redux. Collaborated with the design team to implement pixel-perfect UIs.",
          details: {
            Duration: "3 months",
            Domain: "Web Development",
            Location: "Remote",
          },
          chips: ["React", "Redux", "CSS"],
          files: [{ name: "Internship Letter.pdf", url: "#" }],
        },
      ],
    },
    work: {
      title: "Work Experience",
      items: [
        {
          title: "Full-stack Engineer",
          subtitle: "PixelMint • Jan 2022 – Present",
          verified: true,
          description:
            "Leading development of core products using React, Node.js, and MongoDB. Mentoring junior developers and conducting code reviews.",
          details: {
            Duration: "2+ years",
            Location: "Bangalore",
            Team: "Product Engineering",
          },
          chips: ["React", "Node.js", "MongoDB", "AWS"],
          files: [
            { name: "Offer Letter.pdf", url: "#" },
            { name: "Latest Payslip.pdf", url: "#" },
          ],
        },
        {
          title: "Frontend Developer",
          subtitle: "TechStart Solutions • Jun 2020 – Dec 2021",
          verified: true,
          description:
            "Built and maintained multiple client-facing web applications. Improved performance and accessibility across projects.",
          details: {
            Duration: "1.5 years",
            Location: "Bangalore",
            Team: "Frontend",
          },
          chips: ["React", "TypeScript", "Tailwind"],
          files: [
            { name: "Offer Letter.pdf", url: "#" },
            { name: "Relieving Letter.pdf", url: "#" },
          ],
        },
      ],
    },
    projects: {
      title: "Projects / Portfolio",
      items: [
        {
          title: "Retail POS Single Page Application",
          description:
            "Built a complete point-of-sale system for retail stores with inventory management, billing, and analytics dashboard.",
          chips: ["React", "Node.js", "PostgreSQL", "Redis"],
          links: [
            { label: "Live Demo", url: "#" },
            { label: "GitHub", url: "#" },
          ],
        },
        {
          title: "Claims Portal SPA",
          description:
            "Insurance claims management portal with document upload, workflow automation, and real-time notifications.",
          chips: ["React", "Express", "MongoDB", "Socket.io"],
          links: [
            { label: "Live Demo", url: "#" },
            { label: "Case Study", url: "#" },
          ],
        },
      ],
    },
    tech: {
      title: "Tech Profiles & Skills",
      items: [
        {
          title: "Technical Profiles",
          links: [
            { label: "GitHub", url: "https://github.com/rohit" },
            { label: "LeetCode", url: "https://leetcode.com/rohit" },
            { label: "Portfolio", url: "https://rohit.dev" },
          ],
        },
        {
          title: "Skills",
          chips: [
            "React (Expert)",
            "Node.js (Intermediate)",
            "TypeScript (Expert)",
            "MongoDB (Intermediate)",
            "PostgreSQL (Beginner)",
            "AWS (Beginner)",
            "Docker (Intermediate)",
            "Git (Expert)",
            "REST APIs (Expert)",
            "GraphQL (Intermediate)",
          ],
        },
      ],
    },
    assessments: {
      title: "Assessments & Badges",
      items: [
        {
          title: "React Assessment",
          subtitle: "Score: 83/100",
          verified: true,
          details: {
            Level: "Advanced",
            "Completed On": "Dec 2023",
          },
        },
        {
          title: "Data Structures & Algorithms",
          subtitle: "Score: 72/100",
          verified: true,
          details: {
            Level: "Intermediate",
            "Completed On": "Nov 2023",
          },
        },
        {
          title: "Badge Achievement",
          subtitle: "Gold Badge",
          description: "Earned for consistent high performance across assessments",
        },
      ],
    },
    social: {
      title: "Social & Resume",
      items: [
        {
          title: "LinkedIn Profile",
          links: [{ label: "linkedin.com/in/rohit-kumar", url: "#" }],
        },
        {
          title: "Resume",
          description: "Latest resume with detailed work experience and projects",
          files: [{ name: "Rohit_Kumar_Resume.pdf", url: "#" }],
        },
      ],
    },
  },
};