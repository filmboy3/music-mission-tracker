const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function safeLink(link) {
  return typeof link === "string" && /^https:\/\//.test(link) ? link : "";
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
  document.querySelector("#partner-count").textContent = data.partners.length || "—";
  document.querySelector("#album-count").textContent = data.albums.length;
  document.querySelector("#goal-copy").textContent = data.goal.message;
  if (data.lastUpdated) {
    document.querySelector("#last-updated").textContent = `Last updated ${data.lastUpdated}`;
  }

  const albumGrid = document.querySelector("#album-grid");
  data.albums.forEach((album, index) => {
    const url = safeLink(album.url);
    const card = document.createElement(url ? "a" : "article");
    card.className = "album-card";
    card.style.setProperty("--album-color", album.color);
    if (url) {
      card.href = url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
    }
    card.innerHTML = `
      <span class="album-number">ALBUM ${String(index + 1).padStart(2, "0")}</span>
      <div class="album-info"><strong>${album.title}</strong><span>${album.year || "Listen soon"}</span></div>`;
    albumGrid.append(card);
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
