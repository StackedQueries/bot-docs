// Copy-to-clipboard functionality for code blocks
(function() {
    function addCopyButtons() {
        const codeBlocks = document.querySelectorAll('pre code');
        
        codeBlocks.forEach((codeBlock) => {
            const pre = codeBlock.parentElement;
            
            // Skip if button already added
            if (pre.querySelector('.copy-button')) {
                return;
            }
            
            const button = document.createElement('button');
            button.className = 'copy-button';
            button.textContent = 'Copy';
            button.setAttribute('aria-label', 'Copy code to clipboard');
            
            button.addEventListener('click', async function() {
                const text = codeBlock.textContent || codeBlock.innerText;
                
                try {
                    await navigator.clipboard.writeText(text);
                    button.textContent = 'Copied!';
                    button.classList.add('copied');
                    
                    setTimeout(() => {
                        button.textContent = 'Copy';
                        button.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.select();
                    
                    try {
                        document.execCommand('copy');
                        button.textContent = 'Copied!';
                        button.classList.add('copied');
                        
                        setTimeout(() => {
                            button.textContent = 'Copy';
                            button.classList.remove('copied');
                        }, 2000);
                    } catch (e) {
                        button.textContent = 'Failed';
                    }
                    
                    document.body.removeChild(textArea);
                }
            });
            
            pre.style.position = 'relative';
            pre.appendChild(button);
        });
    }
    
    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addCopyButtons);
    } else {
        addCopyButtons();
    }
    
    // Also run after Prism.js highlights code (if it does so dynamically)
    if (window.Prism) {
        const originalHighlight = Prism.highlightElement;
        Prism.highlightElement = function(element, async, callback) {
            const result = originalHighlight.call(this, element, async, callback);
            setTimeout(addCopyButtons, 100);
            return result;
        };
    }
})();
