/**
 * StudyRoom Live - Interactive GitHub Pages Showcase Engine
 * Demonstrates real-time CRDT replication, relative position comment anchoring,
 * SHA-256 snapshot deduplication, and university workspace workflows.
 */

// --- State Management ---
const AppState = {
  theme: localStorage.getItem('studyroom-theme') || 'dark',
  simLatency: 120, // ms
  crdtClock: { amina: 8, brian: 6 },
  docAContent: "Distributed Systems (APT3040) — Final Assignment Draft\n\nStudyRoom Live implements commutative replicated data types to ensure zero merge conflicts during group sessions.",
  docBContent: "Distributed Systems (APT3040) — Final Assignment Draft\n\nStudyRoom Live implements commutative replicated data types to ensure zero merge conflicts during group sessions.",
  
  // Comment Anchor Demo State
  anchorInitialPrefix: "Under Byzantine fault tolerant models, ",
  anchorTargetPhrase: "leader election, log replication, and state safety",
  anchorSuffix: " must remain invariant under network partitioning.",
  anchorPrependCount: 0,
  
  // Snapshots State
  snapshots: [
    { id: 'snap-1', name: 'v0.1 Initial Scaffold', text: 'Distributed consensus algorithms assignment scaffold.', hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0', time: '10:00 AM', status: 'saved' },
    { id: 'snap-2', name: 'v0.2 Section 1 Added', text: 'Distributed consensus algorithms assignment scaffold. Section 1: Raft vs Paxos comparison.', hash: '8f9e0d1c2b3a4567890abcdef1234567890abcdef1234567890abcdef1234567', time: '10:30 AM', status: 'saved' },
    { id: 'snap-3', name: 'v0.2.1 30s Heartbeat', text: 'Distributed consensus algorithms assignment scaffold. Section 1: Raft vs Paxos comparison.', hash: '8f9e0d1c2b3a4567890abcdef1234567890abcdef1234567890abcdef1234567', time: '10:30:30 AM', status: 'skipped' }
  ],
  activeSnapshotIndex: 1,

  // University Presets
  universities: {
    usiu: {
      name: "United States International University - Africa",
      short: "USIU-Africa",
      course: "APT3040: Distributed Systems & Cloud Infrastructure",
      docTitle: "Assignment 2: Raft Consensus & Byzantine Fault Tolerance",
      student: { name: "Amina Odhiambo", color: "#6366f1", badge: "USIU Lead Author" },
      partner: { name: "Brian Kiprop", uni: "Univ. of Nairobi", color: "#06b6d4" },
      rubric: [
        { label: "Formal proof of state machine commutativity", done: true },
        { label: "CRDT Y.XmlFragment TipTap 2 integration", done: true },
        { label: "SHA-256 snapshot deduplication benchmark", done: true },
        { label: "50ms throttled remote cursor awareness", done: true }
      ]
    },
    uon: {
      name: "University of Nairobi",
      short: "Univ. of Nairobi",
      course: "CSC411: Distributed Operating Systems",
      docTitle: "Lab 4: Multi-Leader Replication & Vector Clocks",
      student: { name: "Brian Kiprop", color: "#06b6d4", badge: "UoN Systems Eng" },
      partner: { name: "Faith Wanjiku", uni: "Strathmore Univ.", color: "#10b981" },
      rubric: [
        { label: "Lamport timestamp & causality verification", done: true },
        { label: "Socket.io room guard (20 concurrent seats)", done: true },
        { label: "y-indexeddb offline cache recovery tests", done: true },
        { label: "Redis pub/sub multi-server load test", done: false }
      ]
    },
    strathmore: {
      name: "Strathmore University",
      short: "Strathmore Univ.",
      course: "BBIT302: Enterprise Architecture & Cloud ERP",
      docTitle: "Capstone: Zero-Trust Multi-Tenant Cloud Architecture",
      student: { name: "Faith Wanjiku", color: "#10b981", badge: "Strathmore Tech Lead" },
      partner: { name: "Amina Odhiambo", uni: "USIU-Africa", color: "#6366f1" },
      rubric: [
        { label: "Drift-free mathematical relative position comments", done: true },
        { label: "Word-level LCS visual diffing modal", done: true },
        { label: "Prisma ORM schema migrations & PostgreSQL 16", done: true },
        { label: "NextAuth role-based assignment permissions", done: true }
      ]
    }
  }
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initDualClientSim();
  initAnchorPlayground();
  initSnapshotEngine();
  initUniversityTabs();
  initTopologyModal();
  initLightbox();
});

