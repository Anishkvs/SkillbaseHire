/**
 * WorkExperience — usage example
 *
 * Three integration modes:
 *   A) Pure client-side state (no backend)
 *   B) Flask REST API (fetch-based)
 *   C) Flask form POST (traditional HTML forms)
 */

import React from 'react';
import WorkExperience from './index';

// ── A) Standalone demo (no backend) ──────────────────────────────
export function Demo() {
  const sampleData = [
    {
      id: 1,
      company:     'Aspire Systems',
      designation: 'QA Automation Engineer',
      start_date:  '2022-06',
      end_date:    '',
      is_current:  true,
      description: 'Led end-to-end test automation using Selenium + Python. Reduced regression cycle by 60%.',
    },
    {
      id: 2,
      company:     'Infosys',
      designation: 'Junior QA Analyst',
      start_date:  '2020-07',
      end_date:    '2022-05',
      is_current:  false,
      description: 'Manual and exploratory testing for e-commerce platform.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F7] p-6 font-['Inter',sans-serif]">
      <div className="max-w-2xl mx-auto">
        <WorkExperience initialExperiences={sampleData} />
      </div>
    </div>
  );
}

// ── B) Flask REST API integration ───────────────────────────────
export function WithFlaskAPI() {
  const [experiences, setExperiences] = React.useState([]);

  React.useEffect(() => {
    fetch('/candidate/profile/experience')
      .then(r => r.json())
      .then(data => setExperiences(data.experiences ?? []));
  }, []);

  const handleSave = async (formData, editingId) => {
    const url = editingId !== null
      ? `/candidate/profile/experience/${editingId}`
      : '/candidate/profile/experience/add';
    const method = editingId !== null ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error('Save failed');
    const data = await res.json();
    return data;
  };

  const handleDelete = async (id) => {
    await fetch(`/candidate/profile/experience/${id}/delete`, { method: 'POST' });
  };

  return (
    <WorkExperience
      initialExperiences={experiences}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}

// ── C) Drop-in replacement inside candidate_profile.html ─────────
// Mount the React component into the existing Flask template:
//
//  In candidate_profile.html, replace the work experience card with:
//  <div id="work-experience-root"></div>
//
//  Then in a <script type="module"> at the bottom:
//
//  import { createRoot } from 'react-dom/client';
//  import WorkExperience from './react-components/WorkExperience/index.jsx';
//
//  const root = createRoot(document.getElementById('work-experience-root'));
//  root.render(
//    <WorkExperience
//      initialExperiences={JSON.parse(document.getElementById('exp-data').textContent)}
//      onSave={async (data, id) => {
//        const fd = new FormData();
//        Object.entries(data).forEach(([k, v]) => fd.append(k, v));
//        await fetch(id ? `/candidate/profile/experience/${id}` : '/candidate/profile/experience/add',
//          { method: 'POST', body: fd });
//      }}
//      onDelete={async (id) => {
//        await fetch(`/candidate/profile/experience/${id}/delete`, { method: 'POST' });
//      }}
//    />
//  );
