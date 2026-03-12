export const exportDashboardToPDF = async (
  elementId: string,
  filters: { cohort: string | null; module: string | null }
) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    return;
  }

  try {
    // Create a temporary print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export the dashboard.');
      return;
    }

    // Clone the element to manipulate it before printing
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Recharts uses inline styles that sometimes don't copy over well in innerHTML.
    // We need to ensure all SVG elements have explicit dimensions.
    // IMPORTANT: We must measure the ORIGINAL elements in the DOM, because the cloned
    // elements are not attached to the document and will return 0 for getBoundingClientRect().
    
    // 1. Fix ResponsiveContainers
    const origContainers = element.querySelectorAll('.recharts-responsive-container');
    const clonedContainers = clonedElement.querySelectorAll('.recharts-responsive-container');
    origContainers.forEach((orig, index) => {
      const rect = orig.getBoundingClientRect();
      const clone = clonedContainers[index] as HTMLElement;
      if (clone && rect.width && rect.height) {
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
      }
    });

    // 2. Fix Wrappers
    const origWrappers = element.querySelectorAll('.recharts-wrapper');
    const clonedWrappers = clonedElement.querySelectorAll('.recharts-wrapper');
    origWrappers.forEach((orig, index) => {
      const rect = orig.getBoundingClientRect();
      const clone = clonedWrappers[index] as HTMLElement;
      if (clone && rect.width && rect.height) {
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
      }
    });

    // 3. Fix SVGs
    const originalSvgs = element.querySelectorAll('svg');
    const clonedSvgs = clonedElement.querySelectorAll('svg');
    originalSvgs.forEach((origSvg, index) => {
      const rect = origSvg.getBoundingClientRect();
      const cloneSvg = clonedSvgs[index];
      if (cloneSvg && rect.width && rect.height) {
        cloneSvg.setAttribute('width', `${rect.width}px`);
        cloneSvg.setAttribute('height', `${rect.height}px`);
        cloneSvg.style.width = `${rect.width}px`;
        cloneSvg.style.height = `${rect.height}px`;
      }
      // Ensure SVG text is visible
      if (cloneSvg) {
        const texts = cloneSvg.querySelectorAll('text');
        texts.forEach(text => {
          text.style.fill = '#374151'; // Force dark gray text for print
        });
      }
    });

    // 4. Tag chart cards to force them to be full-width and avoid page breaks
    // We also select .bg-gradient-to-br to catch the Attendance Champions card
    const chartContainers = clonedElement.querySelectorAll('.recharts-responsive-container, .bg-gradient-to-br');
    chartContainers.forEach(container => {
      let current = container as HTMLElement;
      let cardFound = false;
      while (current && current !== clonedElement) {
        const className = current.className || '';
        // Find the closest card container
        if (typeof className === 'string' && (className.includes('bg-white') || className.includes('bg-gray') || className.includes('shadow') || className.includes('bg-gradient'))) {
          current.classList.add('print-chart-card');
          cardFound = true;
          break;
        }
        current = current.parentElement as HTMLElement;
      }
      // Fallback if no card found
      if (!cardFound && container.parentElement) {
        container.parentElement.classList.add('print-chart-card');
      }
    });

    const contentHtml = clonedElement.innerHTML;
    
    // Get all stylesheets from the current document
    const styleSheets = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('');
        } catch (e) {
          return '';
        }
      })
      .join('\n');

    // Build the print document
    const timestamp = new Date().toLocaleString();
    let filterText = 'Filters: ';
    filterText += filters.cohort ? `Cohort ${filters.cohort}` : 'All Cohorts';
    filterText += filters.module ? ` | Module: ${filters.module}` : ' | All Modules';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Data Dashboard Report - ${timestamp}</title>
          <style>
            ${styleSheets}
            
            /* Base styles to ensure Tailwind classes work */
            body {
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
              background-color: white !important;
              color: black !important;
              margin: 0;
              padding: 20px;
            }

            /* Custom print styles */
            @media print {
              @page {
                size: landscape;
                margin: 15mm;
              }
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              /* Force background colors to print */
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              /* Hide elements that shouldn't be printed */
              .no-print, button {
                display: none !important;
              }
              
              /* CRITICAL: Prevent cutting inside cards and charts */
              .bg-white, .rounded-xl, .rounded-lg, .shadow-sm {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }

              .recharts-wrapper, .recharts-responsive-container, svg {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              
              /* Ensure grid layouts don't break across pages */
              .grid {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              
              .grid > div {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              
              /* Make chart cards take full width to avoid squishing and force clean page breaks */
              .print-chart-card {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                grid-column: 1 / -1 !important; /* Force full width in grid */
                margin-bottom: 2rem !important;
              }
              
              /* Fix Attendance Champions card (gradient background with white text) for print */
              .bg-gradient-to-br {
                background: #f3f4f6 !important; /* Light gray fallback */
                background-image: none !important;
                border: 1px solid #e5e7eb !important;
                color: black !important;
              }
              .bg-gradient-to-br * {
                color: black !important;
              }
              .bg-white\\/10, .bg-white\\/20 {
                background-color: #ffffff !important;
                border: 1px solid #d1d5db !important;
              }
              .text-yellow-300 {
                color: #d97706 !important; /* Darker yellow/orange for print visibility */
              }
              
              /* Add a nice header */
              .print-header {
                background-color: #4f46e5 !important; /* Indigo 600 */
                color: white !important;
                padding: 20px;
                margin-bottom: 30px;
                border-radius: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                page-break-after: avoid !important;
                break-after: avoid !important;
              }
              .print-header h1 {
                margin: 0;
                font-size: 24px;
              }
              .print-header p {
                margin: 5px 0 0 0;
                font-size: 14px;
                opacity: 0.9;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <div>
              <h1>Data Dashboard Report</h1>
              <p>Generated: ${timestamp}</p>
            </div>
            <div style="text-align: right;">
              <p>${filterText}</p>
            </div>
          </div>
          <div id="${elementId}" class="p-4">
            ${contentHtml}
          </div>
          <script>
            // Wait for everything to render before printing
            window.onload = () => {
              // Give charts an extra moment to render their SVGs
              setTimeout(() => {
                window.print();
                // Only close if they actually printed or cancelled
                window.onafterprint = () => window.close();
              }, 1500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();

  } catch (error) {
    console.error('Failed to generate PDF:', error);
    alert('Failed to generate PDF. Please check the console for details.');
  }
};
