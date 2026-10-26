import { profile, projects, notes } from './content.js';

const panel = document.querySelector('#panel');
const content = document.querySelector('#panel-content');
let opener;
const arrow = '<span aria-hidden="true">↗</span>';
const safe = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function projectCard(p, compact = false) {
  return `<button class="project-card ${compact ? 'compact' : ''}" data-project="${p.id}"><div class="project-image"><img src="${p.image}" alt="${safe(p.title)}视觉练习" loading="lazy" width="840" height="680"><span class="project-go" aria-hidden="true">↗</span></div><div class="project-meta"><span>${p.categoryName}</span><span>${p.year}</span></div><h3>${p.title}<small>${p.english}</small></h3></button>`;
}
const grid = document.querySelector('#work-grid');
function filterProjects(filter = 'all') {
  const list = projects.filter(p => filter === 'all' || p.category === filter);
  grid.innerHTML = list.map(p => projectCard(p)).join('');
  document.querySelector('#filter-count').textContent = `${list.length} 个探索`;
  document.querySelectorAll('[data-filter]').forEach(b => {
    const selected = b.dataset.filter === filter;
    b.classList.toggle('selected', selected); b.setAttribute('aria-pressed', selected);
  });
}
filterProjects();

function openPanel(kind, source) {
  opener = source || document.activeElement;
  let html = '';
  if (kind === 'about') html = `<div class="about-panel"><p class="eyebrow">01 / THE PERSON BEHIND THE DESK</p><div class="about-heading"><div class="profile-art" aria-hidden="true"><span>lq.</span><i></i></div><div><h2 id="panel-title">你好，<br>我是${profile.name}。</h2><p class="about-en">A CURIOUS MIND, ALWAYS.</p></div></div><p class="panel-lede">${safe(profile.description)}</p><div class="interest-list">${profile.interests.map((x,i)=>`<span><small>0${i+1}</small>${safe(x)}</span>`).join('')}</div><div class="panel-bottom"><p>我的故事，还在慢慢书写。</p><button class="text-link" data-open="contact">认识一下 ${arrow}</button></div></div>`;
  if (kind === 'work') html = `<p class="eyebrow">02 / SELECTED EXPLORATIONS</p><h2 id="panel-title">打开作品册。</h2><p class="panel-lede">一些视觉、界面与日常的探索。真实项目会陆续放进来。</p><div class="panel-projects">${projects.map(p => projectCard(p,true)).join('')}</div>`;
  if (kind === 'notes') html = `<p class="eyebrow">03 / NOTES FROM THE DESK</p><h2 id="panel-title">今天，也有<br>一点<span>小发现。</span></h2><div class="notes-list">${notes.map(n => `<article><span class="note-number">${n.no}</span><div><p class="eyebrow">${n.tag}</p><h3>${n.title}</h3><p>${n.text}</p></div><span class="note-asterisk" aria-hidden="true">✳</span></article>`).join('')}</div><p class="panel-footnote">工作室的开篇笔记 · 2026</p>`;
  if (kind === 'contact') html = `<div class="contact-panel"><div class="letter-illustration" aria-hidden="true"><span>hello.</span><i>LU QI</i></div><p class="eyebrow">04 / A LETTER TO THE STUDIO</p><h2 id="panel-title">很高兴，<br>在这里遇见你。</h2><p class="panel-lede">关于一个想法、一件作品，或者只是打个招呼。</p><a class="github-link" href="${profile.github}" target="_blank" rel="noopener noreferrer"><span>在 GitHub 找到我<small>@lq18016485319-gif</small></span>${arrow}</a>${profile.email ? `<a class="email-link" href="mailto:${safe(profile.email)}">${safe(profile.email)} ${arrow}</a><button class="copy-email" data-copy-email>复制邮箱</button>` : '<p class="contact-note">邮箱与其他联系方式，整理好后会放在这里。</p>'}</div>`;
  const project = projects.find(p => p.id === kind);
  if (project) html = `<button class="back-link" data-open="work">← 返回作品册</button><p class="eyebrow">${project.categoryName} / ${project.year}</p><h2 id="panel-title">${project.title}</h2><p class="project-subtitle">${project.english}</p><img class="detail-image" src="${project.image}" alt="${project.title}视觉练习"><p class="panel-lede">${project.description}</p><div class="project-information"><span>探索方向</span><p>${project.medium}</p></div><p class="project-disclosure">${project.note}</p>`;
  if (!html) return;
  content.innerHTML = html;
  panel.classList.toggle('project-detail', !!project);
  if (!panel.open) panel.showModal();
  document.body.classList.add('panel-open');
  panel.scrollTop = 0;
  document.querySelector('#close-panel').focus({preventScroll: true});
}
function closePanel() {
  panel.close(); document.body.classList.remove('panel-open');
  if (opener?.isConnected) opener.focus({preventScroll: true});
  window.dispatchEvent(new CustomEvent('studio:close'));
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-open]');
  if (b) { openPanel(b.dataset.open,b); window.dispatchEvent(new CustomEvent('studio:focus',{detail:b.dataset.open})); }
  const p = e.target.closest('[data-project]'); if(p) openPanel(p.dataset.project,p);
  const f = e.target.closest('[data-filter]'); if(f) filterProjects(f.dataset.filter);
  if(e.target.closest('[data-copy-email]')) {
    navigator.clipboard.writeText(profile.email).then(()=>toast('邮箱已复制')).catch(()=>toast('请长按邮箱地址复制'));
  }
});
document.querySelector('#close-panel').addEventListener('click', closePanel);
panel.addEventListener('cancel', e => {e.preventDefault(); closePanel();});
let backdropDown = false;
panel.addEventListener('pointerdown',e=>backdropDown = e.target === panel);
panel.addEventListener('click', e => {if(e.target === panel && backdropDown) closePanel();});
function toast(message) {const t = document.querySelector('#toast');t.textContent=message;t.classList.add('visible');setTimeout(()=>t.classList.remove('visible'),2500);}

window.addEventListener('studio:open', e => openPanel(e.detail));
document.querySelector('#reset-scene').addEventListener('click', () => window.dispatchEvent(new CustomEvent('studio:reset')));
const sections = document.querySelectorAll('main > section[id]');
const sectionObserver = new IntersectionObserver(entries => entries.forEach(e => {if(e.isIntersecting) document.querySelectorAll('.nav a').forEach(a=>a.classList.toggle('active',a.hash===`#${e.target.id}`));}),{rootMargin:'-15% 0px -55% 0px'});
sections.forEach(s => sectionObserver.observe(s));

function sceneFailure() {
  document.querySelector('#loading').classList.add('gone');
  document.querySelector('#studio-wrap').classList.add('scene-fallback');
  document.querySelector('#studio').innerHTML = '<div class="fallback-desk"><div class="fallback-screen"><span>LU QI<br><i>STUDIO</i></span></div><span class="fallback-book">a book<br>of ideas.</span><span class="fallback-cup"></span></div>';
}
import('./studio.js').then(m=>m.startStudio()).catch(sceneFailure);
