// Global variables to manage state
let currentOffset = null;
let isLoading = false;
let hasMoreRecords = true;
let activeCategory = '';

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Load categories first
    loadCategories();
    
    // Initial load of questions
    loadQuestions(true);
    
    // Set up event delegation for toggling question details
    document.getElementById('results').addEventListener('click', handleCardClick);
    
    // Set up event delegation for category filter buttons
    document.querySelector('.filter-bar').addEventListener('click', debounce(handleFilterClick, 200));
    
    // Set up filter scrolling buttons
    setupFilterScrolling();
    
    // Set up infinite scrolling
    setupInfiniteScroll();
});

// Function to safely handle API responses with fallbacks
function safelyParseApiResponse(responseText) {
  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.error('Error parsing API response:', e);
    // Return a safe fallback structure
    return { records: [], categories: [], offset: "DONE" };
  }
}

// Function to load categories from the API
async function loadCategories() {
    try {
        document.getElementById('error').style.display = 'none';
        
        console.log('Fetching categories from API');
        const response = await fetch('/api/categories');
        
        // Handle non-OK responses with more details
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP error! status: ${response.status}, body:`, errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseText = await response.text();
        
        // Safely parse the response
        const data = safelyParseApiResponse(responseText);
        console.log('Categories response:', data);
        
        // Create a safe categories array even if data structure is unexpected
        const categories = Array.isArray(data.categories) ? data.categories : [];
        
        // Update the category filter buttons
        updateCategoryFilters(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        const errorElement = document.getElementById('error');
        errorElement.textContent = 'Error loading categories. Please try refreshing the page.';
        errorElement.style.display = 'block';
        
        // Create empty categories as fallback
        updateCategoryFilters([]);
    }
}

// Function to load questions from the API
async function loadQuestions(initialLoad = false) {
    if (isLoading || (!hasMoreRecords && !initialLoad)) return;
    
    isLoading = true;
    document.getElementById('loading').style.display = 'block';
    document.getElementById('error').style.display = 'none';
    
    try {
        // Reset pagination on initial load
        if (initialLoad) {
            currentOffset = null;
            hasMoreRecords = true;
            document.getElementById('results').innerHTML = '';
            document.getElementById('no-more-questions').style.display = 'none';
            
            // Show skeleton loader on initial load
            const resultsContainer = document.getElementById('results');
            resultsContainer.innerHTML = `
                <div class="skeleton-loader">
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                </div>
            `;
        }
        
        // Build the URL with proper parameters
        let url = '/api/questions';
        
        // Add URL parameters
        const params = new URLSearchParams();
        
        // Only add offset if we have one and we're not doing an initial load
        if (currentOffset && currentOffset !== 'DONE' && !initialLoad) {
            params.append('offset', currentOffset);
        }
        
        // Add category filter if selected
        if (activeCategory) {
            params.append('category', activeCategory);
        }
        
        // Append params to URL if there are any
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        console.log(`Fetching URL: ${url}`);
        
        // Make the API request
        const response = await fetch(url);
        
        // Handle non-OK responses with more details
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP error! status: ${response.status}, body:`, errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseText = await response.text();
        
        // Safely parse the response
        const data = safelyParseApiResponse(responseText);
        
        console.log('Fetch Response:', {
            recordCount: data.records?.length || 0,
            offset: data.offset,
            currentOffset: currentOffset
        });
        
        // Create a safe records array even if structure is unexpected
        const records = Array.isArray(data.records) ? data.records : [];
        
        // Update pagination state
        if (!data.offset || data.offset === 'DONE') {
            hasMoreRecords = false;
            document.getElementById('no-more-questions').style.display = 'block';
        } else {
            currentOffset = data.offset;
        }
        
        console.log('New Current Offset:', currentOffset);
        
        // Remove skeleton loader on initial load
        if (initialLoad) {
            document.getElementById('results').innerHTML = '';
        }
        
        // Render the questions
        renderQuestions(records);
        
    } catch (error) {
        console.error('Error loading questions:', error);
        const errorElement = document.getElementById('error');
        errorElement.textContent = 'Error loading questions. Please try again later.';
        errorElement.style.display = 'block';
        
        // Remove skeleton loader on error if it was an initial load
        if (initialLoad) {
            document.getElementById('results').innerHTML = '';
        }
    } finally {
        isLoading = false;
        document.getElementById('loading').style.display = 'none';
    }
}