// --- Theme Management ---
function initTheme() {
  document.documentElement.setAttribute('data-theme', AppState.theme);
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    updateThemeButtonIcon(themeBtn, AppState.theme);
    themeBtn.addEventListener('click', () => {
      AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', AppState.theme);
      localStorage.setItem('studyroom-theme', AppState.theme);
      updateThemeButtonIcon(themeBtn, AppState.theme);
      showToast(`Switched to ${AppState.theme} mode`);
    });
  }
}

function updateThemeButtonIcon(btn, theme) {
  btn.innerHTML = theme === 'dark' 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

// --- Module 1: Dual Client Real-Time CRDT Simulator ---
function initDualClientSim() {
  const textareaA = document.getElementById('textarea-client-a');
  const textareaB = document.getElementById('textarea-client-b');
  const latencySlider = document.getElementById('latency-slider');
  const latencyVal = document.getElementById('latency-val');
  const crdtFeed = document.getElementById('crdt-feed-list');

  if (!textareaA || !textareaB) return;

  textareaA.value = AppState.docAContent;
  textareaB.value = AppState.docBContent;

  if (latencySlider && latencyVal) {
    latencySlider.value = AppState.simLatency;
    latencyVal.textContent = `${AppState.simLatency}ms`;
    latencySlider.addEventListener('input', (e) => {
      AppState.simLatency = parseInt(e.target.value, 10);
      latencyVal.textContent = `${AppState.simLatency}ms`;
    });
  }

  // Handle typing from Amina
  let syncTimeoutA = null;
  textareaA.addEventListener('input', () => {
    AppState.crdtClock.amina++;
    const updateSize = Math.floor(Math.random() * 24) + 32;
    logCrdtEvent(`[Amina • USIU] Y.Update clock=${AppState.crdtClock.amina} (+${updateSize} bytes)`);

    clearTimeout(syncTimeoutA);
    syncTimeoutA = setTimeout(() => {
      textareaB.value = textareaA.value;
      AppState.docBContent = textareaA.value;
      logCrdtEvent(`[Y.Doc Sync] Applied update to Brian's replica (clock: ${AppState.crdtClock.amina})`, true);
      flashSyncIndicator('caret-b-from-a');
    }, AppState.simLatency);
  });

  // Handle typing from Brian
  let syncTimeoutB = null;
  textareaB.addEventListener('input', () => {
    AppState.crdtClock.brian++;
    const updateSize = Math.floor(Math.random() * 24) + 32;
    logCrdtEvent(`[Brian • UoN] Y.Update clock=${AppState.crdtClock.brian} (+${updateSize} bytes)`);

    clearTimeout(syncTimeoutB);
    syncTimeoutB = setTimeout(() => {
      textareaA.value = textareaB.value;
      AppState.docAContent = textareaB.value;
      logCrdtEvent(`[Y.Doc Sync] Applied update to Amina's replica (clock: ${AppState.crdtClock.brian})`, true);
      flashSyncIndicator('caret-a-from-b');
    }, AppState.simLatency);
  });

  // Quick Action Buttons
  const btnAction1 = document.getElementById('sim-action-1');
  const btnAction2 = document.getElementById('sim-action-2');
  const btnAction3 = document.getElementById('sim-action-reset');

  if (btnAction1) {
    btnAction1.addEventListener('click', () => {
      const insertion = "\n\n[Amina]: Under high network partitioning, CAP theorem mandates CP or AP tradeoffs.";
      textareaA.value += insertion;
      textareaA.dispatchEvent(new Event('input'));
      showToast("Amina inserted paragraph from USIU");
    });
  }

  if (btnAction2) {
    btnAction2.addEventListener('click', () => {
      const insertion = "\n\n[Brian]: Verified Raft election timeout interval must be randomized (150-300ms).";
      textareaB.value += insertion;
      textareaB.dispatchEvent(new Event('input'));
      showToast("Brian inserted verification note from UoN");
    });
  }

  if (btnAction3) {
    btnAction3.addEventListener('click', () => {
      const base = "Distributed Systems (APT3040) — Final Assignment Draft\n\nStudyRoom Live implements commutative replicated data types to ensure zero merge conflicts during group sessions.";
      textareaA.value = base;
      textareaB.value = base;
      textareaA.dispatchEvent(new Event('input'));
      showToast("Document reset to baseline");
    });
  }
}

function logCrdtEvent(message, isSync = false) {
  const feed = document.getElementById('crdt-feed-list');
  if (!feed) return;
  const entry = document.createElement('div');
  entry.className = `crdt-log-entry ${isSync ? 'sync' : ''}`;
  const time = new Date().toLocaleTimeString();
  entry.textContent = `[${time}] ${message}`;
  feed.prepend(entry);

  while (feed.children.length > 25) {
    feed.removeChild(feed.lastChild);
  }
}

function flashSyncIndicator(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.style.backgroundColor = 'rgba(16, 185, 129, 0.3)';
    setTimeout(() => {
      el.style.backgroundColor = 'rgba(148, 163, 184, 0.08)';
    }, 400);
  }
}

