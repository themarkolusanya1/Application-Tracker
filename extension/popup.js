document.addEventListener('DOMContentLoaded', async () => {
  const syncBtn = document.getElementById('sync-btn');
  const appTypeSelect = document.getElementById('app-type');
  const orgInput = document.getElementById('org');
  const titleInput = document.getElementById('role-title');
  const notesText = document.getElementById('notes');
  const statusMsg = document.getElementById('status-msg');

  function showStatus(text, isError = false) {
    statusMsg.innerText = text;
    statusMsg.className = isError ? 'status-error' : 'status-success';
    statusMsg.style.display = 'block';
  }

  // Get active tab and run scraper content script
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    // Detect default application type based on URL
    if (tab.url.includes('.edu') || tab.url.includes('admissions') || tab.url.includes('scholarship')) {
      appTypeSelect.value = 'scholarship';
    } else {
      appTypeSelect.value = 'job';
    }

    // Execute script on tab page to scrape text details
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrapePageData
    }, (results) => {
      if (results && results[0] && results[0].result) {
        const data = results[0].result;
        if (data.organization) orgInput.value = data.organization;
        if (data.title) titleInput.value = data.title;
        if (data.description) notesText.value = data.description;
        showStatus('Scraped page details successfully!');
      }
    });
  } catch (err) {
    console.error('Error pre-scraping page details:', err);
  }

  // Handle Sync button click
  syncBtn.addEventListener('click', async () => {
    const appData = {
      applicationType: appTypeSelect.value,
      organization: orgInput.value.trim(),
      title: titleInput.value.trim(),
      notes: notesText.value.trim(),
      status: appTypeSelect.value === 'scholarship' ? 'Researching' : 'WISH_LIST',
      appliedDate: new Date().toISOString(),
    };

    if (!appData.organization || !appData.title) {
      showStatus('Please provide both organization name and job/program title.', true);
      return;
    }

    syncBtn.disabled = true;
    syncBtn.innerText = 'Syncing...';

    try {
      // POST directly to local TrackIT API endpoint
      const response = await fetch('http://localhost:3000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appData)
      });

      const json = await response.json();
      if (json.success) {
        showStatus('Success! Application synced to TrackIT.');
        setTimeout(() => window.close(), 1500);
      } else {
        showStatus('Error: ' + (json.error || 'Failed to sync.'), true);
        syncBtn.disabled = false;
        syncBtn.innerText = 'Sync to TrackIT';
      }
    } catch (err) {
      showStatus('Connection failed. Make sure TrackIT local dev server is running at http://localhost:3000.', true);
      syncBtn.disabled = false;
      syncBtn.innerText = 'Sync to TrackIT';
    }
  });
});

// This function runs in the context of the user's active tab
function scrapePageData() {
  const url = window.location.href;
  let organization = '';
  let title = '';
  let description = '';

  if (url.includes('linkedin.com/jobs')) {
    // Scrape LinkedIn Job details
    const orgEl = document.querySelector('.job-details-jobs-unified-top-card__company-name, .top-card-layout__card .topcard__org-name-link');
    const titleEl = document.querySelector('.job-details-jobs-unified-top-card__job-title, .top-card-layout__title');
    const descEl = document.querySelector('.jobs-description-content__text, .description__text');
    
    if (orgEl) organization = orgEl.innerText.trim();
    if (titleEl) title = titleEl.innerText.trim();
    if (descEl) description = descEl.innerText.slice(0, 300).trim() + '...';
  } else {
    // Scrape generic page headers (H1 and page title) as fallbacks
    const h1El = document.querySelector('h1');
    if (h1El) title = h1El.innerText.trim();
    
    // Extract domain name as organization fallback
    const domain = window.location.hostname;
    organization = domain.replace('www.', '').split('.')[0];
    organization = organization.charAt(0).toUpperCase() + organization.slice(1);
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      description = metaDesc.getAttribute('content') || '';
    }
  }

  return { organization, title, description };
}
