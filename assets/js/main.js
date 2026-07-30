const app = document.getElementById("app");

const DEFAULT_SECTION_LABELS = {
  about: "About me",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  experiments: "Experiments",
  recommendations: "Recommendations",
  blogs: "Blogs",
};

let activeTabIds = [];

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const renderList = (items = []) => items.map((text) => `<li>${escapeHtml(text)}</li>`).join("");

const isAbsoluteUrl = (value = "") => /^https?:\/\//.test(value);

const formatDate = (value = "") => {
  const match = String(value).match(/^([A-Za-z]{3})\s+(\d{4})$/);
  if (!match) {
    return value;
  }

  const months = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  return `${months[match[1]]}/${match[2]}`;
};

const formatDateRange = (start = "", end = "") => {
  const formattedEnd = end === "Present" ? "Present" : formatDate(end);
  return `${formatDate(start)} - ${formattedEnd}`;
};

const renderRole = (role = "") =>
  String(role)
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
    .map(
      (part, index) =>
        `<span class="hero-role-group">${index > 0 ? '<span class="hero-role-separator" aria-hidden="true">|</span>' : ""}<span class="hero-role-item">${escapeHtml(part)}</span></span>`,
    )
    .join("");

const renderLinkButton = (link = {}) => {
  if (!link?.url || !link?.label) {
    return "";
  }

  return `<a class="chip-link" href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`;
};

const chunkItems = (items = [], chunkCount = 2) => {
  if (!items.length) {
    return [];
  }

  const normalizedChunkCount = Math.max(1, Math.min(chunkCount, items.length));
  const columns = Array.from({ length: normalizedChunkCount }, () => []);

  items.forEach((item, index) => {
    columns[index % normalizedChunkCount].push(item);
  });

  return columns;
};

const buildContactItems = (basics = {}) =>
  [
    basics.linkedin
      ? {
          icon: "assets/images/contact/linkedin.png",
          iconClass: "linkedin",
          title: "LinkedIn",
          value: "Professional Profile",
          url: basics.linkedin,
        }
      : null,
    basics.github
      ? {
          icon: "assets/images/contact/github.png",
          iconClass: "github",
          title: "GitHub",
          value: "Code & Projects",
          url: basics.github,
        }
      : null,
    basics.email
      ? {
          icon: "assets/images/contact/email.svg",
          iconClass: "email",
          title: "Email",
          value: basics.email,
          url: `mailto:${basics.email}`,
        }
      : null,
    basics.phone
      ? {
          icon: "assets/images/contact/phone.svg",
          iconClass: "phone",
          title: "Phone",
          value: basics.phone,
          url: `tel:${basics.phone.replace(/[^\d+]/g, "")}`,
        }
      : null,
  ].filter(Boolean);

const renderContactCards = (items = []) =>
  items
    .map((item) => {
      const targetAttrs = isAbsoluteUrl(item.url) ? ' target="_blank" rel="noreferrer"' : "";

      return `
        <a class="card contact-card" href="${escapeHtml(item.url)}"${targetAttrs} aria-label="${escapeHtml(item.title)}: ${escapeHtml(item.value)}">
          <img class="contact-icon contact-icon-${escapeHtml(item.iconClass)}" src="${escapeHtml(item.icon)}" alt="" />
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.value)}</p>
        </a>
      `;
    })
    .join("");

const renderAbout = (data = {}) => {
  const contactItems = buildContactItems(data.basics || {});

  return `
    <section class="panel-grid one-col">
      <article class="card profile-card">
        <p class="summary about-summary">${escapeHtml(data.summary || "")}</p>
      </article>
    </section>
    ${
      contactItems.length
        ? `
      <section class="panel-grid about-contact-grid">
        ${renderContactCards(contactItems)}
      </section>
    `
        : ""
    }
  `;
};

const groupExperienceByCompany = (items = []) => {
  const grouped = {};

  items.forEach((item) => {
    if (!grouped[item.company]) {
      grouped[item.company] = [];
    }

    grouped[item.company].push(item);
  });

  return grouped;
};