// --- Module 2: Comment Anchoring Playground ---
function initAnchorPlayground() {
  renderAnchorPreviews();

  const btnPrepend = document.getElementById('anchor-btn-prepend');
  const btnDelete = document.getElementById('anchor-btn-delete');
  const btnReset = document.getElementById('anchor-btn-reset');

  if (btnPrepend) {
    btnPrepend.addEventListener('click', () => {
      AppState.anchorPrependCount++;
      AppState.anchorInitialPrefix = `[Edit #${AppState.anchorPrependCount} added by collaborator] ` + AppState.anchorInitialPrefix;
      renderAnchorPreviews();
      showToast("Collaborator inserted text before the comment anchor");
    });
  }

  if (btnDelete) {
    btnDelete.addEventListener('click', () => {
      if (AppState.anchorInitialPrefix.length > 10) {
        AppState.anchorInitialPrefix = AppState.anchorInitialPrefix.slice(15);
      } else {
        AppState.anchorInitialPrefix = "Under Byzantine models, ";
      }
      renderAnchorPreviews();
      showToast("Deleted text before anchor");
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      AppState.anchorPrependCount = 0;
      AppState.anchorInitialPrefix = "Under Byzantine fault tolerant models, ";
      renderAnchorPreviews();
      showToast("Anchor playground reset to baseline");
    });
  }
}

function renderAnchorPreviews() {
  const classicDoc = document.getElementById('classic-doc-preview');
  const relativeDoc = document.getElementById('relative-doc-preview');
  const classicMath = document.getElementById('classic-math-preview');
  const relativeMath = document.getElementById('relative-math-preview');

  if (!classicDoc || !relativeDoc) return;

  const fullText = AppState.anchorInitialPrefix + AppState.anchorTargetPhrase + AppState.anchorSuffix;
  
  // 1. Classic Index Anchoring (Hardcoded fixed index 37 to 86)
  const initialAnchorStart = 37;
  const initialAnchorLength = 49;
  
  const classicStart = Math.min(initialAnchorStart, fullText.length);
  const classicEnd = Math.min(classicStart + initialAnchorLength, fullText.length);
  
  const beforeClassic = escapeHtml(fullText.slice(0, classicStart));
  const selectedClassic = escapeHtml(fullText.slice(classicStart, classicEnd));
  const afterClassic = escapeHtml(fullText.slice(classicEnd));

  const isDrifted = AppState.anchorPrependCount > 0;

  classicDoc.innerHTML = `${beforeClassic}<span class="highlight-comment ${isDrifted ? 'drifted' : ''}" title="Anchor Drift Detected! Highlight detached from target phrase">${selectedClassic}</span>${afterClassic}`;
  
  if (classicMath) {
    classicMath.innerHTML = `Fixed Stored Indices: <code>[${initialAnchorStart}, ${initialAnchorStart + initialAnchorLength}]</code><br/>Current Text at Stored Indices: <strong style="color: ${isDrifted ? 'var(--accent-rose)' : 'var(--accent-amber)'}">"${escapeHtml(selectedClassic.slice(0, 32))}..."</strong><br/>Status: <strong>${isDrifted ? '⚠️ ANCHOR DRIFT (Target Misaligned)' : '✅ Intact'}</strong>`;
  }

  // 2. StudyRoom Live Yjs Relative Position
  const beforeRel = escapeHtml(AppState.anchorInitialPrefix);
  const targetRel = escapeHtml(AppState.anchorTargetPhrase);
  const afterRel = escapeHtml(AppState.anchorSuffix);

  relativeDoc.innerHTML = `${beforeRel}<span class="highlight-comment" title="Y.RelativePosition cleanly resolved to exact phrase">${targetRel}</span>${afterRel}`;

  const resolvedOffset = AppState.anchorInitialPrefix.length;
  if (relativeMath) {
    relativeMath.innerHTML = `CRDT Anchor: <code>Y.RelativePosition(TypeID="prosemirror", ItemClock=142, Offset=0)</code><br/>Dynamic Resolved Index: <code>[${resolvedOffset}, ${resolvedOffset + AppState.anchorTargetPhrase.length}]</code><br/>Status: <strong style="color: var(--accent-emerald)">🔒 100% LOCK-ON (Drift-Free Mathematical Anchor)</strong>`;
  }
}