// Function to render questions to the DOM
function renderQuestions(questions) {
    // If no questions or empty array, handle gracefully
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        console.warn("No questions to render");
        return;
    }

    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();
    const resultsContainer = document.getElementById('results');
    
    questions.forEach(question => {
        // Skip invalid question objects
        if (!question || !question.fields) {
            console.warn("Skipping invalid question object", question);
            return;
        }

        // Create card container
        const card = document.createElement('div');
        card.className = 'card';
        
        // Create card content
        const content = document.createElement('div');
        content.className = 'card-content';
        
        // Add category if present
        if (question.fields['Category']) {
            const category = document.createElement('div');
            category.className = 'category';
            category.textContent = question.fields['Category'];
            content.appendChild(category);
        }
        
        // Add question text
        const questionText = document.createElement('h2');
        questionText.textContent = question.fields['Question Text'] || 'Untitled Question';
        content.appendChild(questionText);
        
        // Create a container for details that can be toggled
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'details-container';
        
        // Add "When to Use" if present
        if (question.fields['When to Use']) {
            const whenToUse = document.createElement('div');
            whenToUse.className = 'details';
            whenToUse.innerHTML = `<strong>When to Use</strong> ${question.fields['When to Use']}`;
            detailsContainer.appendChild(whenToUse);
        }
        
        // Add "Expected Outcome" if present
        if (question.fields['Expected Outcome']) {
            const expectedOutcome = document.createElement('div');
            expectedOutcome.className = 'details';
            expectedOutcome.innerHTML = `<strong>Expected Outcome</strong> ${question.fields['Expected Outcome']}`;
            detailsContainer.appendChild(expectedOutcome);
        }
        
        // Add "Variations" if present
        if (question.fields['Variations']) {
            const variations = document.createElement('div');
            variations.className = 'details';
            variations.innerHTML = `<strong>Variations</strong> ${question.fields['Variations']}`;
            detailsContainer.appendChild(variations);
        }
        
        // Add "Follow-Up Questions" if present
        if (question.fields['Follow-Up Questions']) {
            const followUp = document.createElement('div');
            followUp.className = 'details';
            
            // Replace "\n" escape sequences with commas
            const formattedFollowUp = question.fields['Follow-Up Questions'].replace(/\\n/g, ', ');
            
            followUp.innerHTML = `<strong>Follow-Up Questions</strong> ${formattedFollowUp}`;
            detailsContainer.appendChild(followUp);
        }
        
        // Add a "View Details" button
        const viewDetailsButton = document.createElement('button');
        viewDetailsButton.className = 'view-details-btn';
        viewDetailsButton.textContent = 'VIEW DETAILS';
        content.appendChild(viewDetailsButton);
        
        // Add details container to content
        content.appendChild(detailsContainer);
        
        // Add content to card
        card.appendChild(content);
        
        // Add card to fragment
        fragment.appendChild(card);
    });
    
    // Add all cards to DOM in a single operation
    resultsContainer.appendChild(fragment);
}

// Handle card click to toggle details
function handleCardClick(event) {
    // Check if the click was on a View Details button
    if (event.target.classList.contains('view-details-btn')) {
        const button = event.target;
        const detailsContainer = button.nextElementSibling; // Get the details container
        
        // Toggle visibility
        if (detailsContainer.style.display === 'none' || !detailsContainer.style.display) {
            detailsContainer.style.display = 'block';
            button.textContent = 'HIDE DETAILS';
        } else {
            detailsContainer.style.display = 'none';
            button.textContent = 'VIEW DETAILS';
        }
    }
}

