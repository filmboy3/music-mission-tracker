function safeLink(link) {
  return typeof link === "string" && /^https:\/\//.test(link) ? link : "";
}

function safeArtwork(path) {
  return typeof path === "string" && /^(?!.*\.\.)[a-zA-Z0-9/_-]+\.(?:jpg|jpeg|png|webp)$/.test(path)
    ? path
    : "";
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

function render(data, stats) {
  document.querySelectorAll("[data-artist-name]").forEach((node) => {
    node.textContent = data.artist.name;
  });
  document.title = `${data.artist.name} — The Music Gives Back`;

  document.querySelectorAll("[data-link]").forEach((node) => {
    const url = safeLink(data.links[node.dataset.link]);
    if (url) {
      node.href = url;
      node.target = "_blank";
      node.rel = "noopener noreferrer";
    } else {
      node.setAttribute("aria-disabled", "true");
      node.title = "Link coming soon";
    }
  });

  const percent = Math.min(100, Math.max(0, Number(data.goal.progressPercent || 0)));
  setText("#goal-percent", `${percent}%`);
  setText("#partner-count", data.missionGoals.length);
  setText("#album-count", data.albums.length);
  setText("#goal-copy", data.goal.message);
  const goalBar = document.querySelector("#goal-bar");
  if (goalBar) goalBar.style.width = `${percent}%`;
  const progressTrack = document.querySelector(".progress-track");
  if (progressTrack) progressTrack.setAttribute("aria-valuenow", percent);
  if (data.lastUpdated) {
    setText("#last-updated", `Last updated ${data.lastUpdated}`);
  }

  const monthlyListeners = Number(stats?.spotify?.monthlyListeners || 0);
  const monthlyListenerTarget = Number(data.audienceGoal?.monthlyListeners || 50000);
  if (monthlyListeners && monthlyListenerTarget) {
    const audiencePercent = Math.min(100, Math.round((monthlyListeners / monthlyListenerTarget) * 100));
    setText("#monthly-listeners", new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(monthlyListeners));
    setText("#monthly-listeners-exact", monthlyListeners.toLocaleString("en-US"));
    setText("#monthly-listener-target", monthlyListenerTarget.toLocaleString("en-US"));
    setText("#monthly-target-copy", new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(monthlyListenerTarget));
    setText("#audience-percent", `${audiencePercent}% to the next milestone`);
    const audienceBar = document.querySelector("#audience-bar");
    if (audienceBar) audienceBar.style.width = `${audiencePercent}%`;
    const audienceProgress = document.querySelector("#audience-progress");
    if (audienceProgress) {
      audienceProgress.setAttribute("aria-valuemax", monthlyListenerTarget);
      audienceProgress.setAttribute("aria-valuenow", monthlyListeners);
    }
  }
  const statsSource = safeLink(stats?.spotify?.source);
  const statsSourceLink = document.querySelector("#spotify-stats-source");
  if (statsSource && statsSourceLink) statsSourceLink.href = statsSource;

  const albumGrid = document.querySelector("#album-grid");
  data.albums.forEach((album) => {
    const spotify = safeLink(album.spotify);
    const appleMusic = safeLink(album.appleMusic);
    const artwork = safeArtwork(album.artwork);
    const card = document.createElement("article");
    card.className = "album-card";
    card.innerHTML = `
      ${artwork ? `<img class="album-artwork" src="${artwork}" alt="${album.title} album cover" loading="lazy" width="1200" height="1200">` : ""}
      <div class="album-platforms" aria-label="Listen to ${album.title}">
        ${spotify ? `<a class="platform-link spotify-link" href="${spotify}" target="_blank" rel="noopener noreferrer" aria-label="Save ${album.title} on Spotify"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M7 9.2c3.5-1 7.6-.7 10.5.9M7.8 12.2c2.9-.8 6.3-.5 8.8.8M8.6 15.1c2.2-.6 4.8-.3 6.8.7"/></svg><span>Spotify</span></a>` : ""}
        ${appleMusic ? `<a class="platform-link apple-link" href="${appleMusic}" target="_blank" rel="noopener noreferrer" aria-label="Save ${album.title} on Apple Music"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M15.8 7.2v8.1a2.2 2.2 0 1 1-1-1.8V9.4l-5 1.1v5.8a2.2 2.2 0 1 1-1-1.8V9.1z"/></svg><span>Apple Music</span></a>` : ""}
      </div>`;
    if (albumGrid) albumGrid.append(card);
  });

  const missionGoalGrid = document.querySelector("#mission-goal-grid");
  data.missionGoals.forEach((item) => {
    const current = Number(item.current || 0);
    const target = Number(item.target || 0);
    const itemPercent = target ? Math.min(100, Math.round((current / target) * 100)) : 0;
    const partnerUrl = safeLink(item.partnerUrl);
    const logo = safeArtwork(item.logo);
    const card = document.createElement("article");
    card.className = "mission-goal-card";
    card.innerHTML = `
      <div class="mission-goal-logo-wrap">
        ${logo ? `<img class="mission-goal-logo" src="${logo}" alt="${item.partner} logo" loading="lazy">` : ""}
      </div>
      <h3>${item.title}</h3>
      <p class="mission-goal-count"><strong>${current.toLocaleString()}</strong><span>${item.unit}</span></p>
      <p class="mission-goal-description">${item.description}</p>
      <div class="mission-subprogress-label"><span>${current.toLocaleString()} / ${target.toLocaleString()} ${item.unit}</span><strong>${itemPercent}%</strong></div>
      <div class="mission-subprogress" role="progressbar" aria-label="${item.title}: ${current} of ${target} ${item.unit}" aria-valuemin="0" aria-valuemax="${target}" aria-valuenow="${current}"><span style="width:${itemPercent}%"></span></div>
      <div class="mission-goal-meta">
        <span>Confirmed ${item.date}</span>
        ${partnerUrl ? `<a href="${partnerUrl}" target="_blank" rel="noopener noreferrer">${item.partner} ↗</a>` : ""}
      </div>`;
    if (missionGoalGrid) missionGoalGrid.append(card);
  });

  const social = document.querySelector("#social-links");
  Object.entries(data.links).forEach(([label, link]) => {
    const url = safeLink(link);
    if (!url || label === "playlist") return;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = label.replace(/(^|_)(\w)/g, (_, __, letter) => ` ${letter.toUpperCase()}`).trim();
    if (social) social.append(anchor);
  });
}

Promise.all([
  fetch("data.json", { cache: "no-store" }).then((response) => {
    if (!response.ok) throw new Error("Could not load impact data");
    return response.json();
  }),
  fetch("stats.json", { cache: "no-store" }).then((response) => response.ok ? response.json() : {}),
])
  .then(([data, stats]) => render(data, stats))
  .catch((error) => console.error(error));