const renderExperience = (items = []) => {
  const grouped = groupExperienceByCompany(items);

  if (!Object.keys(grouped).length) {
    return `<section class="panel-grid one-col"><article class="card"><p class="muted">No experience entries yet.</p></article></section>`;
  }

  return `
    <section class="panel-grid one-col">
      ${Object.entries(grouped)
        .map(
          ([company, roles], companyIdx) => `
        <article class="card company-card">
          <h3 class="company-name">${escapeHtml(company)}</h3>
          <div class="company-roles">
            ${roles
              .map(
                (role, roleIdx) => `
              <div class="role-item">
                <button class="role-header" type="button" aria-expanded="false" aria-controls="role-content-${companyIdx}-${roleIdx}">
                  <div class="role-title">
                    <h4>${escapeHtml(role.title || "")}</h4>
                    <span class="role-meta">${escapeHtml(role.location || "")}${role.employmentType ? ` • ${escapeHtml(role.employmentType)}` : ""}</span>
                  </div>
                  <span class="role-date">${escapeHtml(formatDateRange(role.start, role.end))}</span>
                  <span class="expand-icon">▼</span>
                </button>
                <div id="role-content-${companyIdx}-${roleIdx}" class="role-content" hidden>
                  <ul class="bullets">${renderList(role.highlights || [])}</ul>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </article>
      `,
        )
        .join("")}
    </section>
  `;
};

const renderEducation = (items = []) => {
  if (!items.length) {
    return `<section class="panel-grid one-col"><article class="card"><p class="muted">No education records yet.</p></article></section>`;
  }

  return `
    <section class="panel-grid one-col">
      ${items
        .map(
          (item) => `
        <article class="card company-card">
          <h3 class="company-name">${escapeHtml(item.school || "")}</h3>
          <div class="company-roles">
            <div class="role-item">
              <div class="education-entry">
                <div class="role-title">
                  <h4>${escapeHtml(item.degree || "")}</h4>
                </div>
                <span class="role-date">${escapeHtml(formatDateRange(item.start, item.end))}</span>
              </div>
            </div>
          </div>
        </article>
      `,
        )
        .join("")}
    </section>
  `;
};

const renderSkills = (skills = {}) => {
  const entries = Object.entries(skills || {});

  if (!entries.length) {
    return `<section class="panel-grid one-col"><article class="card"><p class="muted">No skills added yet.</p></article></section>`;
  }

  return `
    <section class="panel-grid one-col">
      <article class="card company-card">
        <h3 class="company-name">Skills</h3>
        <div class="company-roles">
          ${entries
            .map(([category, items], idx) => {
              const skillItems = Array.isArray(items) ? items : [];
              const skillColumns = chunkItems(skillItems, skillItems.length > 9 ? 3 : 2);

              return `
                <div class="role-item">
                  <button class="role-header" type="button" aria-expanded="false" aria-controls="skill-content-${idx}">
                    <div class="role-title">
                      <h4>${escapeHtml(category)}</h4>
                    </div>
                    <span class="expand-icon">▼</span>
                  </button>
                  <div id="skill-content-${idx}" class="role-content" hidden>
                    <div class="skill-columns skill-columns-${skillColumns.length}">
                      ${skillColumns.map((column) => `<ul class="bullets skill-list">${renderList(column)}</ul>`).join("")}
                    </div>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </article>
    </section>
  `;
};

const renderCertificationBadge = (item = {}) => {
  const normalizedItem = typeof item === "string" ? { name: item } : item;
  const name = normalizedItem.name || "Certification";

  if (normalizedItem.badgeUrl) {
    return `
      <span class="certification-badge-spinner">
        <img class="certification-badge-image certification-badge-front" src="${escapeHtml(normalizedItem.badgeUrl)}" alt="${escapeHtml(name)} badge" />
        <img class="certification-badge-image certification-badge-back" src="${escapeHtml(normalizedItem.badgeUrl)}" alt="" aria-hidden="true" />
      </span>
    `;
  }

  return `
    <span class="certification-badge-spinner">
      <span class="certification-badge-placeholder certification-badge-front" aria-hidden="true">◆</span>
      <span class="certification-badge-placeholder certification-badge-back" aria-hidden="true">◆</span>
    </span>
  `;
};

const renderCertifications = (items = []) => {
  if (!items.length) {
    return `<section class="panel-grid one-col"><article class="card"><p class="muted">No certifications added yet.</p></article></section>`;
  }

  return `
    <section class="panel-grid one-col">
      ${items
        .map((item) => {
          // Certifications can be a plain string, or an object like:
          // { "name": "AWS Certified AI Practitioner", "studyGuideUrl": "https://..." }
          const name = typeof item === "string" ? item : item.name || "";
          const studyGuideUrl = typeof item === "object" && item.studyGuideUrl ? item.studyGuideUrl : "";

          return `
        <article class="card cert-card">
          <div class="cert-badge-visual" title="${escapeHtml(name)}">
            ${renderCertificationBadge(item)}
          </div>
          <div class="cert-info">
            <p><strong>${escapeHtml(name)}</strong></p>
            ${
              studyGuideUrl
                ? `<a class="chip-link" href="${escapeHtml(studyGuideUrl)}" target="_blank" rel="noreferrer"> Free - Quick Study Guide</a>`
                : ""
            }
          </div>
        </article>
      `;
        })
        .join("")}
    </section>
  `;
};

const renderCertificationShowcase = (items = []) => {
  if (!items.length) {
    return "";
  }

  return `
    <div class="hero-certifications" aria-label="Certification badges">
      <div class="hero-badge-list">
        ${items
          .map((item) => {
            const name = typeof item === "string" ? item : item.name || "Certification";
            return `
              <div class="hero-badge" title="${escapeHtml(name)}" aria-label="${escapeHtml(name)}">
                ${renderCertificationBadge(item)}
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
};

const renderHeroBadgeCarousel = (data = {}) => {
  const badgeSlides = (data.certifications || []).filter((item) => typeof item === "object" && item.badgeUrl);
  const slides = badgeSlides.map((item, index) => {
    const nextItem = badgeSlides[(index + 1) % badgeSlides.length];

    return `<div class="hero-profile-slide${index === 0 ? " active" : ""}" aria-hidden="${index === 0 ? "false" : "true"}">
        <span class="hero-carousel-spinner">
          <img class="hero-carousel-badge hero-carousel-badge-front" src="${escapeHtml(item.badgeUrl)}" alt="${escapeHtml(item.name || "Certification")} badge" />
          <img class="hero-carousel-badge hero-carousel-badge-back" src="${escapeHtml(nextItem.badgeUrl)}" alt="" aria-hidden="true" />
        </span>
      </div>`;
  });

  return slides.length
    ? `<div class="hero-badge-carousel" aria-label="Certification badges">${slides.join("")}</div>`
    : `<div class="hero-badge-carousel"><span class="certification-badge-placeholder" aria-hidden="true">◆</span></div>`;
};

const getRecommendationsWidgetMarkup = (widget = {}) => {
  const provider = String(widget.provider || "").toLowerCase();
  const widgetId = String(widget.widgetId || "").trim();

  if (!widgetId) {
    return "";
  }

  if (provider === "elfsight") {
    return `<div class="recommendations-widget-shell"><div class="elfsight-app-${escapeHtml(widgetId)}" data-elfsight-app-lazy></div></div>`;
  }

  if (provider === "sociablekit") {
    return `<div class="recommendations-widget-shell"><div class="sk-ww-linkedin-recommendations" data-embed-id="${escapeHtml(widgetId)}"></div></div>`;
  }

  return "";
};

const loadScriptOnce = (id, src) => {
  if (document.getElementById(id)) {
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = true;
  document.body.appendChild(script);
};

const wireRecommendationsWidget = (widget = {}) => {
  const provider = String(widget.provider || "").toLowerCase();
  const widgetId = String(widget.widgetId || "").trim();

  if (!widget.enabled || !widgetId) {
    return;
  }

  if (provider === "elfsight") {
    loadScriptOnce("elfsight-platform-script", "https://static.elfsight.com/platform/platform.js");
  }

  if (provider === "sociablekit") {
    loadScriptOnce(
      "sociablekit-linkedin-recommendations-script",
      "https://widgets.sociablekit.com/linkedin-recommendations/widget.js",
    );
  }
};

const renderExperiments = (items = []) => {
  if (!items.length) {
    return `<section class="panel-grid one-col"><article class="card"><p class="muted">No experiments added yet.</p></article></section>`;
  }

  const prioritizeBackendLinks = (links = []) => {
    const apiLinks = links.filter((link) => /api/i.test(link.label || ""));
    const otherLinks = links.filter((link) => !/api/i.test(link.label || ""));
    return [...apiLinks, ...otherLinks];
  };

  return `
    <section class="panel-grid one-col">
      ${items
        .map(
          (item) => `
        <article class="card experiment-card">
          <h3>${escapeHtml(item.name || "")}</h3>
          <div class="experiment-sections">
            ${
              item.frontend
                ? `
              <div class="tech-section">
                <h4>Frontend</h4>
                <p class="tech-stack">${(item.frontend.tech || []).map((tech) => escapeHtml(tech)).join(" • ")}</p>
                <ul class="bullets">${renderList(item.frontend.highlights || [])}</ul>
                <div class="links-group">
                  ${(item.frontend.links || []).map((link) => renderLinkButton(link)).join("")}
                </div>
              </div>
            `
                : ""
            }
            ${
              item.backend
                ? `
              <div class="tech-section">
                <h4>Backend</h4>
                <p class="tech-stack">${(item.backend.tech || []).map((tech) => escapeHtml(tech)).join(" • ")}</p>
                <ul class="bullets">${renderList(item.backend.highlights || [])}</ul>
                <div class="links-group">
                  ${prioritizeBackendLinks(item.backend.links || []).map((link) => renderLinkButton(link)).join("")}
                </div>
              </div>
            `
                : ""
            }
          </div>
        </article>
      `,
        )
        .join("")}
    </section>
  `;
};

const renderBlogs = (items = []) => {
  if (!items.length) {
    return `
      <section class="panel-grid one-col">
        <article class="card blog-coming-soon">
          <p class="blog-eyebrow">Writing in progress</p>
          <h3>Blogs coming soon</h3>
          <p>I’ll share practical notes on platform engineering, multi-cloud strategy, infrastructure, and technical product ownership here.</p>
          <p class="visitor-counter" id="visitor-count" hidden aria-live="polite"></p>
        </article>
      </section>
    `;
  }

  return `
    <section class="panel-grid one-col">
      ${items
        .map(
          (item, index) => `
            <article class="card blog-card">
              ${item.published ? `<p class="blog-meta">${escapeHtml(item.published)}</p>` : ""}
              <h3>${escapeHtml(item.title || "Untitled post")}</h3>
              ${item.excerpt ? `<p>${escapeHtml(item.excerpt)}</p>` : ""}
              ${item.url ? `<a class="chip-link" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">Read article</a>` : ""}
              ${index === 0 ? '<p class="visitor-counter" id="visitor-count" hidden aria-live="polite"></p>' : ""}
            </article>
          `,
        )
        .join("")}
    </section>
  `;
};

const renderRecommendations = (widget = {}, items = []) => {
  const widgetMarkup = getRecommendationsWidgetMarkup(widget);

  if (widget.enabled && widgetMarkup) {
    return `
      <section class="panel-grid one-col">
        <article class="card recommendation-widget-card">
          ${widgetMarkup}
          ${widget.profileUrl ? `<div class="chip-wrap"><a class="chip-link" href="${escapeHtml(widget.profileUrl)}" target="_blank" rel="noreferrer">View on LinkedIn</a></div>` : ""}
        </article>
      </section>
    `;
  }

  if (!items.length) {
    return `<section class="panel-grid one-col"><article class="card"><p class="muted">Add recommendations to resume.json or configure a supported recommendations widget.</p></article></section>`;
  }

  return `
    <section class="panel-grid one-col">
      ${items
        .map(
          (item) => `
        <article class="card recommendation-card">
          <div class="recommendation-header">
            <div>
              <h4>${escapeHtml(item.name || "")}</h4>
              <p class="role-title">${escapeHtml(item.role || "")}</p>
            </div>
            ${item.linkedinUrl ? `<a href="${escapeHtml(item.linkedinUrl)}" target="_blank" rel="noreferrer" class="linkedin-link" title="View on LinkedIn">🔗</a>` : ""}
          </div>
          <blockquote>"${escapeHtml(item.quote || "")}"</blockquote>
          ${item.source ? `<p class="rec-source">${escapeHtml(item.source)}</p>` : ""}
        </article>
      `,
        )
        .join("")}
    </section>
  `;
};

const renderTabButton = (id, label, active = false) => `
  <button class="tab-btn${active ? " active" : ""}" data-tab="${id}" type="button" role="tab" aria-selected="${
    active ? "true" : "false"
  }" aria-controls="panel-${id}" id="tab-${id}">
    ${escapeHtml(label)}
  </button>
`;

const renderTabPanel = (id, content, active = false) => `
  <section id="panel-${id}" class="tab-panel${active ? " active" : ""}" role="tabpanel" aria-labelledby="tab-${id}">
    ${content}
  </section>
`;

const buildSectionLabels = (data = {}) => ({
  ...DEFAULT_SECTION_LABELS,
  ...(data.sectionLabels || {}),
});

const buildTabs = (data = {}) => {
  const labels = buildSectionLabels(data);
  const widgetEnabled = Boolean(data.recommendationsWidget?.enabled && data.recommendationsWidget?.widgetId);

  const definitions = [
    { id: "about", label: labels.about, isVisible: () => true, render: () => renderAbout(data) },
    {
      id: "experience",
      label: labels.experience,
      isVisible: () => Array.isArray(data.experience) && data.experience.length > 0,
      render: () => renderExperience(data.experience || []),
    },
    {
      id: "education",
      label: labels.education,
      isVisible: () => Array.isArray(data.education) && data.education.length > 0,
      render: () => renderEducation(data.education || []),
    },
    {
      id: "skills",
      label: labels.skills,
      isVisible: () => Object.keys(data.skills || {}).length > 0,
      render: () => renderSkills(data.skills || {}),
    },
    {
      id: "certifications",
      label: labels.certifications,
      isVisible: () => Array.isArray(data.certifications) && data.certifications.length > 0,
      render: () => renderCertifications(data.certifications || []),
    },
    {
      id: "recommendations",
      label: labels.recommendations,
      isVisible: () => widgetEnabled || (Array.isArray(data.recommendations) && data.recommendations.length > 0),
      render: () => renderRecommendations(data.recommendationsWidget || {}, data.recommendations || []),
    },
    {
      id: "experiments",
      label: labels.experiments,
      isVisible: () => Array.isArray(data.experiments) && data.experiments.length > 0,
      render: () => renderExperiments(data.experiments || []),
    },
    {
      id: "blogs",
      label: labels.blogs,
      isVisible: () => true,
      render: () => renderBlogs(data.blogs || []),
    },
  ];

  return definitions.filter((definition) => definition.isVisible());
};

const updateDocumentMeta = (data = {}) => {
  const name = data.basics?.name || "Interactive Resume";
  const role = data.basics?.role || "Resume";
  const title = data.meta?.title || (data.basics?.role ? `${name} | ${role}` : name);
  const description = data.meta?.description || data.summary || "Interactive resume website";

  document.title = title;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", description);
  }
};

const renderApp = (data = {}) => {
  const tabs = buildTabs(data);
  activeTabIds = tabs.map((tab) => tab.id);
  const downloadUrl = data.resumeUrl || data.pdfUrl || "";

  const tabButtons = tabs.map((tab, index) => renderTabButton(tab.id, tab.label, index === 0)).join("");
  const tabPanels = tabs.map((tab, index) => renderTabPanel(tab.id, tab.render(), index === 0)).join("");

  return `
    <article class="resume-app">
      <header class="hero">
        <div class="hero-top">
          <div class="hero-media">
            <div class="hero-photo-frame">
              <img class="hero-photo" src="${escapeHtml(data.basics?.photoUrl || "assets/images/profile/jaani.png")}" alt="Portrait of ${escapeHtml(data.basics?.name || "Jaani Francis Nickolas")}" />
            </div>
          </div>
          <div class="hero-identity">
            <h1>${escapeHtml(data.basics?.name || "Interactive Resume")}</h1>
            <p class="hero-role">${renderRole(data.basics?.role || "")}</p>
          </div>
          <div class="hero-badge-media">
            ${renderHeroBadgeCarousel(data)}
            ${downloadUrl ? `<a class="pdf-download-btn" href="${escapeHtml(downloadUrl)}" download>Download resume</a>` : ""}
          </div>
        </div>
      </header>

      <nav class="tab-nav" role="tablist" aria-label="Resume sections">
        ${tabButtons}
      </nav>

      <div class="tab-content">
        ${tabPanels}
      </div>
    </article>
  `;
};

const setActiveTab = (tabId) => {
  if (!activeTabIds.includes(tabId)) {
    return;
  }

  document.querySelectorAll(".tab-btn").forEach((button) => {
    const active = button.dataset.tab === tabId;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `panel-${tabId}`);
  });

  window.history.replaceState(null, "", `#${tabId}`);
};

const wireTabs = () => {
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveTab(button.dataset.tab || activeTabIds[0]);
    });
  });

  const initialTabId = window.location.hash.replace("#", "");
  setActiveTab(activeTabIds.includes(initialTabId) ? initialTabId : activeTabIds[0]);
};