// Handle filter button clicks
function handleFilterClick(event) {
    if (event.target.classList.contains('filter-btn')) {
        // Remove active class from all filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        event.target.classList.add('active');
        
        // Get category from data attribute
        activeCategory = event.target.dataset.category || '';
        
        // Reload questions with the new filter
        loadQuestions(true);
    }
}

// Update category filter buttons
function updateCategoryFilters(categories) {
    // Get the filter bar
    const filterBar = document.querySelector('.filter-bar');
    
    // Clear existing category buttons (except "All")
    const allButton = filterBar.querySelector('button[data-category=""]');
    filterBar.innerHTML = '';
    
    // Re-add the "All" button or create it if it doesn't exist
    if (allButton) {
        filterBar.appendChild(allButton);
    } else {
        const newAllButton = document.createElement('button');
        newAllButton.className = 'filter-btn active';
        newAllButton.dataset.category = '';
        newAllButton.textContent = 'All';
        filterBar.appendChild(newAllButton);
    }
    
    // Create a document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Add category buttons in sorted order
    const sortedCategories = categories.sort();
    sortedCategories.forEach(category => {
        if (category) { // Skip empty categories
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.dataset.category = category;
            button.textContent = category;
            fragment.appendChild(button);
        }
    });
    
    // Add all buttons to DOM in a single operation
    filterBar.appendChild(fragment);
    
    // Remove the placeholder if real categories are loaded
    const placeholder = document.querySelector('.filter-placeholder');
    if (placeholder && categories.length > 0) {
        placeholder.remove();
    }
}

// Setup horizontal filter scrolling
function setupFilterScrolling() {
    const scrollLeftBtn = document.getElementById('scroll-left');
    const scrollRightBtn = document.getElementById('scroll-right');
    const filterBar = document.querySelector('.filter-bar');
    
    if (!scrollLeftBtn || !scrollRightBtn || !filterBar) {
        console.error('Filter scrolling elements not found');
        return;
    }
    
    // Scroll distance for each button click
    const scrollAmount = 300;
    
    // Scroll right button click handler
    scrollRightBtn.addEventListener('click', () => {
        filterBar.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
    
    // Scroll left button click handler
    scrollLeftBtn.addEventListener('click', () => {
        filterBar.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    
    // Check scroll position to show/hide buttons appropriately
    function updateScrollButtonVisibility() {
        // Show/hide left scroll button based on scroll position
        if (filterBar.scrollLeft <= 0) {
            scrollLeftBtn.style.opacity = '0.3';
        } else {
            scrollLeftBtn.style.opacity = '1';
        }
        
        // Show/hide right scroll button based on whether we can scroll further right
        const canScrollRight = filterBar.scrollWidth > filterBar.clientWidth + filterBar.scrollLeft;
        if (!canScrollRight) {
            scrollRightBtn.style.opacity = '0.3';
        } else {
            scrollRightBtn.style.opacity = '1';
        }
    }
    
    // Initial check for button visibility
    updateScrollButtonVisibility();
    
    // Update button visibility when scrolling
    filterBar.addEventListener('scroll', updateScrollButtonVisibility);
    
    // Update button visibility when window resizes - with debounce
    window.addEventListener('resize', debounce(updateScrollButtonVisibility, 100));
}

// Setup infinite scrolling using Intersection Observer
function setupInfiniteScroll() {
    const sentinel = document.getElementById('sentinel');
    
    if (!sentinel) {
        console.error('Sentinel element not found for infinite scrolling');
        return;
    }
    
    // Create an observer
    const observer = new IntersectionObserver((entries) => {
        // If the sentinel is visible and we're not already loading
        if (entries[0].isIntersecting && !isLoading && hasMoreRecords) {
            // Load more questions
            loadQuestions(false);
        }
    });
    
    // Start observing the sentinel element
    observer.observe(sentinel);
}