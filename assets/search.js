// Search functionality using Fuse.js
(function() {
    let searchIndex = [];
    let fuse = null;
    
    // Load search index
    async function loadSearchIndex() {
        try {
            // Calculate path to search-index.json based on current page location
            // search-index.json is always in the docs root
            const currentPath = window.location.pathname;
            // Count depth: how many directories deep are we?
            const pathParts = currentPath.split('/').filter(p => p && p !== 'index.html');
            const depth = pathParts.length - (currentPath.endsWith('.html') ? 1 : 0);
            const prefix = depth > 0 ? '../'.repeat(depth) : './';
            const indexPath = prefix + 'search-index.json';
            
            const response = await fetch(indexPath);
            if (response.ok) {
                const data = await response.json();
                searchIndex = data.pages || [];
                
                // Normalize URLs in search index to be relative to docs root
                searchIndex = searchIndex.map(page => {
                    // URLs in index are already relative to docs root
                    return page;
                });
                
                // Initialize Fuse.js
                fuse = new Fuse(searchIndex, {
                    keys: ['title', 'content', 'url'],
                    threshold: 0.3,
                    includeScore: true,
                    minMatchCharLength: 2
                });
            } else {
                console.warn('Search index not found at:', indexPath, 'Status:', response.status);
            }
        } catch (e) {
            console.warn('Search index not available:', e);
        }
    }
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSearchIndex);
    } else {
        loadSearchIndex();
    }
    
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('active');
            return;
        }
        
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 200);
    });
    
    function performSearch(query) {
        if (!fuse || searchIndex.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">Search index loading...</div>';
            searchResults.classList.add('active');
            return;
        }
        
        const results = fuse.search(query).slice(0, 10);
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
            searchResults.classList.add('active');
            return;
        }
        
        let html = '';
        results.forEach(result => {
            const item = result.item;
            const score = result.score;
            const url = item.url || '#';
            const title = item.title || 'Untitled';
            const snippet = item.content ? item.content.substring(0, 150) + '...' : '';
            
            // Calculate relative path from current page to result
            // URLs in search index are relative to docs root
            const currentPath = window.location.pathname;
            const currentParts = currentPath.split('/').filter(p => p && p !== 'index.html');
            const currentDepth = currentParts.length - (currentPath.endsWith('.html') ? 1 : 0);
            
            const resultParts = url.split('/').filter(p => p);
            const resultDepth = resultParts.length - (url.endsWith('.html') ? 1 : 0);
            
            const depthDiff = currentDepth - resultDepth;
            const relativePath = depthDiff > 0 ? '../'.repeat(depthDiff) + url : (depthDiff < 0 ? url : url);
            
            html += `
                <div class="search-result-item">
                    <a href="${relativePath}">
                        <div class="search-result-title">${title}</div>
                        <div class="search-result-snippet">${snippet}</div>
                    </a>
                </div>
            `;
        });
        
        searchResults.innerHTML = html;
        searchResults.classList.add('active');
    }
    
    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
    
    // Handle keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            searchResults.classList.remove('active');
            searchInput.blur();
        }
    });
})();