// --- Module 3: Snapshot Deduplication & Diff ---
async function computeSha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function initSnapshotEngine() {
  renderSnapshotTimeline();

  const btnTrigger = document.getElementById('trigger-snapshot-btn');
  const btnModify = document.getElementById('modify-snapshot-text-btn');
  const liveInput = document.getElementById('snapshot-live-input');

  if (liveInput) {
    liveInput.value = AppState.snapshots[AppState.snapshots.length - 1].text;
  }

  if (btnTrigger && liveInput) {
    btnTrigger.addEventListener('click', async () => {
      const currentText = liveInput.value;
      const currentHash = await computeSha256(currentText);
      const lastSnapshot = AppState.snapshots[AppState.snapshots.length - 1];

      const now = new Date().toLocaleTimeString();

      if (lastSnapshot && lastSnapshot.hash === currentHash) {
        // Duplicate snapshot! Deduplicate and skip DB write
        const skippedNode = {
          id: `snap-${AppState.snapshots.length + 1}`,
          name: `Autosave (${now})`,
          text: currentText,
          hash: currentHash,
          time: now,
          status: 'skipped'
        };
        AppState.snapshots.push(skippedNode);
        AppState.activeSnapshotIndex = AppState.snapshots.length - 1;
        renderSnapshotTimeline();
        showToast("⚡ SHA-256 Matched: Redundant DB write skipped!");
      } else {
        // Modified snapshot: commit new version
        const newSnap = {
          id: `snap-${AppState.snapshots.length + 1}`,
          name: `Milestone (${now})`,
          text: currentText,
          hash: currentHash,
          time: now,
          status: 'saved'
        };
        AppState.snapshots.push(newSnap);
        AppState.activeSnapshotIndex = AppState.snapshots.length - 1;
        renderSnapshotTimeline();
        showToast("💾 New snapshot committed to PostgreSQL!");
      }
    });
  }

  if (btnModify && liveInput) {
    btnModify.addEventListener('click', () => {
      liveInput.value += ` Section ${AppState.snapshots.length}: Analysis of Byzantine Paxos invariants under high concurrency.`;
      showToast("Modified live document state. Click 'Trigger 30s Autosave' to test deduplication.");
    });
  }
}

function renderSnapshotTimeline() {
  const track = document.getElementById('snapshot-timeline-track');
  const diffCard = document.getElementById('snapshot-diff-output');
  if (!track) return;

  track.innerHTML = '';

  AppState.snapshots.forEach((snap, idx) => {
    const node = document.createElement('div');
    node.className = `timeline-node ${idx === AppState.activeSnapshotIndex ? 'active' : ''} ${snap.status === 'skipped' ? 'skipped' : ''}`;
    node.innerHTML = `
      <div class="node-circle">${idx + 1}</div>
      <div class="node-label">${snap.name}</div>
      <div class="node-hash">${snap.hash.slice(0, 10)}...</div>
    `;

    node.addEventListener('click', () => {
      AppState.activeSnapshotIndex = idx;
      renderSnapshotTimeline();
    });

    track.appendChild(node);
  });

  // Render Diff Output
  if (diffCard && AppState.snapshots.length > 0) {
    const active = AppState.snapshots[AppState.activeSnapshotIndex];
    const prev = AppState.activeSnapshotIndex > 0 ? AppState.snapshots[AppState.activeSnapshotIndex - 1] : null;

    if (!prev) {
      diffCard.innerHTML = `<div class="diff-content"><strong>${escapeHtml(active.name)}</strong> (Initial Base Snapshot)<br/><br/><code>${escapeHtml(active.text)}</code></div>`;
    } else if (active.status === 'skipped') {
      diffCard.innerHTML = `<div class="diff-content" style="border-left: 3px solid var(--accent-amber);"><strong style="color: var(--accent-amber);">⚡ IDENTICAL SHA-256 HASH [${active.hash.slice(0, 16)}...]</strong><br/>No textual or CRDT mutation since previous checkpoint. PostgreSQL write successfully bypassed by <code>saveDocumentSnapshot</code> persistence engine.</div>`;
    } else {
      const diffHtml = computeWordDiffHtml(prev.text, active.text);
      diffCard.innerHTML = `
        <div class="diff-legend">
          <span>Comparing <strong>${escapeHtml(prev.name)}</strong> → <strong>${escapeHtml(active.name)}</strong></span>
          <span class="diff-chip-add">+ Additions</span>
          <span class="diff-chip-del">- Deletions</span>
        </div>
        <div class="diff-content">${diffHtml}</div>
      `;
    }
  }
}

