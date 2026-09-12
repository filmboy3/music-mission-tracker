const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function safeLink(link) {
  return typeof link === "string" && /^https:\/\//.test(link) ? link : "";
}

function safeArtwork(path) {
  return typeof path === "string" && /^(?!.*\.\.)[a-zA-Z0-9/_-]+\.(?:jpg|jpeg|png|webp)$/.test(path)
    ? path
    : "";
}

function render(data) {
  document.querySelectorAll("[data-artist-name]").forEach((node) => {
    node.textContent = data.artist.name;
  });
  document.title = `${data.artist.name} — The Music Gives Back`;

  document.querySelectorAll('[data-link="playlist"]').forEach((node) => {
    const url = safeLink(data.links.playlist);
    if (url) {
      node.href = url;
      node.target = "_blank";
      node.rel = "noopener noreferrer";
    } else {
      node.setAttribute("aria-disabled", "true");
      node.title = "Playlist link coming soon";
    }
  });

  const total = data.donations.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const goal = Number(data.goal.amount || 0);
  const percent = goal ? Math.min(100, Math.round((total / goal) * 100)) : 0;
  document.querySelector("#total-donated").textContent = money.format(total);
  document.querySelector("#goal-current").textContent = money.format(total);
  document.querySelector("#goal-target").textContent = money.format(goal);
  document.querySelector("#goal-percent").textContent = `${percent}%`;
  document.querySelector("#goal-bar").style.width = `${percent}%`;
  document.querySelector(".progress-track").setAttribute("aria-valuenow", percent);
  document.querySelector("#donation-count").textContent = data.donations.length;
  document.querySelector("#partner-count").textContent = data.missionGoals.length;
  document.querySelector("#album-count").textContent = data.albums.length;
  document.querySelector("#goal-copy").textContent = data.goal.message;
  if (data.lastUpdated) {
    document.querySelector("#last-updated").textContent = `Last updated ${data.lastUpdated}`;
  }

  const albumGrid = document.querySelector("#album-grid");
  data.albums.forEach((album, index) => {
    const spotify = safeLink(album.spotify);
    const appleMusic = safeLink(album.appleMusic);
    const artwork = safeArtwork(album.artwork);
    const card = document.createElement("article");
    card.className = "album-card";
    card.innerHTML = `
      ${artwork ? `<img class="album-artwork" src="${artwork}" alt="${album.title} album cover" loading="lazy" width="1200" height="1200">` : ""}
      <div class="album-platforms" aria-label="Listen to ${album.title}">
        ${spotify ? `<a class="platform-link spotify-link" href="${spotify}" target="_blank" rel="noopener noreferrer" aria-label="Listen to ${album.title} on Spotify" title="Spotify"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M7 9.2c3.5-1 7.6-.7 10.5.9M7.8 12.2c2.9-.8 6.3-.5 8.8.8M8.6 15.1c2.2-.6 4.8-.3 6.8.7"/></svg></a>` : ""}
        ${appleMusic ? `<a class="platform-link apple-link" href="${appleMusic}" target="_blank" rel="noopener noreferrer" aria-label="Listen to ${album.title} on Apple Music" title="Apple Music"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M15.8 7.2v8.1a2.2 2.2 0 1 1-1-1.8V9.4l-5 1.1v5.8a2.2 2.2 0 1 1-1-1.8V9.1z"/></svg></a>` : ""}
      </div>`;
    albumGrid.append(card);
  });

  const missionGoalGrid = document.querySelector("#mission-goal-grid");
  data.missionGoals.forEach((item) => {
    const current = Number(item.current || 0);
    const target = Number(item.target || 0);
    const itemPercent = target ? Math.min(100, Math.round((current / target) * 100)) : 0;
    const card = document.createElement("article");
    card.className = "mission-goal-card";
    card.innerHTML = `
      <div class="mission-goal-top"><span class="mission-goal-icon" aria-hidden="true">${item.icon}</span><span class="funding-label">$1,000 goal</span></div>
      <h3>${item.title}</h3>
      <p class="mission-goal-count"><strong>${current.toLocaleString()}</strong> / ${target.toLocaleString()} ${item.unit}</p>
      <div class="mission-progress" role="progressbar" aria-label="${item.title} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${itemPercent}"><span style="width:${itemPercent}%"></span></div>
      <p class="mission-goal-description">${item.description}</p>`;
    missionGoalGrid.append(card);
  });

  const body = document.querySelector("#ledger-body");
  const empty = document.querySelector("#ledger-empty");
  if (data.donations.length) {
    empty.hidden = true;
    data.donations.forEach((entry) => {
      const proof = safeLink(entry.proof);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.date}</td><td>${entry.recipient}</td><td>${entry.period}</td>
        <td>${money.format(entry.amount)}</td>
        <td>${proof ? `<a href="${proof}" target="_blank" rel="noopener noreferrer">View ↗</a>` : "—"}</td>`;
      body.append(row);
    });
  } else {
    document.querySelector("table").hidden = true;
  }

  const social = document.querySelector("#social-links");
  Object.entries(data.links).forEach(([label, link]) => {
    const url = safeLink(link);
    if (!url || label === "playlist") return;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = label.replace(/(^|_)(\w)/g, (_, __, letter) => ` ${letter.toUpperCase()}`).trim();
    social.append(anchor);
  });
}

fetch("data.json")
  .then((response) => {
    if (!response.ok) throw new Error("Could not load impact data");
    return response.json();
  })
  .then(render)
  .catch((error) => console.error(error));
