const app = document.getElementById("app");

const DEFAULT_SECTION_LABELS = {
  about: "About me",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  experiments: "Experiments",
  recommendations: "Recommendations",
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
          icon: "💼",
          title: "LinkedIn",
          value: "Professional Profile",
          url: basics.linkedin,
        }
      : null,
    basics.github
      ? {
          icon: "🐙",
          title: "GitHub",
          value: "Code & Projects",
          url: basics.github,
        }
      : null,
    basics.email
      ? {
          icon: "✉️",
          title: "Email",
          value: basics.email,
          url: `mailto:${basics.email}`,
        }
      : null,
    basics.phone
      ? {
          icon: "📱",
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
          <div class="contact-icon">${item.icon}</div>
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

const renderCertifications = (items = []) => {
  if (!items.length) {
    return `<section class="panel-grid one-col"><article class="card"><p class="muted">No certifications added yet.</p></article></section>`;
  }

  return `
    <section class="panel-grid one-col">
      ${items
        .map(
          (item) => `
        <article class="card cert-card">
          <p class="cert-badge">✓</p>
          <p><strong>${escapeHtml(item)}</strong></p>
        </article>
      `,
        )
        .join("")}
    </section>
  `;
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

  const tabButtons = tabs.map((tab, index) => renderTabButton(tab.id, tab.label, index === 0)).join("");
  const tabPanels = tabs.map((tab, index) => renderTabPanel(tab.id, tab.render(), index === 0)).join("");

  return `
    <article class="resume-app">
      <header class="hero">
        <div class="hero-top">
          <div class="hero-identity">
            <h1>${escapeHtml(data.basics?.name || "Interactive Resume")}</h1>
            <p class="hero-role">${escapeHtml(data.basics?.role || "")}</p>
          </div>
          ${data.pdfUrl ? `<a class="pdf-download-btn" href="${escapeHtml(data.pdfUrl)}" download><span>Download</span><span>PDF</span></a>` : ""}
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
    wireRoleAccordions();
    wireRecommendationsWidget(data.recommendationsWidget || {});
  })
  .catch(showError);