const wireHeroCarousel = () => {
  const carousel = document.querySelector(".hero-badge-carousel");
  const slides = Array.from(carousel?.querySelectorAll(".hero-profile-slide") || []);

  if (!carousel || !slides.length) {
    return;
  }

  let activeIndex = 0;
  const showNextBadge = () => {
    slides[activeIndex].classList.remove("active");
    slides[activeIndex].setAttribute("aria-hidden", "true");
    activeIndex = (activeIndex + 1) % slides.length;
    slides[activeIndex].classList.add("active");
    slides[activeIndex].setAttribute("aria-hidden", "false");
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (slides.length > 1) {
      window.setInterval(showNextBadge, 3000);
    }
    return;
  }

  carousel.addEventListener("animationend", (event) => {
    if (event.target.classList.contains("hero-carousel-spinner") && slides.length > 1) {
      showNextBadge();
    }
  });
};

const wireVisitorCounter = () => {
  const counter = document.getElementById("visitor-count");

  if (!counter) {
    return;
  }

  const counterKey = "jaani_builds_portfolio_visits_2026";
  let shouldIncrement = true;

  try {
    shouldIncrement = sessionStorage.getItem(counterKey) !== "counted";
  } catch {
    shouldIncrement = true;
  }

  const action = shouldIncrement ? "hit" : "get";
  fetch(`https://countapi.mileshilliard.com/api/v1/${action}/${counterKey}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Visitor counter unavailable");
      }
      return response.json();
    })
    .then((result) => {
      const value = Number(result.value);
      if (!Number.isFinite(value)) {
        return;
      }

      if (shouldIncrement) {
        try {
          sessionStorage.setItem(counterKey, "counted");
        } catch {
          // Counting still works when browser storage is unavailable.
        }
      }

      counter.textContent = value.toLocaleString();
      counter.hidden = false;
    })
    .catch(() => {
      counter.hidden = true;
    });
};

const wireRoleAccordions = () => {
  const toggleRoleContent = (button, content, icon) => {
    const isOpen = !content.hasAttribute("hidden");

    if (isOpen) {
      content.setAttribute("hidden", "");
    } else {
      content.removeAttribute("hidden");
    }

    button.classList.toggle("open", !isOpen);
    button.setAttribute("aria-expanded", isOpen ? "false" : "true");
    icon.textContent = isOpen ? "▼" : "▲";
  };

  document.querySelectorAll(".role-header").forEach((button) => {
    button.addEventListener("click", () => {
      const content = button.closest(".role-item")?.querySelector(".role-content");
      const icon = button.querySelector(".expand-icon");

      if (!content || !icon) {
        return;
      }

      toggleRoleContent(button, content, icon);
    });
  });
};

const showError = () => {
  app.innerHTML = '<p class="loading">Could not load data/resume.json. Check the JSON file and asset paths.</p>';
};

fetch("./data/resume.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load resume data.");
    }

    return response.json();
  })
  .then((data) => {
    updateDocumentMeta(data);
    app.innerHTML = renderApp(data);
    wireTabs();
    wireHeroCarousel();
    wireVisitorCounter();
    wireRoleAccordions();
    wireRecommendationsWidget(data.recommendationsWidget || {});
  })
  .catch(showError);