function computeWordDiffHtml(oldText, newText) {
  const oldWords = oldText.split(/\s+/);
  const newWords = newText.split(/\s+/);

  // Simplified word-level visual diff
  const oldSet = new Set(oldWords);
  const newSet = new Set(newWords);

  const parts = [];

  oldWords.forEach(w => {
    if (!newSet.has(w)) {
      parts.push(`<span class="diff-del">${escapeHtml(w)}</span>`);
    }
  });

  newWords.forEach(w => {
    if (oldSet.has(w)) {
      parts.push(`<span>${escapeHtml(w)}</span>`);
    } else {
      parts.push(`<span class="diff-add">${escapeHtml(w)}</span>`);
    }
  });

  return parts.join(' ');
}

// --- Module 4: University Workspaces ---
function initUniversityTabs() {
  const tabs = document.querySelectorAll('.tab-btn[data-uni]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const uniKey = tab.getAttribute('data-uni');
      renderUniversityWorkspace(uniKey);
    });
  });

  renderUniversityWorkspace('usiu');
}

function renderUniversityWorkspace(key) {
  const data = AppState.universities[key];
  if (!data) return;

  const courseEl = document.getElementById('uni-course-title');
  const docEl = document.getElementById('uni-doc-title');
  const studentEl = document.getElementById('uni-student-name');
  const uniNameEl = document.getElementById('uni-full-name');
  const rubricList = document.getElementById('uni-rubric-list');

  if (courseEl) courseEl.textContent = data.course;
  if (docEl) docEl.textContent = data.docTitle;
  if (studentEl) studentEl.textContent = `${data.student.name} (${data.student.badge})`;
  if (uniNameEl) uniNameEl.textContent = data.name;

  if (rubricList) {
    rubricList.innerHTML = data.rubric.map(item => `
      <li class="rubric-item">
        <span class="rubric-check">${item.done ? '✅' : '⏳'}</span>
        <span>${escapeHtml(item.label)}</span>
      </li>
    `).join('');
  }
}

// --- Module 5: Architecture Topology Modal ---
function initTopologyModal() {
  const nodes = document.querySelectorAll('.topology-node');
  nodes.forEach(node => {
    node.addEventListener('click', () => {
      const title = node.querySelector('.topology-title')?.textContent || 'Node Details';
      const desc = node.querySelector('.topology-desc')?.textContent || '';
      const meta = node.querySelector('.topology-meta')?.textContent || '';
      showToast(`Selected Node: ${title.trim()} (${meta.trim()})`);
    });
  });
}

// --- Module 6: Screenshot Lightbox ---
function initLightbox() {
  const imgWrap = document.querySelector('.preview-image-wrap');
  const modal = document.getElementById('lightbox-modal');
  const closeBtn = document.getElementById('lightbox-close');

  if (imgWrap && modal) {
    imgWrap.addEventListener('click', () => {
      modal.classList.add('active');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
}

// --- Utilities ---
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
    <span>${escapeHtml(message)}</span>
  `;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

function copyCode(btn, codeText) {
  navigator.clipboard.writeText(codeText).then(() => {
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    showToast(`Copied to clipboard: ${codeText.slice(0, 30)}...`);
    setTimeout(() => {
      btn.textContent = orig;
    }, 2000);
  }).catch(() => {
    showToast('Failed to copy to clipboard');
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
