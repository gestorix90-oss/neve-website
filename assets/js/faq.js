/* =====================================================
   TreasuryWorks — FAQ Accordion & Interactions
   ===================================================== */

// --- Accordion FAQ Toggle ---
function toggleFaq(button) {
    const item = button.parentElement;
    const isActive = item.classList.contains('active');

    // Close all FAQ items in the same category
    const category = item.closest('.faq-category');
    if (category) {
        category.querySelectorAll('.faq-item').forEach(faq => {
            faq.classList.remove('active');
        });
    }

    // Toggle clicked item
    if (!isActive) {
        item.classList.add('active');
    }
}

// --- Open all FAQs in a category ---
function expandCategory(categoryIndex) {
    const categories = document.querySelectorAll('.faq-category');
    if (categories[categoryIndex]) {
        categories[categoryIndex].querySelectorAll('.faq-item').forEach(item => {
            item.classList.add('active');
        });
    }
}

// --- Close all FAQs ---
function collapseAll() {
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
}

// --- Search FAQ ---
function searchFAQ(query) {
    query = query.toLowerCase().trim();

    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question span:first-child');
        const answer = item.querySelector('.faq-answer');
        const text = (question.textContent + ' ' + answer.textContent).toLowerCase();

        if (query === '' || text.includes(query)) {
            item.style.display = '';
            if (query !== '' && text.includes(query)) {
                item.classList.add('active');
                // Highlight matching text
            }
        } else {
            item.style.display = 'none';
        }
    });
}

// --- Analytics: Track FAQ opens ---
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.querySelector('span').textContent;
            console.log(`[TreasuryWorks] FAQ aperta: ${question}`);
            // In futuro: invia evento a analytics
        });
    });

    // Smooth scroll to FAQ from URL hash
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Auto-expand if it's a FAQ item
                const faqItem = target.closest('.faq-item');
                if (faqItem) {
                    faqItem.querySelector('.faq-question').click();
                }
            }, 100);
        }
    }
});